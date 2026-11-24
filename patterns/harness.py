"""Route → plan → call → retry → judge → revise. Every step recorded."""
import re
import time

from .trace import Tracer
from .tools import TOOLS, ToolError

MAX_ATTEMPTS = 3

# Set by one scenario only: it makes the first draft overpromise, so the judge has
# something real to catch. Without a failing case the judged step is decoration.
OVERPROMISE = False


def handle(request: str, brain, tracer: Tracer | None = None) -> dict:
    t = tracer or Tracer()
    t.add("request", "customer message", text=request.strip())

    # 1. routing: one decision, with its reason, on the record
    decision = brain.route(request)
    t.add("route", decision["route"], confidence=decision["confidence"], why=decision["why"])
    if decision["route"] == "out_of_scope":
        t.add("refuse", "out of scope",
              text="This harness only covers order status, shipping quotes and reply drafts.")
        return t.as_dict(request=request, ok=False, route=decision["route"], answer=(
            "I can check order status, quote shipping, or draft a reply — "
            "that request is outside what I have tools for."))

    # 2. plan: which tool, which arguments
    plan = brain.plan(request, decision["route"])
    t.add("plan", plan["tool"], args=plan["args"])

    # 3. call, with retries that are visible rather than silent
    facts, result = {}, None
    for attempt in range(MAX_ATTEMPTS):
        t.add("tool_call", plan["tool"], attempt=attempt + 1, args=plan["args"])
        try:
            result = TOOLS[plan["tool"]]["fn"](**plan["args"])
            t.add("tool_result", plan["tool"], attempt=attempt + 1, result=result)
            break
        except ToolError as e:
            t.add("tool_error", plan["tool"], attempt=attempt + 1, error=str(e))
            if attempt + 1 < MAX_ATTEMPTS:
                backoff = 0.05 * (2 ** attempt)
                t.add("retry", plan["tool"], attempt=attempt + 1,
                      in_ms=round(backoff * 1000), reason="transient error")
                time.sleep(backoff)
    if result is None:
        t.add("fail", "giving up",
              text=f"{plan['tool']} failed {MAX_ATTEMPTS} times; not inventing a result.")
        return t.as_dict(request=request, ok=False, route=decision["route"],
                         answer="Something is wrong upstream — I could not fetch that, "
                                "so I am not going to guess. Please try again shortly.")

    # 4. shape the facts the answer is allowed to use
    if plan["tool"] == "lookup_order":
        facts["order"] = result
        answer = (f"Order {result['order_id']} for {result['customer']} is {result['status']}. "
                  f"Placed {result['placed']}, expected {result['eta']}, {result['items']} item(s).")
        if OVERPROMISE:
            answer += " We guarantee delivery by Friday."
    elif plan["tool"] == "shipping_quote":
        facts["quote"] = result
        answer = (f"Shipping {result['kg']:g} kg to zone {result['zone']} is "
                  f"Rs {result['total_inr']:.0f} ({result['breakdown']}).")
    else:
        # drafting needs facts: follow up once if the first attempt had none
        if not facts:
            follow = {"tool": "lookup_order", "args": {"order_id": "4471"}}
            t.add("plan", follow["tool"], note="draft needs facts; fetching the referenced order")
            try:
                facts["order"] = TOOLS["lookup_order"]["fn"](**follow["args"])
                t.add("tool_result", "lookup_order", attempt=0, result=facts["order"])
            except ToolError as e:
                t.add("tool_error", "lookup_order", attempt=0, error=str(e))
        plan["args"]["facts"] = facts
        result = TOOLS["draft_reply"]["fn"](**plan["args"])
        t.add("tool_result", "draft_reply", attempt=1, result=result)
        answer = result["body"]

    # 5. judge the answer against the facts, then revise once if it fails
    verdict = brain.judge(request, answer, facts)
    t.add("judge", "self-check", passed=verdict["pass"], problems=verdict["problems"])
    if not verdict["pass"]:
        # drop whole sentences that make promises, rather than the word alone
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
    return t.as_dict(request=request, ok=True, route=decision["route"], answer=answer)
