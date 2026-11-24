"""An append-only record of what the agent did, written as it happens.

The trace is the deliverable. An agent that cannot show its work is
indistinguishable from a model inventing an answer, and the first question in
any review is "what did it actually call?".
"""
from dataclasses import dataclass, field, asdict
import time


@dataclass
class Step:
    i: int
    kind: str            # route | tool_call | tool_error | retry | tool_result | judge | revise | answer | refuse
    name: str
    ms: float
    attempt: int = 0
    detail: dict = field(default_factory=dict)


class Tracer:
    def __init__(self):
        self.steps: list[Step] = []
        self.t0 = time.perf_counter()

    def add(self, kind: str, name: str, attempt: int = 0, **detail) -> Step:
        s = Step(
            i=len(self.steps) + 1,
            kind=kind,
            name=name,
            ms=round((time.perf_counter() - self.t0) * 1000, 2),
            attempt=attempt,
            detail=detail,
        )
        self.steps.append(s)
        return s

    def as_dict(self, **extra) -> dict:
        return {
            "steps": [asdict(s) for s in self.steps],
            "total_ms": round((time.perf_counter() - self.t0) * 1000, 2),
            **extra,
        }
