"""Route → plan → budget → approval → call → retry → judge → revise.

Every step is recorded. The two guards that matter sit immediately before the
call: can this run afford it, and is a human required to say yes.
"""
import re
import time

from .budget import Budget
from .trace import Tracer
from .tools import TOOLS, ToolError

MAX_ATTEMPTS = 3

# Set by one scenario only: it makes the first draft overpromise, so the judge has
# something real to catch. Without a failing case the judged step is decoration.
OVERPROMISE = False


def handle(request: str, brain, tracer: Tracer | None = None,
           budget: Budget | None = None, approver=None) -> dict:
    """Run one request.

    budget:   what this run may spend; checked before every tool call.
    approver: callable(request, tool, args) -> bool, required by any tool flagged
              requires_approval. With no approver the call is denied, never run.
    """
    t = tracer or Tracer()
    budget = budget or Budget()
    t.add("request", "customer message", text=request.strip())
    t.add("budget", "run ceiling", ceiling=budget.ceiling)

    # 1. routing
    decision = brain.route(request)
    t.add("route", decision["route"], confidence=decision["confidence"], why=decision["why"])
    if decision["route"] == "out_of_scope":
        t.add("refuse", "out of scope",
              text="This harness only covers order status, shipping quotes and reply drafts.")
        return t.as_dict(request=request, ok=False, route=decision["route"],
                         budget=budget.as_dict(),
                         answer=("I can check order status, quote shipping, or draft a reply — "
                                 "that request is outside what I have tools for."))

    # 2. planning: one call, or a batch
    plan = brain.plan(request, decision["route"])
    calls = plan.get("calls") or [{"tool": plan["tool"], "args": plan.get("args") or {}}]
    if len(calls) > 1:
        t.add("plan", f"{len(calls)} calls", tools=[c["tool"] for c in calls])
    else:
        t.add("plan", calls[0]["tool"], args=calls[0].get("args") or {})

    facts, results = {}, []

    # 3. the guarded loop
    for current in calls:
        tool_name = current["tool"]
        tool_args = current.get("args") or {}
        spec = TOOLS.get(tool_name)
        if not spec:
            t.add("fail", "unknown tool", tool=tool_name)
            return t.as_dict(request=request, ok=False, route=decision["route"],
                             budget=budget.as_dict(),
                             answer=f"I have no tool called {tool_name}.")

        # 3a. can this run afford another call?
        if not budget.can_afford(tool_name):
            t.add("budget_stop", tool_name, cost=budget.price(tool_name), **budget.as_dict())
            return t.as_dict(request=request, ok=False, route=decision["route"],
                             budget=budget.as_dict(),
                             answer=(f"Stopping: this run has spent {budget.spent:.3f} of its "
                                     f"{budget.ceiling:.3f} ceiling, and one more call would exceed it. "
                                     f"I would rather stop than spend past the limit."))

        # 3b. does this action need a person?
        if spec.get("requires_approval"):
            t.add("approval_request", tool_name, args=tool_args, cost=budget.price(tool_name))
            allowed = bool(approver and approver(request, tool_name, tool_args))
            if not allowed:
                t.add("approval_denied", tool_name,
                      note="no approver said yes; the tool was not called")
                return t.as_dict(request=request, ok=False, route=decision["route"],
                                 budget=budget.as_dict(),
                                 answer=(f"That needs a person to approve it before I call "
                                         f"{tool_name}. Nothing was written or sent."))
            t.add("approval_granted", tool_name,
                  approver=getattr(approver, "__name__", "callback"))

        # 3c. call, retrying visibly
        result = None
        for attempt in range(MAX_ATTEMPTS):
            t.add("tool_call", tool_name, attempt=attempt + 1, args=tool_args)
            try:
                result = spec["fn"](**tool_args)
                spent = budget.charge(tool_name)
                t.add("tool_result", tool_name, attempt=attempt + 1, result=result)
                t.add("charge", tool_name, cost=budget.price(tool_name),
                      spent=spent, ceiling=budget.ceiling)
                break
            except ToolError as e:
                t.add("tool_error", tool_name, attempt=attempt + 1, error=str(e))
                if attempt + 1 < MAX_ATTEMPTS:
                    backoff = 0.05 * (2 ** attempt)
                    t.add("retry", tool_name, attempt=attempt + 1,
                          in_ms=round(backoff * 1000), reason="transient error")
                    time.sleep(backoff)
            except TypeError as e:
                t.add("tool_error", tool_name, attempt=attempt + 1, error=f"bad arguments: {e}")
                break

        if result is None:
            t.add("fail", "giving up",
                  text=f"{tool_name} failed {MAX_ATTEMPTS} times; not inventing a result.")
            return t.as_dict(request=request, ok=False, route=decision["route"],
                             budget=budget.as_dict(),
                             answer="Something is wrong upstream — I could not fetch that, "
                                    "so I am not going to guess. Please try again shortly.")

        results.append(result)

        # 4. shape the facts the answer is allowed to use
        if tool_name == "lookup_order":
            facts["order"] = result
        elif tool_name == "shipping_quote":
            facts.setdefault("quotes", []).append(result)
            facts["quote"] = result
        elif tool_name == "draft_reply":
            facts["draft"] = result
            facts["order"] = result.get("order") or facts.get("order")

    # 5. the answer is assembled from facts, never invented
    if "draft" in facts:
        answer = facts["draft"]["body"]
    elif "order" in facts:
        o = facts["order"]
        answer = (f"Order {o['order_id']} for {o['customer']} is {o['status']}. "
                  f"Placed {o['placed']}, expected {o['eta']}, {o['items']} item(s).")
        if OVERPROMISE:
            answer += " We guarantee delivery by Friday."
    elif facts.get("quotes"):
        q = facts["quotes"]
        if len(q) == 1:
            answer = (f"Shipping {q[0]['kg']:g} kg to zone {q[0]['zone']} is "
                      f"Rs {q[0]['total_inr']:.0f} ({q[0]['breakdown']}).")
        else:
            lines = "; ".join(f"{x['zone']} {x['kg']:g} kg Rs {x['total_inr']:.0f}" for x in q)
            answer = f"{len(q)} quotes: {lines}."
    else:
        answer = "Done."

    # 6. judge, then revise once if it fails
    verdict = brain.judge(request, answer, facts)
    t.add("judge", "self-check", passed=verdict["pass"], problems=verdict["problems"])
    if not verdict["pass"]:
        banned = re.compile(r"\b(guarantee|guaranteed|promise|definitely|100%)\b", re.I)
        fixed = " ".join(x for x in re.split(r"(?<=[.!?])\s+", answer) if not banned.search(x))
        if facts.get("order") and str(facts["order"]["order_id"]) not in fixed:
            fixed = f"About order {facts['order']['order_id']}: " + fixed
        t.add("revise", "answer rewritten", before=answer, after=fixed.strip(),
              because=verdict["problems"])
        answer = fixed.strip()
        again = brain.judge(request, answer, facts)
        t.add("judge", "self-check after revision", passed=again["pass"],
              problems=again["problems"])

    t.add("answer", "delivered", chars=len(answer))
    return t.as_dict(request=request, ok=True, route=decision["route"],
                     budget=budget.as_dict(), answer=answer)
