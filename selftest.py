#!/usr/bin/env python3
"""Asserts the properties the page claims. Run before every push."""
import sys
from patterns import get_brain, handle
from patterns import harness, tools


def run(request, fail=None, overpromise=False):
    tools.reset()
    tools.FAIL_PLAN.update(fail or {})
    harness.OVERPROMISE = overpromise
    t = handle(request, get_brain())
    kinds = [s["kind"] for s in t["steps"]]
    return t, kinds


def main() -> int:
    fails = []

    t, k = run("Where is order 4471?")
    if "route" not in k or "tool_call" not in k or "answer" not in k:
        fails.append("happy path missing route/tool_call/answer")
    if "4471" not in t["answer"]:
        fails.append("answer does not carry the order it looked up")

    t, k = run("What does it cost to ship 7 kg to zone C?", fail={"shipping_quote": 2})
    if k.count("tool_error") != 2 or k.count("retry") != 2:
        fails.append(f"expected 2 errors and 2 retries, saw {k.count('tool_error')}/{k.count('retry')}")
    if not t["ok"]:
        fails.append("shipping did not recover after retries")
    if "600" not in t["answer"] and "Rs" not in t["answer"]:
        fails.append("shipping answer has no price")

    t, k = run("Where is order 4471?", fail={"lookup_order": 5})
    if t["ok"] or "not going to guess" not in t["answer"]:
        fails.append("exhausted retries should refuse, not invent")

    t, k = run("Draft a reply to a customer asking where their parcel is.")
    if t["route"] != "draft_reply":
        fails.append(f"a request to draft routed to {t['route']} instead")
    if "draft_reply" not in [s["name"] for s in t["steps"]]:
        fails.append("the draft tool never ran on a drafting request")

    t, k = run("Where is order 5102?", overpromise=True)
    if "judge" not in k or "revise" not in k:
        fails.append("judge/revise never ran on the overpromising draft")
    if "guarantee" in t["answer"].lower():
        fails.append("the promise survived the revision")

    t, k = run("What is the weather in Kochi today?")
    if t["ok"] or "refuse" not in k:
        fails.append("out-of-scope request was not refused")

    for f in fails:
        print("FAIL:", f)
    print(f"{'ok' if not fails else str(len(fails)) + ' failing'} — 5 scenarios")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
