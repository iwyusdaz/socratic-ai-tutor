# Results directory

**Status: PENDING — requires API key. No results exist yet.**

This directory will hold the outputs of real evaluation runs:

- `v1/`, `v2/`, `v3/` — per-version transcripts (`<case-id>-run<n>.json` + readable `.md`), written by `eval/run-eval.mjs`. **Never given directly to a scorer** — the directory names and the transcript headers carry the version; scorers get blinded copies (see below).
- `blind-map.json` — the A/B/C blind-code mapping (gitignored; scorers must never see it).
- `scores/` — blinded AI judge panel output and agreement statistics, written by `eval/score.mjs`. `scores/blind-scores.json` and `scores/agreement.json` are **gitignored**: they embed the version→blind-code map, so committing them or handing them to a scorer would break the blinding (see [../evaluation/METHODS.md](../evaluation/METHODS.md) §7).
- `blind-transcripts/` — blinded transcript copies for scorers, produced by `node eval/export-blind-transcripts.mjs` (gitignored; version names stripped, blind codes only).
- `adaptive/` — adaptive simulated-learner runs, written by `eval/run-adaptive-learner.mjs`.
- `summary.md` — the results table. **Empty with "PENDING: requires API key" until a real run.**

To produce real results: copy `.env.example` to `.env`, fill in the three model slots (restricted keys, spending limits), then run `npm run eval:pending`. See [../evaluation/METHODS.md](../evaluation/METHODS.md) for the full method and the post-run update checklist.

Nothing in this repository fabricates transcripts or scores. Until the keys exist, every results table stays empty.
