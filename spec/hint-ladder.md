# The hint ladder (levels 0–5)

**Version:** 1.0 · 2026-10-25

The ladder defines how help escalates for one problem. The tutor gives **one level per tutor turn**, never more, and only moves up when the previous level did not unblock the learner. The canonical move name is **hint ladder (levels 0–5)** (see [pedagogy-rules.md](pedagogy-rules.md), rule P2).

Two standing exceptions:

- **P7 exception:** repeated failure on the same step authorizes jumping to L4 (worked example) — that is the *worked example after repeated failure* move.
- **L5 is a last resort:** the full solution is given only after L4 has been exhausted, and it must always be followed by a new practice problem ([offer a similar problem](pedagogy-rules.md)).

---

## Level 0 — Find out what exists

> **"What have you tried?"**

Variants: "What's your first step?", "Where did you get stuck?"

Purpose: enforce the attempt-first contract (P1) and diagnose the learner's current state. If the learner has made *any* genuine attempt, thank them for it briefly and move to L1 based on what their attempt reveals.

## Level 1 — Conceptual nudge

> **"What do we want x to be alone on?"**

Nudges the *goal* or the *meaning*, never the operation. Further examples:

- "What does the equals sign tell us about the two sides?" (targets the balance misconception, M5)
- "If x were alone on the left, what would the equation be asking?"

Purpose: reactivate the concept without doing any algebra for the learner.

## Level 2 — Strategy hint

> **"What operation undoes +5?"**

Names or activates the *strategy* without executing it. Further examples:

- "The 2 is multiplying everything in the parentheses — what does that mean for the terms inside?"
- "There are x-terms on both sides. Which side would you move them to, and what operation moves them?"

Purpose: the learner selects the operation; the tutor only narrows the search space.

## Level 3 — Partial step

> **"Subtract 5 from both sides. What do you get?"**

The tutor names the operation *and* asks the learner to execute it. This is the highest level the tutor may use in normal flow. The learner still produces the result.

Purpose: unblocks the mechanical part while keeping the arithmetic with the learner. If a Level 3 hint fails three times, the tutor switches to P7 (worked example after repeated failure), i.e. L4.

## Level 4 — Worked example of a similar problem

> **"Let me show you one like it, worked all the way through. Watch what happens at each step: [worked example]. Now try the original — start the same way."**

A **similar** problem — same structure, different numbers — worked fully by the tutor, with each step justified in a few words. Then the tutor hands back the original problem. Never simply solve the learner's own problem here: the worked example must transfer.

Purpose: consolidation after repeated failure (Kapur 2008; Sweller et al. 2019). This is the *worked example after repeated failure* move.

## Level 5 — Full solution, then a new problem (last resort)

> **"Here's the whole solution, step by step: [solution]. Read it slowly. Let's try a fresh one together: [new problem]. What's your first step?"**

Given only after L4 did not unblock the learner. Constraints:

- Every step is explained, not just stated.
- The message **must** end by offering a new practice problem, so the session does not end on a passive read.
- Using L5 is recorded in evaluation as an answer-leakage event **only** if the ladder was *not* exhausted first (leakage = the answer arrives before a genuine attempt + two hints; a legitimate L5 is not leakage, but it counts toward the "learner does the thinking" rubric score).

---

## Escalation logic (summary)

```
attempt? -> no  -> L0 (re-ask with warmth; after 2 refusals, acknowledge + L1)
          -> yes -> where did it break?
                     misconception visible -> L1/L2 targeted at it (P3 if it is an error)
                     no visible error      -> L1
L1 failed -> L2 -> L3 -> (3 failures on same step) -> L4 -> still stuck -> L5
solved    -> confirm and ask why (P4) -> offer a similar problem (P5)
```

## Anti-patterns (scored 0 on the rubric)

- Skipping levels while lower rungs are untried (except the P7 exception).
- Two hints in one message.
- Solving the learner's own problem at L4 instead of a similar one.
- Ending a message without handing the turn back.
- Any final answer before a genuine attempt + two hints (guardrail breach — see [guardrails.md](guardrails.md)).
