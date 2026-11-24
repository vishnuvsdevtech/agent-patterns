#!/usr/bin/env python3
"""Run the scenarios and write one trace file each.

Eight cases, chosen to exercise a different part of the harness:
  1 order-status      the happy path
  2 shipping-retry    a tool that fails twice, then succeeds        (retry)
  3 draft-reply       routing that needs facts gathered first       (chaining)
  4 late order        a first draft that overpromises               (judge + revise)
  5 weather           a request with no tool                        (refusal)
  6 spend-guard       eight quotes against a 0.02 ceiling           (budget stop)
  7 approval-granted  a customer reply a human allows               (gate open)
  8 approval-denied   the same reply, denied                        (gate shut)
"""
import json
import pathlib

from patterns import get_brain, handle
from patterns import harness, tools
from patterns.budget import Budget

OUT = pathlib.Path(__file__).parent / "traces"


def yes(request, tool, args):
    return True


def no(request, tool, args):
    return False


SCENARIOS = [
    {"id": "order-status", "title": "Where is my order?",
     "request": "Where is order 4471?", "shows": ["routing", "tool use"]},
    {"id": "shipping-retry", "title": "Shipping that fails twice",
     "request": "What does it cost to ship 7 kg to zone C?",
     "shows": ["tool use", "retry with backoff"], "fail": {"shipping_quote": 2}},
    {"id": "draft-reply", "title": "Draft a reply",
     "request": "Draft a reply to a customer asking where their parcel is.",
     "shows": ["routing", "chaining: fetch facts, then write"],
     "approve": True},
    {"id": "judge-revise", "title": "A draft that overpromises",
     "request": "Where is order 5102?", "shows": ["evaluator", "revision"],
     "overpromise": True},
    {"id": "out-of-scope", "title": "Something with no tool",
     "request": "What is the weather in Kochi today?", "shows": ["routing refusal"]},
    {"id": "spend-guard", "title": "Eight quotes, one ceiling",
     "request": ("Quote 3 kg for zone A, zone B, zone C, zone A, zone B, zone C, "
                 "zone A and zone B."),
     "shows": ["spend guard"], "ceiling": 0.02},
    {"id": "approval-granted", "title": "A reply a human allows",
     "request": "Draft an apologetic reply about order 4471.",
     "shows": ["approval gate, granted"], "approve": True},
    {"id": "approval-denied", "title": "The same reply, denied",
     "request": "Draft an apologetic reply about order 4471.",
     "shows": ["approval gate, denied"], "approve": False},
]


def run_all() -> list[dict]:
    OUT.mkdir(exist_ok=True)
    brain = get_brain()
    index = []
    for sc in SCENARIOS:
        tools.reset()
        tools.FAIL_PLAN.update(sc.get("fail", {}))
        harness.OVERPROMISE = bool(sc.get("overpromise"))
        approver = None
        if "approve" in sc:
            approver = yes if sc["approve"] else no
        trace = handle(sc["request"], brain,
                       budget=Budget(sc.get("ceiling", 0.02)),
                       approver=approver)
        trace.update(id=sc["id"], title=sc["title"], shows=sc["shows"],
                     step_count=len(trace["steps"]))
        (OUT / f"{sc['id']}.json").write_text(json.dumps(trace, indent=2))
        index.append({k: trace.get(k) for k in
                      ("id", "title", "request", "route", "ok", "shows", "total_ms", "budget")})
        kinds = " ".join(s["kind"] for s in trace["steps"])
        print(f"{sc['id']:18} ok={str(trace['ok']):5} steps={len(trace['steps']):2} "
              f"{trace['total_ms']:7.1f}ms  spent={trace['budget']['spent']:.3f}  {kinds}")
    (OUT / "index.json").write_text(json.dumps(index, indent=2))
    bundle = [json.loads((OUT / f"{sc['id']}.json").read_text()) for sc in SCENARIOS]
    (OUT.parent / "assets" / "traces.js").write_text("window.TRACES = " + json.dumps(bundle, indent=1) + ";\n")
    return index


if __name__ == "__main__":
    run_all()
