# Evaluation methods

**Version:** 1.1 · 2026-10-26

This page is the complete inventory of evaluation for this repo: what is done, what is pending and why, what each method can and cannot show, and how to run everything. It is updated after each real run (see the update checklist at the bottom).

**Status at a glance**

| Method | Status | Label used everywhere |
|---|---|---|
| Automated accessibility audit (axe-core, WCAG 2.1 A/AA) | **Done** | "Automated accessibility testing" |
| Scripted keyboard / focus / reflow tests (Playwright) | **Done** | "Scripted keyboard tests" |
| `ariaSnapshot()` accessibility-tree capture | **Done** (fallback; see VoiceOver note) | "aria snapshot" |
| Agent heuristic review (separate reviewer agent, fresh context) | **Done** (2026-10-26; [agent-review.md](agent-review.md)) | "Agent review" |
| Tutor evaluation runs (MODEL_A, scripted cases) | **Pending: requires API key** | "AI-simulated evaluation run" |
| Blinded AI judge panel (MODEL_B + MODEL_C) | **Pending: requires API key** | "AI judge panel" |
| Human scoring of blind score sheet | **Pending — needs a human scorer** | "Human scoring" |
| Adaptive simulated learner (MODEL_C personas) | **Pending: requires API key** | "AI-simulated persona" |
| Usability study with real adults | **Pending — protocol ready, not run** | "Usability session (real participant)" |
| VoiceOver screen-reader pass | **Not done** (manual protocol provided) | "Manual VoiceOver check (pending)" |

**The one-paragraph honesty summary:** this repo measures *tutor behavior*, not learning. No result in this repository may be presented as evidence that learners learn more; that would require a controlled study with real learners over time. AI-simulated learners cannot show learning even when run (the model playing them already knows the math). Pending results are never filled in by anyone or anything.

---

## 1. Done: automated accessibility testing

- **Tool:** axe-core 4.11.1 via `node /path/to/tooling/audit-axe.mjs` (WCAG 2.1 A/AA + best-practice rules) against every page in `docs/` served locally.
- **Result:** recorded in `DECISIONS.md`/`STATUS.md` and the README accessibility section — 0 critical/serious violations on all pages (any exceptions are documented inline).
- **Can show:** conformance of the static markup and rendered DOM to the tested rules. **Cannot show:** real assistive-technology user experience, cognitive load, or content quality.

## 2. Done: scripted keyboard / focus / reflow tests

- **Tool:** Playwright 1.57.0 — `npm run test:keyboard` (`eval/tests/keyboard-tests.mjs`).
- **Covers:** skip links; one `<h1>` per page; tab order into and through the key panel; connect/clear-key flows; chat disabled until a key exists; Enter sends / Shift+Enter newlines; focus stays in the input after send and after errors; typing status announced; speaker labels in text; Start over; 320 px reflow (no horizontal scroll); password-masked key field.
- **Also captured:** Playwright `ariaSnapshot()` accessibility-tree dumps for the demo and transcripts pages in `eval/tests/aria-snapshots/`. This is a **fallback**: Guidepup/VoiceOver automation does not function on macOS 27 (verified directly at build time against Guidepup on this machine), so these captures are not screen-reader testing and are never described as such.

## 3. Done: agent heuristic review

