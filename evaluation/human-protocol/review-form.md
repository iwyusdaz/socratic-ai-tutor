# Structured review form (prepared — use for every structured review pass)

**Purpose:** make structured reviews of this repo comparable across rounds and reviewers. The first pass to use it was the [agent review](../agent-review.md) (2026-10-26); that review's structure — clarity, accuracy, usefulness, gaps, plus a severity scale — is the template below. An AI reviewer fills in the same form a human reviewer would; the label on the output must still say what produced it ("Agent review", "Educator review", "Peer review" — never invented endorsement).

**How to use:** copy this file, fill every field, save the result under `evaluation/` with a name that states the reviewer type and date (e.g. `agent-review-2026-10-26.md`), and disclose the reviewer's limitations (same-model note for AI reviewers, no-minors note always).

---

## 1. Reviewer and scope

- Reviewer and type of review: ______ (e.g. "separate AI reviewer agent, fresh context" / "human educator")
- Date: ______
- Disclosure (required): reviewer limitations, e.g. shared underlying model with the author, no real learners involved: ______
- Scope reviewed (artifacts + live pages): ______
- Method used (heuristics, walkthrough, inspection, checks): ______

## 2. Severity scale (Nielsen)

0 = no issue · 1 = cosmetic · 2 = minor · 3 = major · 4 = catastrophe. Record one severity per finding; "severity 3 for one persona only" is allowed and should be noted.

## 3. Clarity (rate 0–2 each, 2 = clear with no stumble)

| # | Question | Score (0–2) | Evidence / notes |
|---|---|---|---|
| C1 | Can the stated audience understand what this is within one screen? | ______ | ______ |
| C2 | Is the pending/done status of every evaluation method stated where the claim is made? | ______ | ______ |
| C3 | Are the spec, rubric and test suite readable without the author's help? | ______ | ______ |
| C4 | Are learner-facing pages free of unexplained jargon? | ______ | ______ |

## 4. Accuracy (rate 0–2 each; 0 = a claim contradicts an artifact)

| # | Question | Score (0–2) | Evidence / notes |
|---|---|---|---|
| A1 | Does every "done" claim match a verifiable artifact (command output, file, live page)? | ______ | ______ |
| A2 | Is the honesty architecture intact (no fabricated transcripts/scores, PENDING markers intact, dry-run outputs labeled)? | ______ | ______ |
| A3 | Are the demo's security claims true of the code (storage, network, logging)? | ______ | ______ |
| A4 | Is the checkable content actually correct (e.g. the test suite's algebra)? | ______ | ______ |
| A5 | Are cross-references consistent (spec ↔ suite ↔ rubric ↔ pipelines ↔ docs)? | ______ | ______ |

## 5. Usefulness (rate 0–2 each)

| # | Question | Score (0–2) | Evidence / notes |
|---|---|---|---|
| U1 | Does the repo demonstrate the skill it claims (design → evaluation, not just a chat UI)? | ______ | ______ |
| U2 | Can a stranger reproduce the evaluation (commands, env, protocols)? | ______ | ______ |
| U3 | Are the disclosed limitations the *right* ones (the ones a skeptical evaluator would ask about)? | ______ | ______ |

## 6. Gaps and defects

List every finding, one row each, with the file/page, severity, evidence, and a suggested fix. Mark MUST-FIX items (anything that breaks a pipeline, a claim, or safety).

| # | Severity (0–4) | Area / file | Finding and evidence | Suggested fix |
|---|---|---|---|---|
| 1 | ______ | ______ | ______ | ______ |
| 2 | ______ | ______ | ______ | ______ |
| 3 | ______ | ______ | ______ | ______ |

## 7. Reproduction data (so findings are checkable)

- Commands run and their results: ______
- Live-page probes performed (keyboard, no-key, network): ______
- Tooling and versions (axe-core, Playwright, gitleaks): ______

## 8. Verdict

- Overall verdict in two or three sentences: ______
- MUST-FIX before any real evaluation run: ______
- Postponed / noted-only items: ______
