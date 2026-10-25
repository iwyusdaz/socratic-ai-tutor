# STATUS

**Updated:** 2026-10-26 · **Repo state:** built, verified, published — https://github.com/iwyusdaz/socratic-ai-tutor (Pages: https://iwyusdaz.github.io/socratic-ai-tutor/)

## Revisions from agent review (2026-10-26)

The committed [agent review](evaluation/agent-review.md) (separate reviewer agent, fresh context) found two pipeline-breaking bugs and two protocol leaks; all findings are dispositioned in [DECISIONS.md](DECISIONS.md) ("Revisions from agent review, 2026-10-26"). Fixed this round: the two `eval/score.mjs` aggregation bugs (criterion-key case mismatch; de-blinding filter typo) plus a new dry-run assertion that the results summary actually populates; T28's math-procedure contradiction; the blinding leaks (judge outputs and blind transcript exports now gitignored; documented blind export command for the second scorer); the L5 leakage definition unified across hint-ladder/guardrails/rubric/judge prompt and added to the v2/v3 drafts (Draft revision 1, pre-results); demo no-key signpost + jargon glosses; structured review form; and the smaller doc/link/tag fixes. One review finding ("Start over does not restore the log hint") was probed in a real browser and **not reproduced** — documented in DECISIONS.md rather than "fixed".

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

## Verification (latest: 2026-10-26 revision round; re-runnable)

| Check | Result |
|---|---|
| gitleaks (history + tree) | no leaks found (9 commits scanned, 2026-10-26) |
| `.env` in git history | absent (only `.env.example` with placeholders) |
| Files > 50 MB | none |
| axe-core audit (WCAG 2.1 A/AA + best practice), root-served local + live | 0 violations (critical/serious/moderate/minor), 0 incomplete — landing, demo, transcripts (2026-10-26). Known artifact: auditing the demo as a bare *file* target reports one `incomplete` color-contrast entry because the tool's per-file serve root cannot resolve `../assets/site.css`; serving `docs/` as root (or auditing live) is clean, and the pre-revision HTML reproduces it identically. |
| linkcheck | local: 3 pages, 0 broken · live: 4 pages, 0 broken (2026-10-25) |
| External citation URLs (9) | all HTTP 200 on 2026-10-25 |
| Playwright keyboard/reflow tests (`npm run test:keyboard`) | 38/38 pass (2026-10-26) |
| Pipeline dry-runs (`run-eval`, `score`, `run-adaptive-learner` via `--dry-run`) | pass; 918 stub tutor calls; dry-run score outputs headed "DRY RUN – NOT REAL RESULTS" |
| Score dry-run summary assertion (added 2026-10-26) | **pass** — per-criterion agreement, per-version averages and leakage rate all populate on stub data (e.g. v1 c1 avg = 2, leakage 0%); a deliberately re-broken copy exits 1 naming the empty cells |
| Blind transcript export (`node eval/export-blind-transcripts.mjs --dry-run`) | 297 blinded copies written; version names stripped (grep-verified) |
| T28 fix (grep) | "subtracted 2 from both sides" absent; "added 2 to both sides" present |
| Placeholder `.env` behavior | all 3 pipelines exit 1 with clear message, zero network calls |
| GitHub Pages | enabled (main `/docs`), build `built`, live URL 200 on all pages |

## Pending (requires owner action or future runs)

1. **API keys** in `.env` (MODEL_A/B/C), then `npm run eval:pending` — produces the first real transcripts, judge scores, agreement stats, and leakage rates. Afterward follow the post-run checklist in `evaluation/METHODS.md` (regenerate summary, analysis, changelog, README notice, this file).
2. **Human scoring** of `eval/score-sheet.csv` (primary measure) + optional blind second scorer (transcripts reach the scorer via `node eval/export-blind-transcripts.mjs` — see METHODS.md §7).
3. **Usability study** with real adults — protocol ready in `evaluation/human-protocol/`; not run; would be reported qualitatively.
4. **Manual VoiceOver check** — script ready; Guidepup automation non-functional on macOS 27; no screen-reader testing claimed meanwhile.
5. **Owner tasks:** upload `docs/assets/social-preview.png` as the repo social preview (no API), fill `[LinkedIn]`/`[Email]` in the README, optional repo pinning.

**Done since the 2026-10-25 build:** agent review (separate reviewer agent, committed at `evaluation/agent-review.md`; fixes applied this round — see DECISIONS.md).

## Known limitations (disclosed, not hidden)

- No real results of any kind yet; every results table is "PENDING: requires API key".
- v2/v3 prompts are drafts; the changelog binds them to revision after measured v1/v2 failures.
- No VoiceOver/screen-reader pass; no daily-AT-user review; no usability sessions; no human scoring yet.
- Agent review (when run) may share the author agent's underlying model — stated limitation.
- Simulated learners cannot show learning; the repo measures tutor behavior only.
