#!/usr/bin/env python3
"""Run the scenarios and write one trace file each.

Five cases, chosen to exercise a different part of the harness:
  1 order-status      the happy path
  2 shipping quote    a tool that fails twice, then succeeds  (retry)
  3 draft reply       a route that needs facts gathered first (chaining)
  4 late order        a first draft that overpromises        (judge + revise)
  5 weather           a request with no tool                (routing refusal)
"""
import json
import pathlib

from patterns import get_brain, handle
from patterns import harness, tools

OUT = pathlib.Path(__file__).parent / "traces"

SCENARIOS = [
    {
        "id": "order-status",
        "title": "Where is my order?",
        "request": "Where is order 4471?",
        "shows": ["routing", "tool use"],
    },
    {
        "id": "shipping-retry",
        "title": "Shipping that fails twice",
        "request": "What does it cost to ship 7 kg to zone C?",
        "shows": ["tool use", "retry with backoff"],
        "fail": {"shipping_quote": 2},
    },
    {
        "id": "draft-reply",
        "title": "Draft a reply",
        "request": "Draft a reply to a customer asking where their parcel is.",
        "shows": ["routing", "chaining: fetch facts, then write"],
    },
    {
        "id": "judge-revise",
        "title": "A draft that overpromises",
        "request": "Where is order 5102?",
        "shows": ["evaluator", "revision"],
        "overpromise": True,
    },
    {
        "id": "out-of-scope",
        "title": "Something with no tool",
        "request": "What is the weather in Kochi today?",
        "shows": ["routing refusal"],
    },
]


def run_all() -> list[dict]:
    OUT.mkdir(exist_ok=True)
    brain = get_brain()
    index = []
    for sc in SCENARIOS:
        tools.reset()
        tools.FAIL_PLAN.update(sc.get("fail", {}))
        harness.OVERPROMISE = bool(sc.get("overpromise"))
        trace = handle(sc["request"], brain)
        trace.update(id=sc["id"], title=sc["title"], shows=sc["shows"],
                     route=next((s["name"] for s in trace["steps"] if s["kind"] == "route"), None),
                     attempt_count=sum(1 for s in trace["steps"] if s["kind"] == "tool_call"))
        (OUT / f"{sc['id']}.json").write_text(json.dumps(trace, indent=2))
        index.append({k: trace[k] for k in ("id", "title", "request", "route", "ok", "shows", "total_ms")})
        kinds = " ".join(s["kind"] for s in trace["steps"])
        print(f"{sc['id']:14} ok={str(trace['ok']):5} steps={len(trace['steps']):2} {trace['total_ms']:7.1f}ms  {kinds}")
    (OUT / "index.json").write_text(json.dumps(index, indent=2))
    # the page reads one generated file rather than fetching five, so it works
    # from disk, from Pages, and offline
    bundle = [json.loads((OUT / f"{sc['id']}.json").read_text()) for sc in SCENARIOS]
    (OUT.parent / "assets" / "traces.js").write_text(
        "window.TRACES = " + json.dumps(bundle, indent=1) + ";\n")
    return index


if __name__ == "__main__":
    run_all()
