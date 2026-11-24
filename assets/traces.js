window.TRACES = [
 {
  "steps": [
   {
    "i": 1,
    "kind": "request",
    "name": "customer message",
    "ms": 0.0,
    "attempt": 0,
    "detail": {
     "text": "Where is order 4471?"
    }
   },
   {
    "i": 2,
    "kind": "budget",
    "name": "run ceiling",
    "ms": 0.01,
    "attempt": 0,
    "detail": {
     "ceiling": 0.02
    }
   },
   {
    "i": 3,
    "kind": "route",
    "name": "order_status",
    "ms": 0.21,
    "attempt": 0,
    "detail": {
     "confidence": 0.9,
     "why": [
      "order_status: mentions an order (weight 2)"
     ]
    }
   },
   {
    "i": 4,
    "kind": "plan",
    "name": "lookup_order",
    "ms": 0.24,
    "attempt": 0,
    "detail": {
     "args": {
      "order_id": "4471"
     }
    }
   },
   {
    "i": 5,
    "kind": "tool_call",
    "name": "lookup_order",
    "ms": 0.24,
    "attempt": 1,
    "detail": {
     "args": {
      "order_id": "4471"
     }
    }
   },
   {
    "i": 6,
    "kind": "tool_result",
    "name": "lookup_order",
    "ms": 0.25,
    "attempt": 1,
    "detail": {
     "result": {
      "order_id": "4471",
      "customer": "Nithya R",
      "status": "in transit",
      "zone": "B",
      "placed": "2026-11-18",
      "eta": "2026-11-25",
      "items": 2
     }
    }
   },
   {
    "i": 7,
    "kind": "charge",
    "name": "lookup_order",
    "ms": 0.25,
    "attempt": 0,
    "detail": {
     "cost": 0.004,
     "spent": 0.004,
     "ceiling": 0.02
    }
   },
   {
    "i": 8,
    "kind": "judge",
    "name": "self-check",
    "ms": 0.3,
    "attempt": 0,
    "detail": {
     "passed": true,
     "problems": []
    }
   },
   {
    "i": 9,
    "kind": "answer",
    "name": "delivered",
    "ms": 0.3,
    "attempt": 0,
    "detail": {
     "chars": 89
    }
   }
  ],
  "total_ms": 0.33,
  "request": "Where is order 4471?",
  "ok": true,
  "route": "order_status",
  "budget": {
   "ceiling": 0.02,
   "spent": 0.004,
   "calls": 1,
   "left": 0.016
  },
  "answer": "Order 4471 for Nithya R is in transit. Placed 2026-11-18, expected 2026-11-25, 2 item(s).",
  "id": "order-status",
  "title": "Where is my order?",
  "shows": [
   "routing",
   "tool use"
  ],
  "step_count": 9
 },
 {
  "steps": [
   {
    "i": 1,
    "kind": "request",
    "name": "customer message",
    "ms": 0.0,
    "attempt": 0,
    "detail": {
     "text": "What does it cost to ship 7 kg to zone C?"
    }
   },
   {
    "i": 2,
    "kind": "budget",
    "name": "run ceiling",
    "ms": 0.01,
    "attempt": 0,
    "detail": {
     "ceiling": 0.02
    }
   },
   {
    "i": 3,
    "kind": "route",
    "name": "shipping_quote",
    "ms": 0.02,
    "attempt": 0,
    "detail": {
     "confidence": 0.9,
     "why": [
      "shipping_quote: asks about shipping or weight (weight 2)"
     ]
    }
   },
   {
    "i": 4,
    "kind": "plan",
    "name": "shipping_quote",
    "ms": 0.11,
    "attempt": 0,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 7.0
     }
    }
   },
   {
    "i": 5,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 0.12,
    "attempt": 1,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 7.0
     }
    }
   },
   {
    "i": 6,
    "kind": "tool_error",
    "name": "shipping_quote",
    "ms": 0.12,
    "attempt": 1,
    "detail": {
     "error": "shipping_quote: upstream returned 503 (attempt 1)"
    }
   },
   {
    "i": 7,
    "kind": "retry",
    "name": "shipping_quote",
    "ms": 0.12,
    "attempt": 1,
    "detail": {
     "in_ms": 50,
     "reason": "transient error"
    }
   },
   {
    "i": 8,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 51.58,
    "attempt": 2,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 7.0
     }
    }
   },
   {
    "i": 9,
    "kind": "tool_error",
    "name": "shipping_quote",
    "ms": 51.59,
    "attempt": 2,
    "detail": {
     "error": "shipping_quote: upstream returned 503 (attempt 2)"
    }
   },
   {
    "i": 10,
    "kind": "retry",
    "name": "shipping_quote",
    "ms": 51.6,
    "attempt": 2,
    "detail": {
     "in_ms": 100,
     "reason": "transient error"
    }
   },
   {
    "i": 11,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 155.21,
    "attempt": 3,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 7.0
     }
    }
   },
   {
    "i": 12,
    "kind": "tool_result",
    "name": "shipping_quote",
    "ms": 155.3,
    "attempt": 3,
    "detail": {
     "result": {
      "zone": "C",
      "kg": 7.0,
      "rate_per_kg": 90,
      "total_inr": 606.0,
      "breakdown": "5 kg x 90 + 2 kg x 78"
     }
    }
   },
   {
    "i": 13,
    "kind": "charge",
    "name": "shipping_quote",
    "ms": 155.3,
    "attempt": 0,
    "detail": {
     "cost": 0.003,
     "spent": 0.003,
     "ceiling": 0.02
    }
   },
   {
    "i": 14,
    "kind": "judge",
    "name": "self-check",
    "ms": 155.37,
    "attempt": 0,
    "detail": {
     "passed": true,
     "problems": []
    }
   },
   {
    "i": 15,
    "kind": "answer",
    "name": "delivered",
    "ms": 155.37,
    "attempt": 0,
    "detail": {
     "chars": 58
    }
   }
  ],
  "total_ms": 155.5,
  "request": "What does it cost to ship 7 kg to zone C?",
  "ok": true,
  "route": "shipping_quote",
  "budget": {
   "ceiling": 0.02,
   "spent": 0.003,
   "calls": 1,
   "left": 0.017
  },
  "answer": "Shipping 7 kg to zone C is Rs 606 (5 kg x 90 + 2 kg x 78).",
  "id": "shipping-retry",
  "title": "Shipping that fails twice",
  "shows": [
   "tool use",
   "retry with backoff"
  ],
  "step_count": 15
 },
 {
  "steps": [
   {
    "i": 1,
    "kind": "request",
    "name": "customer message",
    "ms": 0.01,
    "attempt": 0,
    "detail": {
     "text": "Draft a reply to a customer asking where their parcel is."
    }
   },
   {
    "i": 2,
    "kind": "budget",
    "name": "run ceiling",
    "ms": 0.03,
    "attempt": 0,
    "detail": {
     "ceiling": 0.02
    }
   },
   {
    "i": 3,
    "kind": "route",
    "name": "draft_reply",
    "ms": 0.08,
    "attempt": 0,
    "detail": {
     "confidence": 0.9,
     "why": [
      "draft_reply: asks for a written reply (weight 3)",
      "order_status: mentions an order (weight 2)"
     ]
    }
   },
   {
    "i": 4,
    "kind": "plan",
    "name": "draft_reply",
    "ms": 0.32,
    "attempt": 0,
    "detail": {
     "args": {
      "tone": "plain",
      "order_id": "4471"
     }
    }
   },
   {
    "i": 5,
    "kind": "approval_request",
    "name": "draft_reply",
    "ms": 0.34,
    "attempt": 0,
    "detail": {
     "args": {
      "tone": "plain",
      "order_id": "4471"
     },
     "cost": 0.006
    }
   },
   {
    "i": 6,
    "kind": "approval_granted",
    "name": "draft_reply",
    "ms": 0.35,
    "attempt": 0,
    "detail": {
     "approver": "yes"
    }
   },
   {
    "i": 7,
    "kind": "tool_call",
    "name": "draft_reply",
    "ms": 0.35,
    "attempt": 1,
    "detail": {
     "args": {
      "tone": "plain",
      "order_id": "4471"
     }
    }
   },
   {
    "i": 8,
    "kind": "tool_result",
    "name": "draft_reply",
    "ms": 0.37,
    "attempt": 1,
    "detail": {
     "result": {
      "order": {
       "order_id": "4471",
       "customer": "Nithya R",
       "status": "in transit",
       "zone": "B",
       "placed": "2026-11-18",
       "eta": "2026-11-25",
       "items": 2
      },
      "tone": "plain",
      "body": "Hello Nithya R, order 4471 is in transit and should reach you by 2026-11-25. If it has not arrived by then, reply to this message and we will chase it.",
      "chars": 151
     }
    }
   },
   {
    "i": 9,
    "kind": "charge",
    "name": "draft_reply",
    "ms": 0.38,
    "attempt": 0,
    "detail": {
     "cost": 0.006,
     "spent": 0.006,
     "ceiling": 0.02
    }
   },
   {
    "i": 10,
    "kind": "judge",
    "name": "self-check",
    "ms": 0.4,
    "attempt": 0,
    "detail": {
     "passed": true,
     "problems": []
    }
   },
   {
    "i": 11,
    "kind": "answer",
    "name": "delivered",
    "ms": 0.41,
    "attempt": 0,
    "detail": {
     "chars": 151
    }
   }
  ],
  "total_ms": 0.5,
  "request": "Draft a reply to a customer asking where their parcel is.",
  "ok": true,
  "route": "draft_reply",
  "budget": {
   "ceiling": 0.02,
   "spent": 0.006,
   "calls": 1,
   "left": 0.014
  },
  "answer": "Hello Nithya R, order 4471 is in transit and should reach you by 2026-11-25. If it has not arrived by then, reply to this message and we will chase it.",
  "id": "draft-reply",
  "title": "Draft a reply",
  "shows": [
   "routing",
   "chaining: fetch facts, then write"
  ],
  "step_count": 11
 },
 {
  "steps": [
   {
    "i": 1,
    "kind": "request",
    "name": "customer message",
    "ms": 0.0,
    "attempt": 0,
    "detail": {
     "text": "Where is order 5102?"
    }
   },
   {
    "i": 2,
    "kind": "budget",
    "name": "run ceiling",
    "ms": 0.02,
    "attempt": 0,
    "detail": {
     "ceiling": 0.02
    }
   },
   {
    "i": 3,
    "kind": "route",
    "name": "order_status",
    "ms": 0.06,
    "attempt": 0,
    "detail": {
     "confidence": 0.9,
     "why": [
      "order_status: mentions an order (weight 2)"
     ]
    }
   },
   {
    "i": 4,
    "kind": "plan",
    "name": "lookup_order",
    "ms": 0.07,
    "attempt": 0,
    "detail": {
     "args": {
      "order_id": "5102"
     }
    }
   },
   {
    "i": 5,
    "kind": "tool_call",
    "name": "lookup_order",
    "ms": 0.08,
    "attempt": 1,
    "detail": {
     "args": {
      "order_id": "5102"
     }
    }
   },
   {
    "i": 6,
    "kind": "tool_result",
    "name": "lookup_order",
    "ms": 0.09,
    "attempt": 1,
    "detail": {
     "result": {
      "order_id": "5102",
      "customer": "Anoop S",
      "status": "delivered",
      "zone": "A",
      "placed": "2026-11-11",
      "eta": "2026-11-16",
      "items": 1
     }
    }
   },
   {
    "i": 7,
    "kind": "charge",
    "name": "lookup_order",
    "ms": 0.09,
    "attempt": 0,
    "detail": {
     "cost": 0.004,
     "spent": 0.004,
     "ceiling": 0.02
    }
   },
   {
    "i": 8,
    "kind": "judge",
    "name": "self-check",
    "ms": 0.11,
    "attempt": 0,
    "detail": {
     "passed": false,
     "problems": [
      "promises an outcome it cannot know"
     ]
    }
   },
   {
    "i": 9,
    "kind": "revise",
    "name": "answer rewritten",
    "ms": 0.43,
    "attempt": 0,
    "detail": {
     "before": "Order 5102 for Anoop S is delivered. Placed 2026-11-11, expected 2026-11-16, 1 item(s). We guarantee delivery by Friday.",
     "after": "Order 5102 for Anoop S is delivered. Placed 2026-11-11, expected 2026-11-16, 1 item(s).",
     "because": [
      "promises an outcome it cannot know"
     ]
    }
   },
   {
    "i": 10,
    "kind": "judge",
    "name": "self-check after revision",
    "ms": 0.44,
    "attempt": 0,
    "detail": {
     "passed": true,
     "problems": []
    }
   },
   {
    "i": 11,
    "kind": "answer",
    "name": "delivered",
    "ms": 0.45,
    "attempt": 0,
    "detail": {
     "chars": 87
    }
   }
  ],
  "total_ms": 0.52,
  "request": "Where is order 5102?",
  "ok": true,
  "route": "order_status",
  "budget": {
   "ceiling": 0.02,
   "spent": 0.004,
   "calls": 1,
   "left": 0.016
  },
  "answer": "Order 5102 for Anoop S is delivered. Placed 2026-11-11, expected 2026-11-16, 1 item(s).",
  "id": "judge-revise",
  "title": "A draft that overpromises",
  "shows": [
   "evaluator",
   "revision"
  ],
  "step_count": 11
 },
 {
  "steps": [
   {
    "i": 1,
    "kind": "request",
    "name": "customer message",
    "ms": 0.0,
    "attempt": 0,
    "detail": {
     "text": "What is the weather in Kochi today?"
    }
   },
   {
    "i": 2,
    "kind": "budget",
    "name": "run ceiling",
    "ms": 0.02,
    "attempt": 0,
    "detail": {
     "ceiling": 0.02
    }
   },
   {
    "i": 3,
    "kind": "route",
    "name": "out_of_scope",
    "ms": 0.05,
    "attempt": 0,
    "detail": {
     "confidence": 0.0,
     "why": [
      "no tool in this harness covers that request"
     ]
    }
   },
   {
    "i": 4,
    "kind": "refuse",
    "name": "out of scope",
    "ms": 0.09,
    "attempt": 0,
    "detail": {
     "text": "This harness only covers order status, shipping quotes and reply drafts."
    }
   }
  ],
  "total_ms": 0.13,
  "request": "What is the weather in Kochi today?",
  "ok": false,
  "route": "out_of_scope",
  "budget": {
   "ceiling": 0.02,
   "spent": 0.0,
   "calls": 0,
   "left": 0.02
  },
  "answer": "I can check order status, quote shipping, or draft a reply \u2014 that request is outside what I have tools for.",
  "id": "out-of-scope",
  "title": "Something with no tool",
  "shows": [
   "routing refusal"
  ],
  "step_count": 4
 },
 {
  "steps": [
   {
    "i": 1,
    "kind": "request",
    "name": "customer message",
    "ms": 0.0,
    "attempt": 0,
    "detail": {
     "text": "Quote 3 kg for zone A, zone B, zone C, zone A, zone B, zone C, zone A and zone B."
    }
   },
   {
    "i": 2,
    "kind": "budget",
    "name": "run ceiling",
    "ms": 0.02,
    "attempt": 0,
    "detail": {
     "ceiling": 0.02
    }
   },
   {
    "i": 3,
    "kind": "route",
    "name": "shipping_batch",
    "ms": 0.07,
    "attempt": 0,
    "detail": {
     "confidence": 0.9,
     "why": [
      "shipping_batch: asks for several shipping quotes at once (weight 4)",
      "shipping_quote: asks about shipping or weight (weight 2)"
     ]
    }
   },
   {
    "i": 4,
    "kind": "plan",
    "name": "8 calls",
    "ms": 0.11,
    "attempt": 0,
    "detail": {
     "tools": [
      "shipping_quote",
      "shipping_quote",
      "shipping_quote",
      "shipping_quote",
      "shipping_quote",
      "shipping_quote",
      "shipping_quote",
      "shipping_quote"
     ]
    }
   },
   {
    "i": 5,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 0.12,
    "attempt": 1,
    "detail": {
     "args": {
      "zone": "A",
      "kg": 3.0
     }
    }
   },
   {
    "i": 6,
    "kind": "tool_result",
    "name": "shipping_quote",
    "ms": 0.14,
    "attempt": 1,
    "detail": {
     "result": {
      "zone": "A",
      "kg": 3.0,
      "rate_per_kg": 40,
      "total_inr": 120.0,
      "breakdown": "3 kg x 40 + 0 kg x 28"
     }
    }
   },
   {
    "i": 7,
    "kind": "charge",
    "name": "shipping_quote",
    "ms": 0.15,
    "attempt": 0,
    "detail": {
     "cost": 0.003,
     "spent": 0.003,
     "ceiling": 0.02
    }
   },
   {
    "i": 8,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 0.15,
    "attempt": 1,
    "detail": {
     "args": {
      "zone": "B",
      "kg": 3.0
     }
    }
   },
   {
    "i": 9,
    "kind": "tool_result",
    "name": "shipping_quote",
    "ms": 0.16,
    "attempt": 1,
    "detail": {
     "result": {
      "zone": "B",
      "kg": 3.0,
      "rate_per_kg": 65,
      "total_inr": 195.0,
      "breakdown": "3 kg x 65 + 0 kg x 53"
     }
    }
   },
   {
    "i": 10,
    "kind": "charge",
    "name": "shipping_quote",
    "ms": 0.17,
    "attempt": 0,
    "detail": {
     "cost": 0.003,
     "spent": 0.006,
     "ceiling": 0.02
    }
   },
   {
    "i": 11,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 0.17,
    "attempt": 1,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 3.0
     }
    }
   },
   {
    "i": 12,
    "kind": "tool_result",
    "name": "shipping_quote",
    "ms": 0.18,
    "attempt": 1,
    "detail": {
     "result": {
      "zone": "C",
      "kg": 3.0,
      "rate_per_kg": 90,
      "total_inr": 270.0,
      "breakdown": "3 kg x 90 + 0 kg x 78"
     }
    }
   },
   {
    "i": 13,
    "kind": "charge",
    "name": "shipping_quote",
    "ms": 0.18,
    "attempt": 0,
    "detail": {
     "cost": 0.003,
     "spent": 0.009,
     "ceiling": 0.02
    }
   },
   {
    "i": 14,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 0.18,
    "attempt": 1,
    "detail": {
     "args": {
      "zone": "A",
      "kg": 3.0
     }
    }
   },
   {
    "i": 15,
    "kind": "tool_result",
    "name": "shipping_quote",
    "ms": 0.19,
    "attempt": 1,
    "detail": {
     "result": {
      "zone": "A",
      "kg": 3.0,
      "rate_per_kg": 40,
      "total_inr": 120.0,
      "breakdown": "3 kg x 40 + 0 kg x 28"
     }
    }
   },
   {
    "i": 16,
    "kind": "charge",
    "name": "shipping_quote",
    "ms": 0.19,
    "attempt": 0,
    "detail": {
     "cost": 0.003,
     "spent": 0.012,
     "ceiling": 0.02
    }
   },
   {
    "i": 17,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 0.2,
    "attempt": 1,
    "detail": {
     "args": {
      "zone": "B",
      "kg": 3.0
     }
    }
   },
   {
    "i": 18,
    "kind": "tool_result",
    "name": "shipping_quote",
    "ms": 0.2,
    "attempt": 1,
    "detail": {
     "result": {
      "zone": "B",
      "kg": 3.0,
      "rate_per_kg": 65,
      "total_inr": 195.0,
      "breakdown": "3 kg x 65 + 0 kg x 53"
     }
    }
   },
   {
    "i": 19,
    "kind": "charge",
    "name": "shipping_quote",
    "ms": 0.21,
    "attempt": 0,
    "detail": {
     "cost": 0.003,
     "spent": 0.015,
     "ceiling": 0.02
    }
   },
   {
    "i": 20,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 0.21,
    "attempt": 1,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 3.0
     }
    }
   },
   {
    "i": 21,
    "kind": "tool_result",
    "name": "shipping_quote",
    "ms": 0.22,
    "attempt": 1,
    "detail": {
     "result": {
      "zone": "C",
      "kg": 3.0,
      "rate_per_kg": 90,
      "total_inr": 270.0,
      "breakdown": "3 kg x 90 + 0 kg x 78"
     }
    }
   },
   {
    "i": 22,
    "kind": "charge",
    "name": "shipping_quote",
    "ms": 0.22,
    "attempt": 0,
    "detail": {
     "cost": 0.003,
     "spent": 0.018,
     "ceiling": 0.02
    }
   },
   {
    "i": 23,
    "kind": "budget_stop",
    "name": "shipping_quote",
    "ms": 0.23,
    "attempt": 0,
    "detail": {
     "cost": 0.003,
     "ceiling": 0.02,
     "spent": 0.018,
     "calls": 6,
     "left": 0.002
    }
   }
  ],
  "total_ms": 0.39,
  "request": "Quote 3 kg for zone A, zone B, zone C, zone A, zone B, zone C, zone A and zone B.",
  "ok": false,
  "route": "shipping_batch",
  "budget": {
   "ceiling": 0.02,
   "spent": 0.018,
   "calls": 6,
   "left": 0.002
  },
  "answer": "Stopping: this run has spent 0.018 of its 0.020 ceiling, and one more call would exceed it. I would rather stop than spend past the limit.",
  "id": "spend-guard",
  "title": "Eight quotes, one ceiling",
  "shows": [
   "spend guard"
  ],
  "step_count": 23
 },
 {
  "steps": [
   {
    "i": 1,
    "kind": "request",
    "name": "customer message",
    "ms": 0.0,
    "attempt": 0,
    "detail": {
     "text": "Draft an apologetic reply about order 4471."
    }
   },
   {
    "i": 2,
    "kind": "budget",
    "name": "run ceiling",
    "ms": 0.02,
    "attempt": 0,
    "detail": {
     "ceiling": 0.02
    }
   },
   {
    "i": 3,
    "kind": "route",
    "name": "draft_reply",
    "ms": 0.07,
    "attempt": 0,
    "detail": {
     "confidence": 0.9,
     "why": [
      "draft_reply: asks for a written reply (weight 3)",
      "order_status: mentions an order (weight 2)"
     ]
    }
   },
   {
    "i": 4,
    "kind": "plan",
    "name": "draft_reply",
    "ms": 0.09,
    "attempt": 0,
    "detail": {
     "args": {
      "tone": "plain",
      "order_id": "4471"
     }
    }
   },
   {
    "i": 5,
    "kind": "approval_request",
    "name": "draft_reply",
    "ms": 0.1,
    "attempt": 0,
    "detail": {
     "args": {
      "tone": "plain",
      "order_id": "4471"
     },
     "cost": 0.006
    }
   },
   {
    "i": 6,
    "kind": "approval_granted",
    "name": "draft_reply",
    "ms": 0.1,
    "attempt": 0,
    "detail": {
     "approver": "yes"
    }
   },
   {
    "i": 7,
    "kind": "tool_call",
    "name": "draft_reply",
    "ms": 0.11,
    "attempt": 1,
    "detail": {
     "args": {
      "tone": "plain",
      "order_id": "4471"
     }
    }
   },
   {
    "i": 8,
    "kind": "tool_result",
    "name": "draft_reply",
    "ms": 0.12,
    "attempt": 1,
    "detail": {
     "result": {
      "order": {
       "order_id": "4471",
       "customer": "Nithya R",
       "status": "in transit",
       "zone": "B",
       "placed": "2026-11-18",
       "eta": "2026-11-25",
       "items": 2
      },
      "tone": "plain",
      "body": "Hello Nithya R, order 4471 is in transit and should reach you by 2026-11-25. If it has not arrived by then, reply to this message and we will chase it.",
      "chars": 151
     }
    }
   },
   {
    "i": 9,
    "kind": "charge",
    "name": "draft_reply",
    "ms": 0.13,
    "attempt": 0,
    "detail": {
     "cost": 0.006,
     "spent": 0.006,
     "ceiling": 0.02
    }
   },
   {
    "i": 10,
    "kind": "judge",
    "name": "self-check",
    "ms": 0.15,
    "attempt": 0,
    "detail": {
     "passed": true,
     "problems": []
    }
   },
   {
    "i": 11,
    "kind": "answer",
    "name": "delivered",
    "ms": 0.15,
    "attempt": 0,
    "detail": {
     "chars": 151
    }
   }
  ],
  "total_ms": 0.24,
  "request": "Draft an apologetic reply about order 4471.",
  "ok": true,
  "route": "draft_reply",
  "budget": {
   "ceiling": 0.02,
   "spent": 0.006,
   "calls": 1,
   "left": 0.014
  },
  "answer": "Hello Nithya R, order 4471 is in transit and should reach you by 2026-11-25. If it has not arrived by then, reply to this message and we will chase it.",
  "id": "approval-granted",
  "title": "A reply a human allows",
  "shows": [
   "approval gate, granted"
  ],
  "step_count": 11
 },
 {
  "steps": [
   {
    "i": 1,
    "kind": "request",
    "name": "customer message",
    "ms": 0.0,
    "attempt": 0,
    "detail": {
     "text": "Draft an apologetic reply about order 4471."
    }
   },
   {
    "i": 2,
    "kind": "budget",
    "name": "run ceiling",
    "ms": 0.01,
    "attempt": 0,
    "detail": {
     "ceiling": 0.02
    }
   },
   {
    "i": 3,
    "kind": "route",
    "name": "draft_reply",
    "ms": 0.04,
    "attempt": 0,
    "detail": {
     "confidence": 0.9,
     "why": [
      "draft_reply: asks for a written reply (weight 3)",
      "order_status: mentions an order (weight 2)"
     ]
    }
   },
   {
    "i": 4,
    "kind": "plan",
    "name": "draft_reply",
    "ms": 0.05,
    "attempt": 0,
    "detail": {
     "args": {
      "tone": "plain",
      "order_id": "4471"
     }
    }
   },
   {
    "i": 5,
    "kind": "approval_request",
    "name": "draft_reply",
    "ms": 0.06,
    "attempt": 0,
    "detail": {
     "args": {
      "tone": "plain",
      "order_id": "4471"
     },
     "cost": 0.006
    }
   },
   {
    "i": 6,
    "kind": "approval_denied",
    "name": "draft_reply",
    "ms": 0.06,
    "attempt": 0,
    "detail": {
     "note": "no approver said yes; the tool was not called"
    }
   }
  ],
  "total_ms": 0.1,
  "request": "Draft an apologetic reply about order 4471.",
  "ok": false,
  "route": "draft_reply",
  "budget": {
   "ceiling": 0.02,
   "spent": 0.0,
   "calls": 0,
   "left": 0.02
  },
  "answer": "That needs a person to approve it before I call draft_reply. Nothing was written or sent.",
  "id": "approval-denied",
  "title": "The same reply, denied",
  "shows": [
   "approval gate, denied"
  ],
  "step_count": 6
 }
];
