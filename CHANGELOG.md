# Changelog

All notable changes to this repository. This project uses semantic-ish versioning: MAJOR for scope changes, MINOR for content additions, PATCH for fixes.

## [1.0.0] — 2026-10-25

Initial public release of the case study build.

### Added
- **Specification** (`spec/`): tutor spec; pedagogy rules P1–P7 with canonical move names (probing question, hint ladder (levels 0–5), wait time, specific feedback, worked example after repeated failure, confirm and ask why, offer a similar problem); hint ladder L0–L5; guardrails G1–G5 (answer leakage, off-topic, personal info, wellbeing, arithmetic self-check); misconception profiles M1–M5.
- **Prompts** (`spec/prompts/`): v1 committed naive baseline; v2 and v3 as full-text DRAFTS; changelog committing each version to revision after the previous version's measured failures.
- **Evaluation suite** (`eval/`): 33 scripted multi-turn test cases with exact category coverage; six-criterion rubric (0–2) with anchor examples; pending pipelines `run-eval.mjs` (MODEL_A tutor runs), `score.mjs` (blinded MODEL_B+MODEL_C judge panel, percent agreement + Cohen's kappa), `run-adaptive-learner.mjs` (MODEL_C misconception personas), `make-score-sheet.mjs` (blind human score sheet). All pipelines: `.env`-gated (placeholder/missing → exit 1, zero network calls), `--dry-run` stubs to `dry-run/` headed "DRY RUN – NOT REAL RESULTS".
- **Results skeleton** (`eval/results/`): summary table and analysis plan, empty and marked "PENDING: requires API key" — nothing fabricated.
- **Site** (`docs/`): landing page with v1-vs-v3 prompt design contrast; bring-your-own-key demo (key in memory only, never stored/logged; password-masked input; clear-key control; no network before a key; provider CORS and spending-limit warnings; no proxy); transcripts page marked "coming soon — pending real evaluation runs".
- **Accessibility**: chat log `role="log"` + aria-live, text speaker labels, labeled inputs, Enter/Shift+Enter semantics, focus retention, announced typing status, Start over, no-personal-info notice, plain-text math, ≥4.5:1 contrast, 320 px reflow; 38 scripted keyboard tests (Playwright) and ariaSnapshot captures; manual VoiceOver protocol prepared (Guidepup automation non-functional on macOS 27 — no screen-reader claims made).
- **Methods and protocols** (`evaluation/`): METHODS.md inventory (done/pending, can/can't, settings, how to run, post-run checklist); human-protocol pack (usability protocol, consent text, blind second-scorer instructions, manual VoiceOver script).
- **Research** (`research/literature-notes.md`): 13 verified sources (access-dated), each mapped to the design rule it implies.
- **Docs**: README case study, DECISIONS.md, STATUS.md, ATTRIBUTION.md, dual licensing (CC BY 4.0 content / MIT code).

### Deliberately absent
- Any evaluation results, transcripts or scores (pending API keys; nothing is fabricated).
- Any claim of learning effectiveness (the repo measures tutor behavior only).
- Server-side components, accounts, or learner data storage (by design).
