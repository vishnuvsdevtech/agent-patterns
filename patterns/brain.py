"""The brain is swappable; the harness is the product.

`RuleBrain` answers with rules so the repo runs with no key, no network and no
cost. `ModelBrain` has the same three methods and calls an OpenAI-compatible
endpoint when DEEPSEEK_API_KEY is set. Everything that makes this an agent —
routing decisions being recorded, tools being retried, output being judged —
lives outside the brain, which is the point.
"""
import json
import os
import re
import urllib.request


class RuleBrain:
    """Deterministic stand-in for a model. Every decision states its reason."""

    name = "rule"

    def route(self, request: str) -> dict:
        """Score every candidate and take the strongest.

        Taking the first match routed "draft a reply … where their parcel is" to
        order status, because "parcel" appears before the ask. The verb is the
        intent, so an explicit "draft / write / reply" outweighs an incidental
        mention of an order. The weights are the whole router, and they are here
        rather than hidden in a prompt so they can be argued with.
        """
        q = request.lower()
        scores: list[tuple[int, str, str]] = []

        def hit(route: str, weight: int, pattern: str, reason: str) -> None:
            if re.search(pattern, q):
                scores.append((weight, route, reason))

        hit("order_status", 2, r"\border\b|\b(4471|5102|6630)\b|where.*(parcel|order)",
            "mentions an order")
        hit("shipping_quote", 2, r"ship|deliver.*cost|freight|zone\s*[abc]|\d+\s*kg|weight",
            "asks about shipping or weight")
        hit("draft_reply", 3, r"\bdraft\b|\bwrite\b|\bcompose\b|reply|email|message them",
            "asks for a written reply")
        # several zones in one ask: a batch, which is what makes a spend ceiling
        # testable without inventing a fake loop
        if len(re.findall(r"zone\s*[abc]", q)) >= 3:
            scores.append((4, "shipping_batch", "asks for several shipping quotes at once"))

        if not scores:
            return {"route": "out_of_scope", "confidence": 0.0,
                    "why": ["no tool in this harness covers that request"]}

        scores.sort(key=lambda s: -s[0])
        top = scores[0][0]
        winners = [s for s in scores if s[0] == top]
        conf = 0.9 if len(winners) == 1 else 0.6
        return {"route": winners[0][1], "confidence": conf,
                "why": [f"{r}: {why} (weight {w})" for w, r, why in scores]}

    def plan(self, request: str, route: str) -> dict:
        q = request.lower()
        if route == "shipping_batch":
            zones = [z.upper() for z in re.findall(r"zone\s*([abc])", q)]
            kgs = [float(x) for x in re.findall(r"(\d+(?:\.\d+)?)\s*kg", q)] or [3.0]
            return {"calls": [{"tool": "shipping_quote",
                               "args": {"zone": z, "kg": kgs[i % len(kgs)]}}
                              for i, z in enumerate(zones)]}
        if route == "order_status":
            m = re.search(r"\b(\d{3,6})\b", q)
            return {"tool": "lookup_order", "args": {"order_id": m.group(1) if m else "4471"}}
        if route == "shipping_quote":
            zone = "B"
            m = re.search(r"zone\s*([abc])", q)
            if m:
                zone = m.group(1).upper()
            kg = 3.0
            m = re.search(r"(\d+(?:\.\d+)?)\s*kg", q)
            if m:
                kg = float(m.group(1))
            return {"tool": "shipping_quote", "args": {"zone": zone, "kg": kg}}
        tone = "apologetic" if re.search(r"late|delay|sorry|complain", q) else "plain"
        return {"tool": "draft_reply", "args": {"tone": tone, "facts": {}}}

    def judge(self, request: str, answer: str, facts: dict) -> dict:
        """Cheap checker: does the answer use the facts it was given, or invent?"""
        problems = []
        if not answer.strip():
            problems.append("empty answer")
        if len(answer) > 600:
            problems.append("longer than a customer reply should be")
        if facts.get("order") and str(facts["order"].get("order_id")) not in answer:
            problems.append("does not mention the order it looked up")
        if facts.get("quote") and "Rs" not in answer and "₹" not in answer:
            problems.append("does not state a price")
        if re.search(r"\b(guarantee|promise|definitely|100%)\b", answer, re.I):
            problems.append("promises an outcome it cannot know")
        return {"pass": not problems, "problems": problems}


class ModelBrain(RuleBrain):
    """Same interface, real model. Only used when a key is present."""

    name = "model"

    def __init__(self):
        self.key = os.environ.get("DEEPSEEK_API_KEY", "")
        self.model = os.environ.get("AGENT_MODEL", "deepseek-chat")

    def _ask(self, system: str, user: str) -> str:
        req = urllib.request.Request(
            "https://api.deepseek.com/chat/completions",
            data=json.dumps({"model": self.model, "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}],
                "temperature": 0}).encode(),
            headers={"Content-Type": "application/json",
                     "Authorization": f"Bearer {self.key}"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)["choices"][0]["message"]["content"]

    def plan(self, request: str, route: str) -> dict:
        if not self.key:
            return super().plan(request, route)
        try:
            raw = self._ask(
                "Choose one tool and its arguments. Reply with JSON only: "
                '{"tool": "...", "args": {...}}. Tools: ' + json.dumps(
                    {k: v["purpose"] for k, v in __import__("patterns.tools",
                     fromlist=["TOOLS"]).TOOLS.items()}),
                f"Route: {route}\nRequest: {request}")
            return json.loads(raw[raw.index("{"): raw.rindex("}") + 1])
        except Exception:
            return super().plan(request, route)      # never fail the run on the model


def get_brain() -> RuleBrain:
    b = ModelBrain()
    return b if b.key else RuleBrain()