- **What:** a structured heuristic evaluation (Nielsen's 10 heuristics + a cognitive walkthrough + structured inspection) of the pages and the specification, performed by a **separate reviewer agent** in a fresh context — an agent that did not build this repo.
- **Status:** done 2026-10-26; the review is committed at [agent-review.md](agent-review.md), filled in on the structured review form ([human-protocol/review-form.md](human-protocol/review-form.md)) so future review passes are comparable. Its findings and the fixes applied from it are recorded in DECISIONS.md ("Revisions from agent review, 2026-10-26") and STATUS.md.
- **Stated limitation:** the reviewer agent may run on the same underlying model family as the author agent. It is gap-finding, not expert or educator endorsement, and is never labeled "educator review" or "expert feedback".

## 4. Pending: tutor evaluation runs (`eval/run-eval.mjs`)

- **What:** MODEL_A (the tutor, configured in `.env`) answers all 33 scripted cases ([eval/test-cases.json](../eval/test-cases.json)) under each prompt version (v1, v2, v3), 3 runs per case, temperature 0. Student turns are sent one at a time; every tutor reply is captured.
- **Outputs:** `eval/results/<version>/<case-id>-run<n>.json` + readable `.md` transcripts, each logging model name, date, temperature; a run manifest; a **gitignored** blind map assigning A/B/C codes to versions.
- **Can show:** tutor *behavior* differences across prompt versions on a fixed test set (leakage, hint discipline, concision). **Cannot show:** how real students would drive the conversation (scripted turns don't adapt — that is what pipeline 6 partially addresses), learning, or generalization to other models/subjects.

## 5. Pending: blinded AI judge panel (`eval/score.mjs`)

- **What:** MODEL_B and MODEL_C each score **every** transcript against the anchor rubric ([eval/rubric.md](../eval/rubric.md)), seeing only blind codes (A/B/C) — never version names. The script refuses to run if either judge model equals the tutor model or the other judge (a model never judges its own output).
- **Reported:** percent agreement **and** Cohen's kappa between the two judges per criterion, plus per-version averages and answer-leakage rate (regenerates `eval/results/summary.md`).
- **Status of AI scores:** **secondary, always.** Human scoring of `eval/score-sheet.csv` is the primary measure. AI-panel scores are only reported alongside (a) judge–judge agreement and (b) a human-score/AI-score agreement check on ≥ 15 transcripts once human scores exist. If that agreement is poor, the AI scores are reported as unreliable and the human scores stand.
- **Stated limitation:** the two judges (and possibly the tutor model) may share a provider family; the panel reports agreement rather than assuming independence of judgment.

## 6. Pending: adaptive simulated learner (`eval/run-adaptive-learner.mjs`)

- **What:** MODEL_C plays the five misconception personas from [spec/misconceptions.md](../spec/misconceptions.md) (fictional, labeled), two problems each. Unlike the scripted cases, the persona **reads the tutor's reply and adapts its next turn**, up to 12 turns, marking [SOLVED]/[GAVE UP].
- **Can show:** interaction problems — flooding, wrong ladder escalation, ignoring the persona's misconception, tutor giving up too early or too late. **Cannot show:** learning, real-student behavior, or transfer. The personas' model already knows the content; that is exactly the "AI personas often already know the content" limitation from the portfolio rules.

## 7. Pending: human scoring (primary measure)

- **What:** a human scores every transcript on the blind sheet `eval/score-sheet.csv` (generated by `eval/make-score-sheet.mjs`; version labels replaced by A/B/C codes; the mapping stays in the gitignored `eval/results/blind-map.json`).
- **Blinding in practice (what the scorer receives):** only the blind sheet and the **blinded transcript copies** produced by `node eval/export-blind-transcripts.mjs` (→ `eval/results/blind-transcripts/`, gitignored) — the readable transcripts are re-packaged under their blind codes with the version name stripped from the header. The scorer must **not** receive the raw `eval/results/v1|v2|v3/` directories (directory names and transcript headers carry the version), nor `eval/results/blind-map.json`, nor the judge-panel outputs `eval/results/scores/blind-scores.json` and `agreement.json` — all of these are gitignored precisely because they reveal or embed the version→code mapping.
- **Reliability checks:** second-pass scoring of 10 transcripts (blind to the first scores) with agreement reported; the scorer must not be the person/agent who wrote the prompts. If an AI agent wrote the prompts, it must not be the primary scorer — that is a stated bias rule, not a formality.
- **Procedure:** score all six criteria per conversation per [eval/rubric.md](../eval/rubric.md) anchors; quote the transcript line behind any 0 or 1 in the notes column.

## 8. Pending: usability study with real adults (optional, prepared)

- Protocol, consent text, problem sets, recording template: [human-protocol/](human-protocol/).
- 4–6 adult volunteers rusty at algebra; think-aloud on 3 problems with the v3 tutor, then 2 problems without AI; record hints used, whether the no-AI problems were solved, frustration points, quotes.
- Reported as qualitative and exploratory. **No causal claims.** Informed consent required; no personal data collected beyond the consented session notes; not for use with minors.

## 9. Not done: VoiceOver pass

- Guidepup automation was attempted at the workspace level and does not support macOS 27 ("VoiceOver not supported"). Per the build rules, the fallback is aria snapshots + scripted keyboard tests (done, section 2), plus a **manual VoiceOver protocol** for a human: [human-protocol/manual-voiceover-check.md](human-protocol/manual-voiceover-check.md).
- No VoiceOver or other screen-reader testing has been performed, and no repo text claims otherwise. The absence of review by a daily assistive-technology user is a disclosed limitation.

---

## Prompts and personas (reproducibility)

- System prompts: [spec/prompts/system-prompt-v1.md](../spec/prompts/system-prompt-v1.md), [v2](../spec/prompts/system-prompt-v2.md) (DRAFT), [v3](../spec/prompts/system-prompt-v3.md) (DRAFT) + [prompt-changelog.md](../spec/prompts/prompt-changelog.md).
- Judge instructions: embedded in `eval/score.mjs` (rubric anchors + blind-code rules + strict JSON schema).
- Simulated-learner persona instructions: embedded in `eval/run-adaptive-learner.mjs`, personas defined in [spec/misconceptions.md](../spec/misconceptions.md).
- Settings: temperature 0 everywhere; max_tokens 500 (tutor/judge), 200 (learner persona); `--runs` configurable, default 3.

## Settings and configuration

- Configuration lives in `.env` (never committed): `MODEL_A/B/C_BASE_URL`, `MODEL_A/B/C_API_KEY`, `MODEL_A/B/C_NAME` — OpenAI-compatible chat-completion endpoints. See `.env.example`.
- Missing or `YOUR_`-placeholder values → every pipeline exits with a clear message and makes **zero** network calls.
- `--dry-run` → stub outputs to `dry-run/`, every file headed "DRY RUN – NOT REAL RESULTS", never used as results. The score pipeline's dry run also **asserts** that its aggregation actually populates the summary tables (per-criterion agreement, per-version averages, leakage rate) — stub values, clearly labeled — so a silent "everything stays PENDING" failure cannot pass unnoticed (added 2026-10-26 after the agent review found exactly that failure mode).

## What can and cannot be shown here (standing rules)

| Can show | Cannot show |
|---|---|
| Tutor *behavior* across prompt versions on a fixed test set | That learners learn more |
| Answer-leakage rate per version | Transfer to real classrooms |
| Judge agreement statistics | Judge correctness (needs human anchoring) |
| Interaction problems found by simulated personas | Real-student experience |
| Accessibility conformance of tested rules | A daily screen-reader user's experience |

## How to run everything

```bash
cp .env.example .env          # then fill in MODEL_A/B/C (restricted keys, spending limits)
npm run eval:pending          # run-eval -> score -> run-adaptive-learner
npm run eval:scoresheet       # regenerate the blind human score sheet
node eval/export-blind-transcripts.mjs  # blinded transcript copies for the scorer (after a real run)
npm run test:keyboard         # scripted keyboard tests (no API needed)
```

Estimated call volume for one full run (planning figure, not a result): ~900 tutor calls + ~600 judge calls + ~240 adaptive-learner calls, depending on conversation lengths. `eval/results/call-count.json` records the measured tutor call count.

## Post-run update checklist (each real run)

1. `eval/results/summary.md` — regenerated by `eval/score.mjs`.
2. `eval/analysis.md` — fill the planned analyses with measured numbers and quote real failure transcripts.
3. `spec/prompts/prompt-changelog.md` — record measured failure patterns; revise the next version accordingly.
4. This file — flip the pending rows to done; record model names and dates.
5. `README.md` — update the evaluation-status notice and the Evidence section.
6. `STATUS.md` — current state.
