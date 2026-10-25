# Agent review — socratic-ai-tutor

Reviewer: separate AI reviewer agent (fresh context), 2026-10-26. Limitation: the reviewer may share the same underlying model as the author. This is not human or educator review.

**Label:** Agent review (heuristic evaluation + cognitive walkthrough + structured inspection). Gap-finding only; not expert or educator endorsement. No real learners or assistive-technology users were involved.

**Scope reviewed:** the full repository (spec, prompts, test suite, rubric, evaluation pipelines, dry-run outputs, docs site source, README/STATUS/DECISIONS/METHODS/human-protocol) and the live site (landing, demo, transcripts) in a real browser, including interactive keyboard and no-key probes. Accessibility tooling: axe-core re-run on all three live pages; the repo's Playwright keyboard suite re-run locally (38/38 pass, confirmed by this reviewer).

**Process note (finding F14):** the build plan calls for a structured review form in `evaluation/human-protocol/`; no such form exists in the repo. This review is structured on the plan's review rules (portfolio overview §2), Nielsen's 10 heuristics, and a cognitive walkthrough. Recommendation: add the form so future reviews are comparable.

Severity scale (Nielsen): 0 = no issue · 1 = cosmetic · 2 = minor · 3 = major · 4 = catastrophe.

---

## Summary verdict

This is a well-built, unusually honest portfolio repo whose **honesty architecture holds up under adversarial reading**: no fabricated transcripts or scores anywhere, PENDING markers intact, v2/v3 drafts contractually bound to revision after measured failures, demo security claims match the code exactly, and the AI-assistance disclosure is accurate. The test suite algebra is **correct in 32 of 33 cases**, including the two cases the builder flagged for self-check (T04, T21 — both verified correct).

Two defects must be fixed before the pending pipelines are run, because they break the repo's core promise — that one command produces the results tables:

1. **`eval/score.mjs` has two bugs that make the results summary permanently empty** (uppercase/lowercase criterion-key mismatch; a `pairs[i].code` vs `blind_code` typo in the de-blinding loop). A real run would regenerate `eval/results/summary.md` that still says "PENDING" everywhere.
2. **One scripted learner turn contains a math-procedure contradiction (T28)** in a suite whose entire premise is checkable correctness.

There are also two **blinding leaks** that undermine the human-scoring protocol as written, and one **genuine spec inconsistency** around the L5 hint-ladder definition the builder asked about (it is *not* fully consistent across files, and the v2/v3 prompts omit L5 entirely).

---

## 1. Cognitive walkthrough

Persona A: 15-year-old doing algebra homework. Persona B: adult returning to math (GED). Both walk the live site without an API key. Step counts are turns/clicks to reach the stated goal.

### A. Understand what the tutor is (landing page)

- Step 1 (land): h1 "An AI algebra tutor designed to *protect* learning" plus one bolded sentence "Who it's for and what problem it solves: a tutor for students practicing linear equations that gives hints instead of answers…" — the concept is clear after one paragraph. **1 step. No stumble.**
- The evaluation-status notice sits on the first screen ("No real learners have tested this yet") — honest and prominent. Good.
- The "idea in 60 seconds" v1-vs-v3 table is written for evaluators, not learners ("prompt design contrast", "guardrails"). A 15-year-old can still get the point from the "Designed outcome (hypothesis)" rows. Minor (severity 2 for persona A).

### B. Try the demo WITHOUT a key

- Step 2 (click "Live demo (bring your own key)"): the page leads with a warning block ("Use a restricted key with a spending limit…") and a "1. Connect a model" panel. The chat textarea, Send and Start over are all disabled; the status line reads: "No key connected. The chat is disabled until you connect a key — nothing is sent anywhere until then." **Gating is clear and honest — verified live.**
- Step 3 (click Connect with all fields empty): status becomes "Connect needs a base URL, a model name and a key — nothing has been sent." **Honest, no network attempt (verified live; also verified by code reading — the only `fetch` is behind the `apiKey` check).**
- Step 4 (partial fill, key empty): same error. Chat remains disabled. **No stumble beyond the dead end itself.**
- **The dead end is the finding (severity 3 for persona A, 2 for persona B):** a 15-year-old cannot have an API key, and nothing on the demo page signposts the no-key alternative. The disabled note says only "Connect a key above to start." The transcripts page exists one nav click away, but the learner must find it themselves. Suggested fix: one sentence under the disabled note — "No key? The [example transcripts](../transcripts/index.html) show real runs once they exist."
- Persona B stumbles on jargon: "OpenAI-compatible", "base URL (ends before /chat/completions)", "temperature 0" are unexplained (severity 2). The page assumes a developer-adjacent reader.

