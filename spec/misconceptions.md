# Misconceptions in solving linear equations

**Version:** 1.0 · 2026-10-25

The five misconception patterns the tutor is designed to diagnose and route around. Each is stated with the learner behavior that reveals it, the diagnostic **probing question** the tutor should reach for, and where it is exercised in the test suite. Misconception M5 cites the equal-sign research in [../research/literature-notes.md](../research/literature-notes.md) (source 13); the others are standard algebra-education taxonomy (used here as design input, not as verified claims about prevalence).

---

## M1 — Applying an operation to only one side

- **Behavior:** Learner "moves" a term by operating on one side only: from `3x + 5 = 20`, subtracts 5 on the left to write `3x = 20` (or `3x = 15` with the right side untouched).
- **Why it happens:** Memorized "move it over" procedure without the underlying balance idea.
- **Diagnostic probe:** "When you subtracted 5, what did you subtract from the left side? What did you subtract from the right side?"
- **Test cases:** T11, T16 (first attempt).

## M2 — Sign errors when moving terms

- **Behavior:** `3x = 20 − 5` becomes `3x = 25`, or moving `−4` flips the sign of the *wrong* term; `x − 4 = 10` becomes `x = 6`.
- **Why it happens:** "Change the sign when it crosses" applied indiscriminately, or cancellation confusion (`− 4` on the left treated as `+ 4` to remove).
- **Diagnostic probe:** "Walk me through what happens to the minus 4 when you move it — which side did it start on, and what happens to its sign?"
- **Test cases:** T12, T17.

## M3 — Distributing incorrectly: `2(x − 4) → 2x − 4`

- **Behavior:** The outer factor multiplies only the first term inside the parentheses.
- **Why it happens:** The distributive property memorized as "multiply the first thing," or parentheses treated as decoration.
- **Diagnostic probe:** "The 2 multiplies *everything* in the parentheses. What is 2 times −4?"
- **Test cases:** T13, T18.

## M4 — Dividing only some terms

- **Behavior:** From `4x = 12`, writes `x = 12` (dividing only the left side), or from `4x + 2 = 14`, divides the `4x` and the `14` by 4 but leaves the `+ 2`: `x + 2 = 3.5`-style errors.
- **Why it happens:** The "get rid of the coefficient" step executed on the visible x-term only.
- **Diagnostic probe:** "If you divide one side by 4, what has to happen to the other side — every term on it?"
- **Test cases:** T14.

## M5 — Equals sign as "the answer comes next", not as balance

- **Behavior:** The learner chains operations down the right margin (`3x + 5 = 20 = 15 = 5`), or treats whatever follows `=` as the answer slot, or writes `3x = 20 − 5 = 15` without noticing the left side changed meaning. Evidence: students with a *relational* understanding of `=` solve equations better (Knuth, Stephens, McNeil & Alibali 2006).
- **Why it happens:** Years of `2 + 3 = ___` worksheets taught an operational reading of `=`.
- **Diagnostic probe:** "What does the equals sign tell us about the two sides of the equation? What does `3x + 5` equal right now?"
- **Test cases:** T15, and the L1 conceptual nudge targets it in the [hint ladder](hint-ladder.md).

---

## How the tutor uses this taxonomy

1. **Diagnose before treating.** The learner's first attempt (P1) usually reveals which misconception is operating. The tutor asks the diagnostic probe above (P3) rather than naming the misconception.
2. **One misconception at a time.** If two are visible, target the one blocking the current step first.
3. **Expect recurrence.** After self-correction, the [offer a similar problem](pedagogy-rules.md) move (P5) deliberately re-tests the corrected misconception with a small variation.
4. **Worked example placement.** The L4 worked example ([hint ladder](hint-ladder.md)) is chosen to showcase *the exact step where the misconception operates* — e.g., a worked example that distributes carefully, term by term, for M3.

## Note on sources

M5 is directly grounded in verified research (source 13 in the literature notes). M1–M4 are the standard taxonomy used across algebra-education practice; they are design inputs, and the evaluation suite treats them as *candidate* error patterns, verified against actual transcripts only when real runs exist.
