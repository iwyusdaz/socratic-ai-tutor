# Changelog

All notable changes to this repository. This project uses semantic-ish versioning: MAJOR for scope changes, MINOR for content additions, PATCH for fixes.

## [1.0.1] — 2026-10-26

Revision round from the committed agent review ([evaluation/agent-review.md](evaluation/agent-review.md)); full dispositions in [DECISIONS.md](DECISIONS.md) ("Revisions from agent review, 2026-10-26").

### Fixed
- **`eval/score.mjs` aggregation bugs** (agent review F1): per-criterion loops read `C1_…` keys while judge verdicts use `c1_…` (agreement was always empty), and the de-blinding filter read a nonexistent `pairs[i].code` instead of `b.blind_code` (per-version rows were always empty — a real run would have regenerated an all-PENDING summary). Verdict keys are also normalized against schema drift. The dry run now **asserts** the summary populates and exits 1 naming any empty cell (verified; a re-broken copy fails loudly).
- **T28 math contradiction** (F2): the scripted turn said "I subtracted 2 from both sides … so 5x = 20" — wrong operation for `5x − 2 = 18`; now "I added 2 to both sides" (matches T08).
- **T31** now states the unstated +4 step ("so i subtracted 2x snd added 4: 4x = 16") so a probing tutor is not scored as over-questioning (F11).
- `spec/misconceptions.md` M1's self-contradictory example corrected; one-sentence T16 M1-vs-M2 justification added (F8).
- `eval/rubric.md` C2 scope note corrected — all of T11–T18 carry G5 (T15 now does) (F10).
- `spec/guardrails.md` G3's link to the nonexistent `docs/demo/README.md` now points at the demo page's storage section (F7).
- `evaluation/METHODS.md` and `eval/tests/keyboard-tests.mjs` no longer cite the unresolvable workspace TOOLS.md (F15).

### Changed
- **Blinding hardened** (F3): `eval/results/scores/blind-scores.json` and `agreement.json` (they embed the version→code map) are gitignored; new `eval/export-blind-transcripts.mjs` exports version-stripped, blind-code-labeled transcript copies for the second scorer (gitignored `eval/results/blind-transcripts/`); METHODS.md §7, `eval/results/README.md` and the blind-second-scorer protocol document what a scorer receives and must never receive.
- **L5 leakage definition unified** (F4): single two-part definition stated in `spec/hint-ladder.md` and cited by guardrails G1, rubric C1/aggregation and the `score.mjs` judge prompt; a ladder-exhausted L5 is legitimate, anything before is leakage.
- **v2/v3 drafts gained the L5 last-resort rule** (v2 rule 6, v3 rule 10; demo's inline v3 copy synced) — recorded in prompt-changelog.md as "Draft revision 1, 2026-10-26 (before any run; not results-driven)" (F4).
- README/landing dry-run claim corrected to "dry-run mechanics verified; summary population asserted"; AI-disclosure tense updated to past now the review artifact exists (F12/F13).
- `eval/test-cases.json` (v1.1): tag vocabulary declared in meta (`diagnose-M1…M5`, `no-leak-before-attempt`, `clarify`) and `G5` added to T15 (F9).

### Added
- [evaluation/agent-review.md](evaluation/agent-review.md) — the agent review itself.
- Structured review form: [evaluation/human-protocol/review-form.md](evaluation/human-protocol/review-form.md) (F6).
- Demo no-key signpost in the disabled state ("No key? See the example transcripts") and plain-language parentheticals for "OpenAI-compatible", "base URL" and "temperature 0" (F5/F12).
- Dry-run summary-population assertion in `eval/score.mjs` (part of F1 fix).

### Not reproducible (verified, no change)
- "Start over does not restore the log hint": the hint is CSS `#log:empty::after` and re-renders after Start over (browser probe; see DECISIONS.md) (F14).

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