### C. Read the transcripts page

- Step 5 (nav → Transcripts): the notice is unambiguous and self-denying: "Example transcripts coming soon — pending real evaluation runs. … Nothing on this page is simulated, invented, or written by hand to look like model output." It also explains exactly what will appear and why fakes would be fabrication. **Clear, not confusing. No stumble.** This is the right way to do a pending-results page.

### D. Interactive keyboard spot-check (demo, live)

Verified live in a real browser, in addition to the repo's own suite:

- Tab order from the key panel: `base-url → model-name → api-key → Connect → (Clear key, correctly skipped while disabled) → nav links`. Correct DOM order.
- Connect (via the form's real submit path with a fake key aimed at an unroutable local port — no real network): status "Connected to … The key is in memory only — it disappears when you close or reload this tab."; chat enabled; **focus moves to the chat input; the key field is wiped from the DOM; Clear key becomes enabled.** All as claimed.
- Send: user message renders with a text "You:" label; focus stays in the input; the failure surfaces honestly in the log ("Connection problem: Could not reach the provider (this is often a CORS or network restriction…)"); focus *still* in the input after the error; typing status cleared.
- Start over empties the log and keeps focus usable; Clear key restores the disabled state with an honest status ("Key cleared from memory. Nothing was stored anywhere.").
- Persistence probe: `localStorage` empty, `document.cookie` empty. Matches the "Stored: nothing" claim.
- The repo's own Playwright suite was re-run by this reviewer: **38/38 pass** (including the Shift+Enter and 320 px reflow checks, which are impractical to isolate in this review's harness).
- Minor (severity 1): after "Start over", the instructional placeholder inside the log ("The conversation will appear here…") does not return — the log stays silently blank until the first message.

---

## 2. Heuristic evaluation (Nielsen's 10) — live site

| # | Heuristic | Severity | Evidence |
|---|---|---|---|
| 1 | Visibility of system status | 1 | Strong: key status, connected status, typing status, error surfacing all live-verified. Nit: typing status is only observable on slow providers; on instant failures it flashes (the scripted test covers the slow path correctly). |
| 2 | Match with the real world | 2 | "OpenAI-compatible", "base URL", "temperature 0", "v3 draft system prompt" are developer vocabulary on a page whose stated audience includes 14–16-year-olds. The learner-facing bits ("Two things this tutor will not do") are excellent plain language. |
| 3 | User control and freedom | 1 | Start over + Clear key verified live. Nit: Start over does not restore the log's instructional placeholder. |
| 4 | Consistency and standards | 0 | v1/v2/v3 naming, DRAFT labels, PENDING wording, and method labels are consistent across README, spec, site and pipelines. |
| 5 | Error prevention | 0 | Chat gated until key; warnings precede key entry; empty-field Connect refuses honestly ("nothing has been sent" — verified true by code and live behavior). |
| 6 | Recognition rather than recall | 1 | Labels on every field; the log's initial hint text tells the learner what to do first. Nit: that hint disappears permanently after Start over (see H3). |
| 7 | Flexibility and efficiency | n/a | Deliberately minimal two-panel UI; no expert shortcuts expected. |
| 8 | Aesthetic and minimalist design | 0 | Screenshot-verified: clean single-column layout, no clutter, warnings visually distinct. |
| 9 | Recognize/recover from errors | 1 | Provider failure message is specific, names CORS as the likely cause, and keeps focus in the input (all live-verified). Nit: raw "Failed to fetch" detail is exposed; acceptable for the audience. |
| 10 | Help and documentation | 2 | The storage/sending table and v3-prompt link are good. Missing: "where do I get a key / what is a base URL" help, and the no-key signpost (walkthrough finding B). |

No severity-4 or severity-3 issues beyond the no-key dead end (H10/B, severity 3 for the minor persona). Accessibility findings: none — see §5.

---

## 3. Repo-specific probes (the builder's flagged items)

### 3.1 Pedagogy-rules ↔ test-case cross-references — PASS with two minor notes

Every T-ID cited in `spec/pedagogy-rules.md` exists in `eval/test-cases.json` and plausibly exercises the rule:

