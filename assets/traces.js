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
    "kind": "route",
    "name": "order_status",
    "ms": 0.22,
    "attempt": 0,
    "detail": {
     "confidence": 0.9,
     "why": [
      "order_status: mentions an order (weight 2)"
     ]
    }
   },
   {
    "i": 3,
    "kind": "plan",
    "name": "lookup_order",
    "ms": 0.26,
    "attempt": 0,
    "detail": {
     "args": {
      "order_id": "4471"
     }
    }
   },
   {
    "i": 4,
    "kind": "tool_call",
    "name": "lookup_order",
    "ms": 0.26,
    "attempt": 1,
    "detail": {
     "args": {
      "order_id": "4471"
     }
    }
   },
   {
    "i": 5,
    "kind": "tool_result",
    "name": "lookup_order",
    "ms": 0.26,
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
    "i": 6,
    "kind": "judge",
    "name": "self-check",
    "ms": 0.32,
    "attempt": 0,
    "detail": {
     "passed": true,
     "problems": []
    }
   },
   {
    "i": 7,
    "kind": "answer",
    "name": "delivered",
    "ms": 0.32,
    "attempt": 0,
    "detail": {
     "chars": 89
    }
   }
  ],
  "total_ms": 0.36,
  "request": "Where is order 4471?",
  "ok": true,
  "route": "order_status",
  "answer": "Order 4471 for Nithya R is in transit. Placed 2026-11-18, expected 2026-11-25, 2 item(s).",
  "id": "order-status",
  "title": "Where is my order?",
  "shows": [
   "routing",
   "tool use"
  ],
  "attempt_count": 1
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
    "i": 3,
    "kind": "plan",
    "name": "shipping_quote",
    "ms": 0.1,
    "attempt": 0,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 7.0
     }
    }
   },
   {
    "i": 4,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 0.1,
    "attempt": 1,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 7.0
     }
    }
   },
   {
    "i": 5,
    "kind": "tool_error",
    "name": "shipping_quote",
    "ms": 0.11,
    "attempt": 1,
    "detail": {
     "error": "shipping_quote: upstream returned 503 (attempt 1)"
    }
   },
   {
    "i": 6,
    "kind": "retry",
    "name": "shipping_quote",
    "ms": 0.11,
    "attempt": 1,
    "detail": {
     "in_ms": 50,
     "reason": "transient error"
    }
   },
   {
    "i": 7,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 51.44,
    "attempt": 2,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 7.0
     }
    }
   },
   {
    "i": 8,
    "kind": "tool_error",
    "name": "shipping_quote",
    "ms": 51.46,
    "attempt": 2,
    "detail": {
     "error": "shipping_quote: upstream returned 503 (attempt 2)"
    }
   },
   {
    "i": 9,
    "kind": "retry",
    "name": "shipping_quote",
    "ms": 51.46,
    "attempt": 2,
    "detail": {
     "in_ms": 100,
     "reason": "transient error"
    }
   },
   {
    "i": 10,
    "kind": "tool_call",
    "name": "shipping_quote",
    "ms": 156.27,
    "attempt": 3,
    "detail": {
     "args": {
      "zone": "C",
      "kg": 7.0
     }
    }
   },
   {
    "i": 11,
    "kind": "tool_result",
    "name": "shipping_quote",
    "ms": 156.36,
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
    "i": 12,
    "kind": "judge",
    "name": "self-check",
    "ms": 156.43,
    "attempt": 0,
    "detail": {
     "passed": true,
     "problems": []
    }
   },
   {
    "i": 13,
    "kind": "answer",
    "name": "delivered",
    "ms": 156.44,
    "attempt": 0,
    "detail": {
     "chars": 58
    }
   }
  ],
  "total_ms": 156.62,
  "request": "What does it cost to ship 7 kg to zone C?",
  "ok": true,
  "route": "shipping_quote",
  "answer": "Shipping 7 kg to zone C is Rs 606 (5 kg x 90 + 2 kg x 78).",
  "id": "shipping-retry",
  "title": "Shipping that fails twice",
  "shows": [
   "tool use",
   "retry with backoff"
  ],
  "attempt_count": 3
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
     "text": "Draft a reply to a customer asking where their parcel is."
    }
   },
   {
    "i": 2,
    "kind": "route",
    "name": "draft_reply",
    "ms": 0.06,
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
    "i": 3,
    "kind": "plan",
    "name": "draft_reply",
    "ms": 0.36,
    "attempt": 0,
    "detail": {
     "args": {
      "tone": "plain",
      "facts": {
       "order": {
        "order_id": "4471",
        "customer": "Nithya R",
        "status": "in transit",
        "zone": "B",
        "placed": "2026-11-18",
        "eta": "2026-11-25",
        "items": 2
       }
      }
     }
    }
   },
   {
    "i": 4,
    "kind": "tool_call",
    "name": "draft_reply",
    "ms": 0.37,
    "attempt": 1,
    "detail": {
     "args": {
      "tone": "plain",
      "facts": {
       "order": {
        "order_id": "4471",
        "customer": "Nithya R",
        "status": "in transit",
        "zone": "B",
        "placed": "2026-11-18",
        "eta": "2026-11-25",
        "items": 2
       }
      }
     }
    }
   },
   {
    "i": 5,
    "kind": "tool_result",
    "name": "draft_reply",
    "ms": 0.38,
    "attempt": 1,
    "detail": {
     "result": {
      "tone": "plain",
      "body": "Thanks for writing in \u2014 we will get back to you shortly.",
      "chars": 56
     }
    }
   },
   {
    "i": 6,
    "kind": "plan",
    "name": "lookup_order",
    "ms": 0.39,
    "attempt": 0,
    "detail": {
     "note": "draft needs facts; fetching the referenced order"
    }
   },
   {
    "i": 7,
    "kind": "tool_result",
    "name": "lookup_order",
    "ms": 0.4,
    "attempt": 0,
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
    "i": 8,
    "kind": "tool_result",
    "name": "draft_reply",
    "ms": 0.41,
    "attempt": 1,
    "detail": {
     "result": {
      "tone": "plain",
      "body": "Hello Nithya R, order 4471 is in transit and should reach you by 2026-11-25. If it has not arrived by then, reply to this message and we will chase it.",
      "chars": 151
     }
    }
   },
   {
    "i": 9,
    "kind": "judge",
    "name": "self-check",
    "ms": 0.44,
    "attempt": 0,
    "detail": {
     "passed": true,
     "problems": []
    }
   },
   {
    "i": 10,
    "kind": "answer",
    "name": "delivered",
    "ms": 0.44,
    "attempt": 0,
    "detail": {
     "chars": 151
    }
   }
  ],
  "total_ms": 0.56,
  "request": "Draft a reply to a customer asking where their parcel is.",
  "ok": true,
  "route": "draft_reply",
  "answer": "Hello Nithya R, order 4471 is in transit and should reach you by 2026-11-25. If it has not arrived by then, reply to this message and we will chase it.",
  "id": "draft-reply",
  "title": "Draft a reply",
  "shows": [
   "routing",
   "chaining: fetch facts, then write"
  ],
  "attempt_count": 1
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
    "kind": "route",
    "name": "order_status",
    "ms": 0.04,
    "attempt": 0,
    "detail": {
     "confidence": 0.9,
     "why": [
      "order_status: mentions an order (weight 2)"
     ]
    }
   },
   {
    "i": 3,
    "kind": "plan",
    "name": "lookup_order",
    "ms": 0.06,
    "attempt": 0,
    "detail": {
     "args": {
      "order_id": "5102"
     }
    }
   },
   {
    "i": 4,
    "kind": "tool_call",
    "name": "lookup_order",
    "ms": 0.06,
    "attempt": 1,
    "detail": {
     "args": {
      "order_id": "5102"
     }
    }
   },
   {
    "i": 5,
    "kind": "tool_result",
    "name": "lookup_order",
    "ms": 0.07,
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
    "i": 6,
    "kind": "judge",
    "name": "self-check",
    "ms": 0.12,
    "attempt": 0,
    "detail": {
     "passed": false,
     "problems": [
      "promises an outcome it cannot know"
     ]
    }
   },
   {
    "i": 7,
    "kind": "revise",
    "name": "answer rewritten",
    "ms": 0.6,
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
    "i": 8,
    "kind": "judge",
    "name": "self-check after revision",
    "ms": 0.62,
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
    "ms": 0.63,
    "attempt": 0,
    "detail": {
     "chars": 87
    }
   }
  ],
  "total_ms": 0.72,
  "request": "Where is order 5102?",
  "ok": true,
  "route": "order_status",
  "answer": "Order 5102 for Anoop S is delivered. Placed 2026-11-11, expected 2026-11-16, 1 item(s).",
  "id": "judge-revise",
  "title": "A draft that overpromises",
  "shows": [
   "evaluator",
   "revision"
  ],
  "attempt_count": 1
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
    "kind": "route",
    "name": "out_of_scope",
    "ms": 0.04,
    "attempt": 0,
    "detail": {
     "confidence": 0.0,
     "why": [
      "no tool in this harness covers that request"
     ]
    }
   },
   {
    "i": 3,
    "kind": "refuse",
    "name": "out of scope",
    "ms": 0.05,
    "attempt": 0,
    "detail": {
     "text": "This harness only covers order status, shipping quotes and reply drafts."
    }
   }
  ],
  "total_ms": 0.08,
  "request": "What is the weather in Kochi today?",
  "ok": false,
  "route": "out_of_scope",
  "answer": "I can check order status, quote shipping, or draft a reply \u2014 that request is outside what I have tools for.",
  "id": "out-of-scope",
  "title": "Something with no tool",
  "shows": [
   "routing refusal"
  ],
  "attempt_count": 0
 }
];
