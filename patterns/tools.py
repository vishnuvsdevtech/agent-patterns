"""Three small tools with real work in them, plus a way to make them fail.

A tool that always succeeds proves nothing about the harness. `FAIL_PLAN` lets a
scenario declare "this tool fails twice, then works", so the retry path is
exercised deterministically instead of hoped for.
"""
import json
import time

FAIL_PLAN: dict[str, int] = {}      # tool name -> how many attempts should fail
_calls: dict[str, int] = {}         # tool name -> attempts so far


class ToolError(Exception):
    pass


ORDERS = {
    "4471": {"customer": "Nithya R", "status": "in transit", "zone": "B",
             "placed": "2026-11-18", "eta": "2026-11-25", "items": 2},
    "5102": {"customer": "Anoop S", "status": "delivered", "zone": "A",
             "placed": "2026-11-11", "eta": "2026-11-16", "items": 1},
    "6630": {"customer": "Meera T", "status": "packing", "zone": "C",
             "placed": "2026-11-22", "eta": "2026-12-01", "items": 5},
}

RATES_PER_ZONE = {"A": 40, "B": 65, "C": 90}   # rupees, per kg, surface
PER_KG_OVER_5 = 12                             # discount on the tail past 5 kg


def _maybe_fail(name: str) -> None:
    _calls[name] = _calls.get(name, 0) + 1
    left = FAIL_PLAN.get(name, 0)
    if left and _calls[name] <= left:
        raise ToolError(f"{name}: upstream returned 503 (attempt {_calls[name]})")


def reset() -> None:
    _calls.clear()
    FAIL_PLAN.clear()


def lookup_order(order_id: str) -> dict:
    """Read an order out of the CRM snapshot."""
    _maybe_fail("lookup_order")
    order = ORDERS.get(str(order_id).strip())
    if not order:
        raise ToolError(f"order {order_id} not found")
    return {"order_id": order_id, **order}


def shipping_quote(zone: str, kg: float) -> dict:
    """Price a shipment. The flaky one, on purpose."""
    _maybe_fail("shipping_quote")
    zone = str(zone).strip().upper()
    if zone not in RATES_PER_ZONE:
        raise ToolError(f"unknown zone {zone!r}; known zones are A, B, C")
    kg = float(kg)
    base = RATES_PER_ZONE[zone] * min(kg, 5)
    tail = max(0.0, kg - 5) * (RATES_PER_ZONE[zone] - PER_KG_OVER_5)
    total = round(base + tail, 2)
    return {"zone": zone, "kg": kg, "rate_per_kg": RATES_PER_ZONE[zone],
            "total_inr": total, "breakdown": f"{min(kg,5):g} kg x {RATES_PER_ZONE[zone]} + {max(0.0, kg-5):g} kg x {RATES_PER_ZONE[zone]-PER_KG_OVER_5}"}


def draft_reply(order_id: str, tone: str = "plain") -> dict:
    """Write a reply about one real order, using that order's own facts."""
    _maybe_fail("draft_reply")
    order = lookup_order(order_id)
    body = (f"Hello {order['customer']}, order {order['order_id']} is {order['status']} "
            f"and should reach you by {order['eta']}. If it has not arrived by then, "
            f"reply to this message and we will chase it.")
    if (tone or "plain").lower() == "apologetic":
        body = "Sorry for the trouble. " + body
    # the facts travel back with the draft: the judge needs them to check that the
    # answer uses what was looked up rather than inventing a date
    return {"order": order, "tone": tone, "body": body, "chars": len(body)}


TOOLS = {
    "lookup_order": {
        "fn": lookup_order,
        "purpose": "read one order from the CRM",
        "args": {"order_id": "string"},
    },
    "shipping_quote": {
        "fn": shipping_quote,
        "purpose": "price a shipment by zone and weight",
        "args": {"zone": "A|B|C", "kg": "number"},
    },
    "draft_reply": {
        # sending something to a customer is not a decision the agent gets to make
        "requires_approval": True,
        "fn": draft_reply,
        "purpose": "write a customer reply from facts already gathered",
        "args": {"tone": "string", "facts": "object"},
    },
}