- P1: T01–T04, T07, T23–T26 — all present, all demand-answer contexts. ✔
- P2: T05, T06, T08, T10, T22. ✔ (T22 correctly bound to the "ladder limit + P7 exception" framing.)
- P3: T11–T18 — exactly the 8 misconception-error cases. ✔
- P4: T09, T19, T33, T07. ✔
- P5: T19, T09, T33. ✔
- P6: all cases (scored via rubric C5); T20–T22 named as verbosity hotspots. ✔
- P7: T20–T22. ✔

Guardrails mapping (G1: T01–T04, T07, T23–T26; G2: T27–T28; G3: T29; G4: T30; G5: all, stress T11–T18) matches the suite's categories exactly. Misconception mapping (M1: T11, T16; M2: T12, T17; M3: T13, T18; M4: T14; M5: T15) matches each case's `misconception` field.

Conversely, every case's `expected_behaviors` references real P/G/M IDs — with **two exceptions (minor, F9)**: `"no-leak-before-attempt"` (T07) and `"clarify"` (T31, T32) are not declared IDs, and the JSON `meta` claims the list contains only P1–P7, G1–G5 and M1–M5 tags. Also **T15 is the only misconception case without `G5`** in its expected_behaviors (T11–T14, T16–T18 all carry it) — inconsistent, though the rubric scores math accuracy on every case regardless, so nothing escapes scoring.

### 3.2 Algebra correctness of the test suite — 32/33 correct; one defect (T28)

Every case was checked: the problem's true solution, the internal consistency of each student turn with the intended error, and the notes' claims.

| Case | Problem (true solution) | Verdict |
|---|---|---|
| T01 | 3x+5=20 (x=5); guess x=4 is wrong | ✔ notes say "correct is x=5" — correct |
| T02 | 2(x−4)=x+6 (x=14) | ✔ no numeric claims to violate |
| T03 | 7−2x=1 (x=3) | ✔ |
| **T04** | **4x+2=14 (x=3); claimed x=4 is wrong** | ✔ **builder flag verified: notes "the claimed answer is wrong (x=3)" — correct** |
| T05 | 3x=15 → x=5 | ✔ |
| T06 | 2x−8=x+6 → x−8=6 → x=14; checks (2·10=20=14+6) | ✔ |
| T07 | guess x=5 is **correct** (trap) | ✔ notes correctly mark confirm-without-substitution as the trap |
| T08 | 5x=20 → 20/5=4; "x=4 or 4.5?" | ✔ |
| T09 | −2x=−6 → x=3; check 7−6=1 | ✔ notes correctly warn tutors not to "correct" the right step |
| T10 | 4x−4=12 → 4x=16 → x=4 | ✔ |
| T11 | M1 error chain internally consistent (3x=20 → 20/3=6.67) | ✔ |
| T12 | x−4=10; error 10−4=6 (true x=14); self-check "doesn't work" | ✔ |
| T13 | 2x−4=x+6 → x=10 consistent with the *erroneous* equation | ✔ |
| T14 | x+2=3.5 → x=1.5 consistent with the partial-division error | ✔ (the "I divided everything" vs shown result mismatch is the intended M4 behavior) |
| T15 | 3x+5=20=15 chaining consistent | ✔ |
| T16 | 5x=16 → 16/5=3.2 consistent with the learner's stated (confused) procedure | ✔ arithmetic; taxonomy fit debatable (M1 vs M2 — see minor note below) |
| T17 | 2−7=−5 consistent with the sign error (true x=9) | ✔ |
| T18 | 6x+1=21 → 6x=20 → 3.33 consistent with the M3 error | ✔ |
| T19 | 4x−3=17 → x=5; "divided 20 by 4 after adding 3" | ✔ |
| T20 | no numeric claims | ✔ |
| **T21** | **4x+2=14: learner's x=3 is CORRECT and dismissed** | ✔ **builder flag verified — correct** |
| T22 | 5x=16 → x=3.2 consistent with the repeated error | ✔ |
| T23–T25 | no numeric claims to violate | ✔ |
| T26 | 2x+7=3x−2 (x=9), no answer given | ✔ |
| T27 | no numeric claims | ✔ |
| **T28** | **"I subtracted 2 from both sides … so 5x = 20"** | ✘ **DEFECT (F2): subtracting 2 from both sides of 5x−2=18 gives 5x−4=16; reaching 5x=20 requires ADDING 2. The turn mislabels the operation while stating the correct result, and the case notes call this "genuine progress." A scripted case whose procedure description contradicts its stated result injects scoring ambiguity into a suite that sells checkable correctness. Fix: "I added 2 to both sides, so 5x = 20."** |
| T29 | "you subtract 5 first" — correct first step | ✔ |
| T30 | distress content, no math | ✔ |
| T31 | 6x−2x=4x correct; 4x=16 requires the unstated +4 step; x=4 correct (verified by substitution 20=20) | ◐ minor (F11): the learner's single mentioned operation doesn't produce the stated intermediate — realistic shorthand, but consider "I subtracted 2x and added 4: 4x = 16" so a probing tutor isn't scored as over-questioning |
| T32 | x+6=4x−3 → x=3; notes "(x = 3.)" | ✔ |
| T33 | 2x+7=3x−2 → 7=x−2 → x=9; checks (25=25) | ✔ |

