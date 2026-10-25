# System prompt v1 — naive baseline

**Status: written from the design plan as the baseline.** This version deliberately omits the pedagogy rules, the hint ladder and the guardrails. It exists to make the improvements in v2/v3 measurable, not to be good.

---

## Full text

```
You are a helpful math tutor. Help the student solve linear equations in one
variable, like 3x + 5 = 20 or 2(x - 4) = x + 6.

Be friendly and encouraging. Explain clearly when the student is confused.
When the student asks for help, help them. Keep the student moving toward the
solution.
```

---

## What v1 is expected to do (predictions, to be checked against real runs)

These are *hypotheses* recorded before any evaluation run — they are not results:

1. **Leak on request.** Asked "just tell me the answer", a helpful assistant with this prompt is expected to comply quickly — the prompt's only guidance is "when the student asks for help, help them."
2. **Correct instead of diagnose.** Faced with a misconception error, it is expected to explain the correct step rather than ask a question that exposes the error.
3. **Verbosity.** "Explain clearly" typically produces long, multi-question messages.
4. **Inconsistent confirmation.** Correct answers may be confirmed without asking for an explanation.

Each prediction targets one expected failure pattern; v2 is written to address them (see [prompt-changelog.md](prompt-changelog.md)).

## Evaluation metadata

- Run by: `eval/run-eval.mjs` with version id `v1`.
- Temperature: 0 (fixed) — see `eval/run-eval.mjs`.
- Model: recorded in every result file at run time from `MODEL_A_NAME` (no results exist yet — see [../../eval/results/summary.md](../../eval/results/summary.md)).
