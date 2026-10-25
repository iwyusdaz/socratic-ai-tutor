# STATUS

**Updated:** 2026-10-25 · **Repo state:** built, locally verified, published to GitHub Pages (pending final verification steps listed below)

## Done

- Scaffold with `.gitignore` committed first (`.env`, `node_modules/`, `dry-run/` never tracked); dual license (CC BY 4.0 content / MIT code); `.env.example` with MODEL_A/B/C slots.
- Research: 13 verified sources with URLs and access dates, each mapped to a design rule (`research/literature-notes.md`).
- Specification: tutor spec, pedagogy rules P1–P7 with canonical move names, hint ladder L0–L5, guardrails G1–G5, misconceptions M1–M5 (`spec/`).
- Prompts: v1 committed baseline; v2/v3 as full-text DRAFTS; changelog commits to revising them after measured failures (`spec/prompts/`).
- Test suite: 33 scripted multi-turn cases with the exact plan category counts; six-criterion rubric with anchors (`eval/`).
- Evaluation pipelines (pending, API-key-gated, dry-run tested): `run-eval.mjs`, `score.mjs` (blinded panel, percent agreement + Cohen's kappa), `run-adaptive-learner.mjs`, `make-score-sheet.mjs` (blind sheet). `npm run eval:pending` chains all three.
- Results skeleton: `eval/results/summary.md` + `eval/analysis.md` PENDING with nothing fabricated.
- Demo (Option B BYO-key): key in memory only, password-masked, clear-key control, no network before a key, warnings; full chat accessibility baseline. Transcripts page (Option A): "coming soon — pending real evaluation runs". Landing page with v1-vs-v3 prompt contrast and can/can't evidence table.
- Evaluation methods inventory (`evaluation/METHODS.md`) + human-protocol pack (usability protocol, consent text, blind second-scorer instructions, manual VoiceOver script).
- Root docs: README case study, DECISIONS, CHANGELOG, ATTRIBUTION, this file.

## Verification (local, 2026-10-25)

| Check | Result |
|---|---|
| gitleaks secret scan | see final report (run before publish) |
| axe-core audit of docs pages | see final report |
| linkcheck on docs | see final report |
| Playwright keyboard tests | 38/38 pass |
| Pipeline dry-runs (all 3) | pass, stubs in `dry-run/` headed "DRY RUN – NOT REAL RESULTS" |
| Placeholder `.env` behavior | all pipelines exit 1 with clear message, zero network calls |

(This table is finalized in the build report; the checks above are re-runnable: `npm run test:keyboard`, the three `--dry-run` commands in METHODS §How to run, plus workspace audit/linkcheck/gitleaks tools.)

## Pending (requires owner action or future runs)

1. **API keys** in `.env` (MODEL_A/B/C), then `npm run eval:pending` — produces the first real transcripts, judge scores, agreement stats, and leakage rates. Afterward follow the post-run checklist in `evaluation/METHODS.md` (regenerate summary, analysis, changelog, README notice, this file).
2. **Human scoring** of `eval/score-sheet.csv` (primary measure) + optional blind second scorer.
3. **Agent review** by a separate reviewer agent (labeled "Agent review", same-model limitation stated) — runs after this build.
4. **Usability study** with real adults — protocol ready in `evaluation/human-protocol/`; not run; would be reported qualitatively.
5. **Manual VoiceOver check** — script ready; Guidepup automation non-functional on macOS 27; no screen-reader testing claimed meanwhile.
6. **Owner tasks:** upload `docs/assets/social-preview.png` as the repo social preview (no API), fill `[LinkedIn]`/`[Email]` in the README, optional repo pinning.

## Known limitations (disclosed, not hidden)

- No real results of any kind yet; every results table is "PENDING: requires API key".
- v2/v3 prompts are drafts; the changelog binds them to revision after measured v1/v2 failures.
- No VoiceOver/screen-reader pass; no daily-AT-user review; no usability sessions; no human scoring yet.
- Agent review (when run) may share the author agent's underlying model — stated limitation.
- Simulated learners cannot show learning; the repo measures tutor behavior only.