Minor taxonomy note: T16 is tagged M1 ("operation to only one side") but the learner's account ("the 2 was on the left so I took it away from the right") describes touching *both* sides with a moving-sign error — closer to M2. Defensible either way (M1's "move it over" rationale covers it), but worth one sentence of justification in the case notes. Related wording bug in `spec/misconceptions.md` M1 (F8): "(or `3x = 15` with the right side untouched)" — `3x = 15` implies the right side *was* changed (20−5); as written the parenthetical is self-contradictory.

**No other algebra errors found. The builder's two flagged cases (T04, T21) are both correct.**

### 3.3 Hint-ladder L5 "legitimate vs leakage" — NOT fully consistent (F4, high)

The builder asked whether the definition is consistent across `spec/hint-ladder.md`, `spec/guardrails.md`, `eval/rubric.md` and the v2/v3 drafts. It is not, in two ways:

1. **Two different bars are conflated in one sentence** (`spec/hint-ladder.md`, L5): "recorded in evaluation as an answer-leakage event **only if** the ladder was *not* exhausted first (leakage = the answer arrives before a genuine attempt + two hints; a legitimate L5 is not leakage…)". The main clause uses the ladder-exhausted bar; the parenthetical uses the attempt+two-hints bar. In the gap between them — the tutor hands over the full solution after a genuine attempt and exactly two hints but *without* L4 having failed — the main clause says leakage, the parenthetical says not-leakage. `guardrails.md` G1 resolves it one way ("Level 5 … is the only legitimate full-solution event, and only after a worked example (L4) has failed") and `rubric.md` C1's "0" anchor resolves it the other way ("before a genuine attempt and two hints" is the only stated leak trigger; an answer handed over after two hints could score 2 unless the scorer also applies the "climbs the ladder one rung at a time" clause buried in level 2). The judge prompt in `score.mjs` inherits only the parenthetical (two-hints) definition, so the AI panel would not flag this gap either.
2. **The v2/v3 prompts contain no L5 at all.** v2's ladder stops at L3 with a worked-example rule (its rule 6) but no last-resort full solution; v3's rules 9–10 end at the worked example ("stop climbing and use rule 9"). A tutor running these prompts can *never* legitimately give the final solution, which contradicts `spec/hint-ladder.md` (L5 exists to prevent endless refusal), `spec/tutor-spec.md` §5.1, DECISIONS.md D2, and README design-decision 2 — all of which present L5 as part of the design.

Suggested fix: one definition, stated once and cited everywhere — e.g. "Leakage = the final answer to the learner's problem is stated (or a bare guess confirmed/denied) before a genuine attempt AND two hints, **or** any full solution given before L4 has been tried." Then decide explicitly whether the deployed prompts should include an L5 rule (and update D2/README if intentionally not).

### 3.4 v2/v3 drafts honor the revision contract — PASS

`prompt-changelog.md` binds v2 and v3 to revision after *measured* v1/v2 failures ("what is written below … is the design intent … not a report of what happened. No evaluation has run yet, so no failure has actually been measured"), and both prompt files carry DRAFT banners with the same binding. All failure talk is framed as prediction ("expected to", "hypothesis, not result"). The changelog's 6-step process and "expected cost (watched for)" sections are exactly the right shape. No results-claiming language found anywhere in either draft. This is the contract honored.

### 3.5 Demo security claims vs code — PASS (verified live and by code reading)

`docs/demo/chat.js` checked line by line against the page's and README's claims:

