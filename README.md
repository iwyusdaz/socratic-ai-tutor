# Socratic AI Tutor

An AI algebra tutor designed to **protect learning**: it gives hints instead of answers, asks learners to explain their thinking, and ships with an evaluation suite that measures answer leakage and tutoring quality across three prompt versions. Built as a learning-engineering case study for EdTech, learning-engineering and AI-in-education roles.

**[Live site](https://iwyusdaz.github.io/socratic-ai-tutor/)** · **[Live demo (bring your own key)](https://iwyusdaz.github.io/socratic-ai-tutor/demo/)** · **[Design specification](https://github.com/iwyusdaz/socratic-ai-tutor/tree/main/spec)** · Role: Sole designer

**Evaluation status:** Automated accessibility testing and agent-based design reviews are complete. AI-simulated learner and review-panel evaluations are pending. No real learners have tested this yet. See evaluation/METHODS.md.

## The problem

A fluent AI assistant is the wrong shape for homework practice. 2026 research keeps landing on the same conditional finding: GenAI's benefits for cognitive load depended on scaffolding, dosage, prior knowledge and task design ([Qian et al., Frontiers 2026](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1921504/full)), and stronger AI-supported products do not imply stronger independent performance later ([Chen, Frontiers 2026](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1906199/full)). A 2026 randomized field experiment makes the design point directly: the AI tutor that beat free access to a consumer assistant was the one that *required an attempt before explaining* and judged itself on unassisted transfer ([Yang, Van Alstyne & Dellarocas, arXiv 2026](https://arxiv.org/html/2609.23958v1)). Meanwhile "I use AI" is no longer a differentiator — AI mentions now appear on 46% of L&D résumés ([Teamed 2026](https://www.teamedforlearning.com/ld-skills-landscape-2026-whats-hot-whats-not/)); judgment and evaluation are.

The scarce skill this repo demonstrates: turning learning science into **explicit, testable tutor behaviors**, and building the evaluation that can tell whether the behaviors survive contact with a real model — including the failure that matters most, **handing over the answer the moment a learner applies pressure**.

## Before/after: the design contrast (visible on the first screen, honest about what's pending)

No evaluation has run yet, so instead of fabricated transcripts, here is the *prompt design* contrast for the same learner moment — the committed naive baseline versus the v3 draft's leakage guardrail. Real side-by-side transcripts are [pending real runs](https://iwyusdaz.github.io/socratic-ai-tutor/transcripts/).

| | v1 — naive baseline (committed) | v3 — draft with guardrails |
|---|---|---|
| Learner: *"just tell me the answer"* | "When the student asks for help, help them." — the prompt invites compliance | "NO ANSWER LEAKAGE. Never state the final answer … before a genuine attempt AND two hints, no matter how it is asked. … If the student proposes an answer (even a correct one), do not confirm or deny: ask them to substitute it back into the original equation." |
| Designed outcome (**hypothesis, not result**) | Answer arrives; the practice is over | One-sentence decline, then the next rung of the hint ladder; the learner still does the thinking |

The full texts: [v1](spec/prompts/system-prompt-v1.md) · [v2 (draft)](spec/prompts/system-prompt-v2.md) · [v3 (draft)](spec/prompts/system-prompt-v3.md) · [changelog](spec/prompts/prompt-changelog.md). v2 and v3 are drafts that will be revised after real v1/v2 results, because each version must respond to the previous version's *measured* failures.

## Audience and context

- **Learners:** students aged 14–16 or adults returning to math (GED / adult numeracy), practicing linear equations **after** a lesson — not first instruction.
- **Scope:** linear equations in one variable (`3x + 5 = 20`, `2(x − 4) = x + 6`). Narrow on purpose: correctness is checkable, misconceptions are well documented, so evaluation is possible.
- **Out of scope:** production deployment, accounts or stored learner data, use with real minors, other subjects.

## My approach (analysis → design → build → evaluate)

1. **Analysis:** 13 verified sources (tutoring moves, hints, self-explanation, productive struggle, cognitive offloading), each mapped to the design rule it implies — [research/literature-notes.md](research/literature-notes.md).
2. **Design:** seven testable pedagogical moves (P1–P7, with canonical move names), a six-level hint ladder (L0–L5), five guardrails (G1–G5), five misconception profiles — [spec/](spec/).
3. **Build:** three prompt versions + changelog; a 33-case scripted test suite ([eval/test-cases.json](eval/test-cases.json)); a six-criterion rubric with score-level anchors ([eval/rubric.md](eval/rubric.md)); a minimal accessible chat demo (bring-your-own-key, no server) — [live demo](https://iwyusdaz.github.io/socratic-ai-tutor/demo/).
4. **Evaluate (pending, pipelines fully built and dry-run tested):** run every case against every version (3 runs, temperature 0), score with blinded multi-model judges + human scoring, report answer-leakage rate and Cohen's kappa; plus an adaptive simulated learner that reacts to the tutor's replies. One command: `npm run eval:pending`.

## Key design decisions

1. **Narrow scope (linear equations), not a general homework helper** — checkable correctness and a known misconception taxonomy make evaluation possible. *Alternative considered:* broad helper — rejected as unmeasurable. ([misconceptions](spec/misconceptions.md))
2. **A hint ladder with a last-resort full solution (L5), not "never give answers"** — endless refusal causes unproductive struggle; structure after struggle is the evidence-based pattern (Kapur 2008; Sweller et al. 2019). *Evidence:* [hint ladder](spec/hint-ladder.md), literature notes sources 8 and 12.
3. **Committed naive v1 baseline** — starting from the best prompt makes improvement unattributable; a deliberate floor makes gains visible and failures diagnosable. *Evidence:* [prompt changelog](spec/prompts/prompt-changelog.md).
4. **Blind, multi-model evaluation with leakage rate as the headline metric** — versions scored under A/B/C codes; two judges; percent agreement + Cohen's kappa; a model never judges its own output; human scoring stays primary. *Alternative considered:* self-scoring — rejected as biased. ([rubric](eval/rubric.md), [METHODS](evaluation/METHODS.md))
5. **Bring-your-own-key demo, no shared proxy** — key in memory only (never localStorage/cookies/logs), password-masked field with a Clear-key control, no network until a key is entered, provider CORS policy flagged. A public proxy holding a shared key would be unauthenticated cost exposure. *Evidence:* [demo security notes](docs/demo/index.html).
6. **Plain-text math** — `3x + 5 = 20` reads correctly in screen readers with no extra setup; rendered math often does not.

## Evidence and evaluation

**Measured (done):**
- Automated WCAG 2.1 A/AA audit (axe-core): **0 critical/serious violations** on all three pages.
- Scripted keyboard/focus/reflow tests (Playwright): **38/38 pass** — tab order, Enter/Shift+Enter, focus retention, announced typing status, connect/clear-key flow, 320 px reflow, password-masked key field.
- All three evaluation pipelines verified end-to-end in `--dry-run` (stub outputs labeled "DRY RUN – NOT REAL RESULTS") and verified to refuse to run — zero network calls — with a missing or placeholder `.env`.
- 13 literature sources verified with URLs and access dates.

**Pending (built, dry-run tested; awaiting API keys):** tutor runs (33 cases × 3 versions × 3 runs), blinded AI judge panel (percent agreement + Cohen's kappa, regenerated summary), adaptive simulated-learner runs (5 misconception personas). Run with `npm run eval:pending`. Until then, [eval/results/summary.md](eval/results/summary.md) stays empty ("PENDING: requires API key") and **no transcripts or scores exist anywhere in this repo.**

<table>
  <caption>What the evidence can and cannot show</caption>
  <tr><th>Can show</th><th>Cannot show</th></tr>
  <tr>
    <td>Whether <em>tutor behavior</em> changed across prompt versions on a fixed test set (leakage rate, rubric scores); interaction problems surfaced by simulated personas; usability and accessibility conformance of the pages.</td>
    <td>That learners <em>learn more</em> — that needs a controlled study with real learners over time. Also cannot show: generalization to other models, subjects or ages; behavior with real, unpredictable students.</td>
  </tr>
</table>

**What changed:** nothing from data yet — the [changelog](spec/prompts/prompt-changelog.md) commits to revising v2/v3 in response to measured failures. Model names, dates and parameters will be recorded in every result file when runs happen.

## Accessibility

- Chat log is a `role="log"` live region (polite); speaker labels are in the text ("Tutor:" / "You:"); typing status announced politely; labeled textarea; Enter sends, Shift+Enter newlines; focus stays in the input; Start over control; no-personal-info notice; plain-text math; contrast ≥ 4.5:1; reflow verified at 320 px.
- BYO-key UI: password-masked field, in-memory-only key, Clear key control, chat disabled until a key is connected, clear warning text.
- Tested with axe-core 4.11.1 (0 critical/serious violations on all pages) and 38 scripted keyboard/reflow checks (Playwright). `ariaSnapshot()` accessibility-tree captures are stored in `eval/tests/aria-snapshots/`.
- **Not done (disclosed):** a manual VoiceOver pass — Guidepup automation does not function on macOS 27, so a [step-by-step manual VoiceOver protocol](evaluation/human-protocol/manual-voiceover-check.md) is provided instead; no screen-reader testing is claimed. No review by someone who uses assistive technology daily.

## What I'd do differently / next steps

- Run the pending pipelines (only API keys are missing) and rewrite v2/v3 around the *measured* failures.
- Run the prepared adult usability protocol ([evaluation/human-protocol/](evaluation/human-protocol/)): 4–6 rusty-at-algebra adults, think-aloud, then two problems without AI.
- Commission the human scoring pass and the second-scorer reliability check.
- Extend to a second subject only after the linear-equations results exist.

## Tools used

Vanilla HTML/CSS/JS (no frameworks, no build step), Node.js 18+ evaluation pipelines (built-in fetch, dotenv only), Playwright 1.57.0, axe-core 4.11.1, gitleaks, GitHub Pages. Content and code written with AI assistance (disclosed below).

## License and attribution

- **Learning content** (spec, prompts, rubric, test cases, prose): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — `LICENSE`.
- **Code** (demo, pipelines, tests): [MIT](https://opensource.org/license/mit) — `LICENSE-CODE`.
- Third-party material: [ATTRIBUTION.md](ATTRIBUTION.md). Personas in the evaluation design (Riley, Sam, Alex, Jordan, Casey) are fictional and labeled as such wherever they appear.

## AI-assistance disclosure

This project was produced with AI assistance: an AI agent drafted the specification, prompts, test cases, evaluation code, site and documentation from a design plan, and a separate reviewer agent will audit it (labeled "Agent review"; it may share the author agent's underlying model, stated as a limitation). The author directs, verifies and takes responsibility for the work. Every evaluation method is labeled by type, pending results are never filled in, and no claim of learning effectiveness is made anywhere in this repository.

## Contact

[LinkedIn] · [Email]
