# Agent harness — five recorded runs

**Live:** https://vishnuvsdevtech.github.io/agent-patterns/

A small agent harness in plain Python — routing, tool calls, retries with backoff,
a judge that can disagree, and a refusal path — with every step written to a trace
as it happens. The page replays those traces. Nothing on it is illustrated.

## The five runs

| Run | What it exercises | Outcome |
|---|---|---|
| `order-status` | routing, one tool call | answered |
| `shipping-retry` | a tool returning 503 twice, retried with backoff | recovered on attempt 3 |
| `draft-reply` | routing corrected, then chaining: fetch facts, then write | answered |
| `judge-revise` | a draft that promises a date it cannot know | judge catches it, revision drops the sentence |
| `out-of-scope` | a request no tool covers | refused, not guessed |

Two of the five fail on purpose. Without them the other three prove nothing.

## Run it

```bash
python3 cli.py        # runs all five, writes traces/*.json and assets/traces.js
python3 selftest.py   # asserts the properties the page claims
open index.html
```

Standard library only. No key, no network, no dependencies.

## Design decisions worth arguing with

**The brain is swappable; the harness is the product.** `RuleBrain` answers with
rules so the repo runs anywhere for free, and every routing decision shows its
weights. `ModelBrain` has the same three methods and calls an OpenAI-compatible
endpoint when `DEEPSEEK_API_KEY` is set. Routing, retries, judging and tracing
live outside the brain because that is where the engineering is — a model swap
changes one file.

**The router scores rather than matches.** The first version took the first
matching pattern, so *"draft a reply to a customer asking where their parcel is"*
routed to **order status**, because "parcel" appeared before the ask. The trace is
what exposed it. The fix was weights — an explicit *draft / write / reply*
outranks an incidental mention — and a self-test assertion so it cannot regress
silently.

**Retries are visible.** Every attempt is a step with its number, the error text
and the backoff it waited. A retry that happens silently is indistinguishable from
a slow call, and when it fails three times the harness **refuses rather than
substitutes a plausible number**.

**The judge has something to catch.** One scenario deliberately overpromises
("We guarantee delivery by Friday."). The judge flags it, the revision drops the
whole sentence — not just the verb — and a second pass confirms. The revision is
sentence-level because deleting the word leaves "We delivery by Friday."

## Limits, stated rather than discovered

- **The 503s are injected**, not real outages. The retry path is real; the failure
  is scheduled by `FAIL_PLAN` so it is reproducible.
- **The tools are local fixtures** — a dict of three orders and a rate table.
- **RuleBrain is not an LLM.** It is a router good enough to make the harness
  observable; `ModelBrain` is wired but only exercised when a key is present.
- **No streaming, no memory, no multi-agent.** Those are the next four patterns
  and each one doubles the trace surface.

## What this is for

A portfolio artefact that answers the question a cheat sheet cannot: *what happens
when the tool fails, and how would I know?*