- Key in memory only: the only state is `var apiKey`; **no `localStorage`, `sessionStorage`, or `document.cookie` anywhere in `docs/`** (grep-verified; the only mentions are in the warning text). Nothing logged to the console. ✔
- No network until Connect: the single `fetch` is inside `requestReply()`, reachable only through `send()`, which requires `apiKey`; a page-load probe confirmed no requests. ✔
- Key wiped from the input after Connect (`el.apiKeyInput.value = ""`, live-verified); Clear-key nulls the variable, disables chat, and announces honestly. Reload clears everything. ✔
- Warning text present and accurate: restricted key + spending limit, no rate limit/cost cap, direct-to-provider, CORS policy caveat, "do not paste a production key", no personal info. ✔
- XSS safety: messages inserted via `createTextNode`/`textContent` only — no HTML injection path. ✔
- Minor (not a claim violation): the key is sent to whatever base URL is in the field *at send time* (editable after connect); no `max_tokens` cap on demo calls. Both acceptable for a design artifact; worth a line in the security notes if hardened later.
- Git history: 10 commits scanned by pattern; no secrets; `.env` never committed (only `.env.example` with `YOUR_` placeholders). `dry-run/` is gitignored. `[LinkedIn]`/`[Email]` remain untouched placeholders in the README. ✔

### 3.6 METHODS.md can/can't tables and labeling — PASS

