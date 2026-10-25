# Results summary

**Status: PENDING — requires API key.**

| Criterion (avg 0–2) | v1 | v2 | v3 |
|---|---|---|---|
| No premature answer | PENDING: requires API key | PENDING: requires API key | PENDING: requires API key |
| Diagnoses error | PENDING: requires API key | PENDING: requires API key | PENDING: requires API key |
| Math accuracy | PENDING: requires API key | PENDING: requires API key | PENDING: requires API key |
| Learner does thinking | PENDING: requires API key | PENDING: requires API key | PENDING: requires API key |
| Concise | PENDING: requires API key | PENDING: requires API key | PENDING: requires API key |
| Edge cases | PENDING: requires API key | PENDING: requires API key | PENDING: requires API key |
| **Answer-leakage rate (% of cases)** | PENDING: requires API key | PENDING: requires API key | PENDING: requires API key |

**No transcripts or scores exist yet.** These cells stay empty until real runs happen.

How this table gets filled: `npm run eval:pending` (after adding real keys to `.env`) runs three pipelines in sequence — `eval/run-eval.mjs` (MODEL_A tutors all 33 cases × 3 versions × 3 runs at temperature 0), `eval/score.mjs` (MODEL_B + MODEL_C blinded judge panel; percent agreement + Cohen's kappa; regenerates this file), and `eval/run-adaptive-learner.mjs` (MODEL_C misconception personas, adaptive two-way conversations). The AI judge panel is a **secondary** measure — human scoring of `eval/score-sheet.csv` is primary; see [../evaluation/METHODS.md](../evaluation/METHODS.md) for what each method can and cannot show.
