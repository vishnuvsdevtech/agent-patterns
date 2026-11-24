"""What a run is allowed to cost, and where it stops.

An agent that can call tools in a loop can spend money in a loop. The guard is
deliberately boring: every tool has a price, every run has a ceiling, and the
harness checks affordability *before* the call rather than totalling the damage
afterwards.
"""

# A price per call, in the same units as the ceiling. Real numbers would come from
# token counts per tool; these are the shape of the thing.
PRICE = {
    "lookup_order": 0.004,
    "shipping_quote": 0.003,
    "draft_reply": 0.006,
}

DEFAULT_CEILING = 0.02


class Budget:
    def __init__(self, ceiling: float = DEFAULT_CEILING):
        self.ceiling = ceiling
        self.spent = 0.0
        self.calls = 0

    def price(self, tool: str) -> float:
        return PRICE.get(tool, 0.004)

    def can_afford(self, tool: str) -> bool:
        return round(self.spent + self.price(tool), 6) <= self.ceiling + 1e-9

    def charge(self, tool: str) -> float:
        self.spent = round(self.spent + self.price(tool), 6)
        self.calls += 1
        return self.spent

    def as_dict(self) -> dict:
        return {"ceiling": self.ceiling, "spent": self.spent, "calls": self.calls,
                "left": round(self.ceiling - self.spent, 6)}
