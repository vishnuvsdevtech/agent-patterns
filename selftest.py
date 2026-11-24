#!/usr/bin/env python3
"""Asserts the properties the page claims. Run before every push."""
import sys

from patterns import get_brain, handle
from patterns import harness, tools
from patterns.budget import Budget

fails = []


def ok(cond, msg):
    if not cond:
        fails.append(msg)


def run(request, fail=None, overpromise=False, ceiling=0.02, approver=None):
    tools.reset()
    tools.FAIL_PLAN.update(fail or {})
    harness.OVERPROMISE = overpromise
    t = handle(request, get_brain(), budget=Budget(ceiling), approver=approver)
    return t, [s["kind"] for s in t["steps"]]


def yes(*a):
    return True


def no(*a):
    return False


# 1 happy path
t, k = run("Where is order 4471?")
ok("route" in k and "tool_call" in k and "answer" in k, "happy path missing a step")
ok("4471" in t["answer"], "answer does not carry the order it looked up")

# 2 retry recovers, and every attempt is on the record
t, k = run("What does it cost to ship 7 kg to zone C?", fail={"shipping_quote": 2})
ok(k.count("tool_error") == 2 and k.count("retry") == 2,
   f"expected 2 errors and 2 retries, saw {k.count('tool_error')}/{k.count('retry')}")
ok(t["ok"] and "606" in t["answer"], "shipping did not recover with the right price")

# 3 exhausted retries refuse instead of inventing
t, k = run("Where is order 4471?", fail={"lookup_order": 5})
ok(not t["ok"] and "not going to guess" in t["answer"], "exhausted retries should refuse")

# 4 drafting needs an approver; without one it must not call the tool
t, k = run("Draft a reply to a customer asking where their parcel is.")
ok(not t["ok"], "a tool flagged requires_approval ran with no approver")
ok("approval_denied" in k and "tool_call" not in k, "the denied call still reached the tool")
ok(t["budget"]["spent"] == 0, "a denied call was charged")

# 5 granted approval proceeds
t, k = run("Draft an apologetic reply about order 4471.", approver=yes)
ok(t["ok"] and "approval_granted" in k, "a granted approval did not proceed")
ok(t["budget"]["spent"] > 0, "a completed call was not charged")

# 6 the ceiling stops the run before it is exceeded
t, k = run("Quote 3 kg for zone A, zone B, zone C, zone A, zone B, zone C, zone A and zone B.",
           ceiling=0.02)
ok("budget_stop" in k, "eight quotes against a 0.02 ceiling did not stop")
ok(t["budget"]["spent"] <= 0.02 + 1e-9, "spend exceeded the ceiling")
ok(k.count("tool_result") == 6, f"expected 6 calls before the stop, saw {k.count('tool_result')}")

# 7 the judge catches an overpromise and the revision removes the sentence
t, k = run("Where is order 5102?", overpromise=True)
ok("judge" in k and "revise" in k, "judge/revise never ran")
ok("guarantee" not in t["answer"].lower(), "the promise survived the revision")

# 8 out of scope is refused, not guessed
t, k = run("What is the weather in Kochi today?")
ok(not t["ok"] and "refuse" in k, "out-of-scope request was not refused")

for f in fails:
    print("FAIL:", f)
print(f"{'ok' if not fails else str(len(fails)) + ' failing'} — 8 checks")
sys.exit(1 if fails else 0)