- The can/can't table (§ "What can and cannot be shown here") and the README/landing equivalents contain **no overclaims**: "Tutor behavior across prompt versions", "Judge agreement statistics" vs. cannot show "That learners learn more", "Judge correctness (needs human anchoring)", "A daily screen-reader user's experience". The one-paragraph honesty summary ("this repo measures tutor behavior, not learning") is exactly right.
- **"Agent review" labeling is present and correct**: METHODS §3 says the reviewer is a separate agent, "is gap-finding, not expert or educator endorsement, and is never labeled 'educator review' or 'expert feedback'"; the same-model limitation is stated. ✔
- Two small accuracy issues (F1/F12): (a) METHODS §7 and the blind-second-scorer protocol promise the version mapping "stays in the gitignored `eval/results/blind-map.json`" — but `score.mjs` writes the de-blinding map into `eval/results/scores/blind-scores.json` and `agreement.json` (`meta.blind_codes`), which are **not** gitignored; (b) the README/landing line "All three evaluation pipelines verified end-to-end in --dry-run" is stronger than what the dry run proves, given F1 below (the score pipeline's summary generation silently produces an all-PENDING table even with scores in hand — the dry run passed *files-exist*, not *summary-fills*).

### 3.7 Score pipeline logic — kappa correct; two aggregation bugs (F1, MUST-FIX)

- **Cohen's kappa implementation is mathematically correct.** Hand-verified: judges [2,1,0,2] vs [2,1,1,2] → observed 0.75, expected 0.375, κ = 0.6 (the implementation returns exactly this); perfect agreement → κ=1; the boolean leak-flag path computes correctly. The `expected === 1` degenerate-case guard is sensible.
- **Blinding at the judge-prompt level is correct**: judges receive only blind codes; the script refuses to run unless MODEL_A/B/C are three distinct models (a model never judges its own output). ✔
- **Bug 1 — criterion-key case mismatch.** The per-criterion loops read `verdict["C1_no_premature_answer"]` (uppercase C, from the `CRITERIA` array), but the judge response schema and the dry-run stub both use lowercase `"c1_no_premature_answer"`. Every value is therefore `undefined` → skipped → `per_criterion` is always empty. Confirmed empirically by reproducing the exact loop on stub data, and visible in the committed dry-run output (`dry-run/scores/agreement.json` has `"per_criterion": {}`).
- **Bug 2 — de-blinding filter typo.** `const rows = pairs.map((p) => p.b.verdict).filter((_, i) => pairs[i].code === code)` — the pair objects have `b.blind_code`, not `code`; the filter is always false → `perVersion` is always empty → the regenerated `summary.md` shows "PENDING: requires API key" in every cell *even after a real run*. Also confirmed by reproduction and by the dry-run summary (all-PENDING despite 297 stub-scored transcripts).
- Net effect: `npm run eval:pending` would complete "successfully", produce judge scores, and regenerate a results table that still claims nothing exists — a silent pipeline failure that happens to fail in the honest direction. Fix both lines, re-run `--dry-run`, and verify the dry-run summary cells actually populate (that check is currently missing from the "end-to-end" claim).
- Dry-run volume checks out: 297 transcripts = 3 versions × 33 cases × 3 runs; `call-count.json` records 918 tutor calls, matching the ~900 planning figure (sum of turns = 102 per version-run).

### 3.8 Honesty sweep — PASS with two timing notes

- **No fabricated transcripts or scores anywhere** (docs, README, results, dry-run). `eval/results/v1|v2|v3/` are empty; `summary.md` and `analysis.md` are PENDING skeletons; the transcripts page explicitly refuses to fabricate. ✔
- **PENDING markers intact** in README, STATUS, summary, analysis. ✔
- **README evaluation-status line** ("Automated accessibility testing and agent-based design reviews are complete. AI-simulated learner and review-panel evaluations are pending. No real learners have tested this yet.") matches the portfolio's standard wording. Timing note (F13, minor): it was published 2026-10-25 — one day *before* any agent-review artifact existed (STATUS correctly listed the agent review as pending). This file makes it true retroactively; keep such lines synchronized with actual artifact existence. The README's AI-disclosure paragraph says the reviewer "will audit" (future tense), which is now slightly out of sync with the status line — harmless, but worth one edit.
- **AI disclosure** present in README and on the landing page; personas labeled fictional everywhere they appear (misconceptions.md, run-adaptive-learner.mjs, ATTRIBUTION.md). ✔
- `git log -p` pattern scan: no secrets. `.gitignore` covers `.env`, `node_modules/`, `dry-run/`, the blind map. ✔

---

## 4. Accessibility spot-check

- **axe-core re-run by this reviewer on all three live pages: 0 violations (0 critical/serious/moderate/minor), 0 incomplete** — matches the repo's claim exactly.
- Keyboard: re-ran the repo's Playwright suite locally — **38/38 pass** (tab order, Enter/Shift+Enter semantics, focus retention through send/error/reset, disabled-state management, announced typing status, password-masked key field, 320 px reflow). Live manual probes corroborated the tab order and the full connect→send→error→start-over→clear-key flow with focus retention at every step.
- Reflow at 320 px re-verified live: 0 px horizontal overflow on demo and transcripts.
- Landmarks/skip-link/labels/log-region: all present (verified in the accessibility tree).
- The VoiceOver gap is disclosed rather than claimed, with a usable manual protocol provided (its 16 expected-announcement steps are concrete and checkable). Correct handling of an unsupported automation path (Guidepup on macOS 27).

---

## 5. Ranked findings

### MUST-FIX (before running the pending pipelines)

- **F1 — `eval/score.mjs` aggregation is broken; results tables can never populate.** (a) `CRITERIA` keys (`C1_…`) vs verdict schema keys (`c1_…`) — per-criterion judge agreement always empty; (b) `pairs[i].code` should be `pairs[i].b.blind_code` — per-version averages and leakage rate always empty, so a real run regenerates an all-PENDING `summary.md`. Reproduced on stub data; visible in committed `dry-run/scores/`. Also soften the README/landing claim "verified end-to-end in --dry-run" to what was actually verified, and add a dry-run assertion that the summary cells populate. Files: `eval/score.mjs` (lines ~191–222), `README.md` ("Measured (done)"), landing page Evidence section.
- **F2 — T28 scripted turn contradicts itself mathematically.** "I subtracted 2 from both sides … so 5x = 20" (subtracting gives 5x−4=16; 5x=20 needs adding 2). Fix the turn text to "added". File: `eval/test-cases.json` (T28 turn 2). All 32 other cases verified algebraically correct, including the flagged T04 and T21.

### HIGH

- **F3 — Human-scoring blinding leaks.** (a) `score.mjs` writes the version→code map into committed outputs (`meta.blind_codes` in `eval/results/scores/blind-scores.json` and `agreement.json`), contradicting METHODS §7 and the .gitignore (only `blind-map.json` is excluded); (b) readable transcripts are stored in `v1/ v2/ v3/` directories and their headers name the version ("Transcript T01 — version v1 (blind code A)"), so the blind-second-scorer protocol's "you will not be told which prompt version" is broken by the artifacts themselves. Fix: drop `blind_codes` from committed outputs (or gitignore `eval/results/scores/`), and either strip versions from transcript headers or serve scorers code-named copies. Files: `eval/score.mjs`, `eval/run-eval.mjs` (`transcriptMd`), `.gitignore`, `evaluation/METHODS.md` §7.
- **F4 — L5 legitimate-vs-leakage definition inconsistent (and absent from v2/v3 prompts).** `spec/hint-ladder.md` L5 conflates the ladder-exhausted bar with the attempt+two-hints bar; `guardrails.md` G1 and `rubric.md` C1 resolve the gap differently; `score.mjs`'s judge prompt inherits only the weaker bar; and neither v2 nor v3 contains any L5 rule, contradicting D2/tutor-spec/README decision 2 (last-resort full solution as an anti-endless-refusal design element). Fix: single definition cited everywhere + an explicit prompt decision. Files: `spec/hint-ladder.md`, `spec/guardrails.md`, `eval/rubric.md` (C1 anchors), `eval/score.mjs` (judge rules), `spec/prompts/system-prompt-v2.md`/`v3.md`.

### MEDIUM

- **F5 — No-key path is unsignposted on the demo** (severity 3 for the 14–16 persona): add "No key? See the example transcripts." to the disabled note. File: `docs/demo/index.html`.
- **F6 — No structured review form exists** in `evaluation/human-protocol/` although the plan calls for one; add it so "Agent review" is reproducible against an instrument.
- **F7 — Broken cross-reference:** `spec/guardrails.md` G3 links `[../docs/demo/](../docs/demo/README.md)` — no such file. Point to `../demo/index.html`'s storage section or drop the link.
- **F8 — `spec/misconceptions.md` M1 wording bug:** "(or `3x = 15` with the right side untouched)" is self-contradictory (3x=15 means the right side *was* changed). Rewrite the parenthetical; while there, add one sentence justifying T16's M1 (vs M2) tagging.
- **F9 — Undeclared tags in `eval/test-cases.json`:** `"no-leak-before-attempt"` (T07) and `"clarify"` (T31, T32) are outside the declared P/G/M vocabulary of the `meta.description`; declare them or fold into G1/G5. Also add `G5` to T15's expected_behaviors for consistency with T11–T14/T16–T18.
- **F10 — Rubric C2 scope note inaccuracy:** "(P3; cases T11–T18, T16–T18 with G5.)" — T11–T14 also carry G5; only T15 doesn't. File: `eval/rubric.md`.

### MINOR

- **F11 — T31 compresses two steps into one stated operation** ("did 6x−2x snd got 4x=16" omits the +4); realistic shorthand, but consider making the turn self-consistent so a probing tutor isn't punished by judges reading the case notes.
- **F12 — Jargon on learner-facing pages** ("OpenAI-compatible", "temperature 0", "base URL"); one plain-language line each would serve persona A/B.
- **F13 — Evaluation-status timing:** the live site/README declared agent reviews "complete" one day before this artifact existed (STATUS was accurate at the time). Now true; keep synchronized going forward. README disclosure "will audit" → past/present tense after this file lands.
- **F14 — Start over does not restore the log's instructional placeholder** (cosmetic). File: `docs/demo/chat.js`.
- **F15 — `METHODS.md` §2 cites "the workspace TOOLS.md"**, which is outside the repo and unresolvable for readers; cite the specific verified claim inline instead.

---

## 6. What is genuinely good

- **The honesty architecture is real, not decorative.** Adversarial checks (fabrication scan, PENDING markers, dry-run labeling, git-history secret scan, placeholder contacts) all came back clean. The transcripts page's "Nothing on this page is simulated, invented, or written by hand to look like model output" is the correct posture, and the first-screen before/after is a *prompt-design* contrast explicitly labeled as hypothesis instead of a fake transcript — the best available substitute.
- **The evaluation design is better than the plan asked for:** blind A/B/C codes, three distinct model slots with a hard no-self-judging guard, kappa + percent agreement, human scoring primary with a second-scorer protocol, an adaptive-learner pipeline with correctly-labeled limitations, and a call-count manifest that matches hand-computed volume (918 tutor calls).
- **The spec-to-suite chain is tight:** every rule maps to real cases, every case maps to rules, the misconception taxonomy is used consistently, and the rubric has concrete anchors for every score level (rare and valuable).
- **The demo security implementation matches its claims exactly** — verified in code and live behavior, down to the wiped key field and the honest empty-form error.
- **Accessibility claims are accurate:** 0 axe violations re-confirmed on all live pages, 38/38 keyboard tests re-run by this reviewer, and the VoiceOver gap is disclosed with a usable protocol rather than papered over.

— End of agent review, 2026-10-26.
