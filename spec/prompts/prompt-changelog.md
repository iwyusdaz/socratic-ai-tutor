# Prompt changelog

**Version:** 1.0 · 2026-10-25

Three versions of the tutor's system prompt. v1 is the committed baseline; **v2 and v3 are DRAFTS** (full text written from the design plan). All three will be evaluated with the same test suite and rubric.

> **Important (binding on this repo's evaluation plan):** v2 and v3 **will be revised after real v1 and v2 results exist.** Each version must respond to the *measured* failures of the previous version. What is written below about v2/v3 is the *design intent* — a hypothesis about which changes fix which failures — not a report of what happened. No evaluation has run yet, so no failure has actually been measured.

---

## v1 — naive baseline (committed)

**What it is:** "You are a helpful math tutor. Help the student solve linear equations." Expanded only enough to define the subject. No pedagogy rules, no ladder, no guardrails.

**Why it exists:** The improvement story needs a floor. Starting with the best prompt makes later gains unattributable; a deliberately naive baseline makes them measurable (and the *failure modes* of the default assistant behavior visible in transcripts).

**Expected role in results:** predicted to leak answers on request, correct rather than diagnose, and run long. **These are predictions, not findings.**

## v2 — DRAFT: rules first (pending revision after v1 results)

**What changed (design intent):** adds the seven pedagogical moves explicitly — attempt-first, one-rung hint ladder, expose-don't-correct, confirm-and-ask-why, short turns, worked example after repeated failure, similar problem after success — plus enumerated leakage-resistance phrasings, off-topic/personal-info/distress handling, and an arithmetic self-check. Full text: [system-prompt-v2.md](system-prompt-v2.md).

**Why (which v1 failures it targets):** each v2 rule maps to one expected v1 failure in a table in the v2 file. The predicted headline fixes: answer-leakage rate drops (rule 7), "learner does the thinking" scores rise (rules 1–2), concision scores rise (rule 5).

**Expected cost (watched for, not yet measured):** rule-heavy prompts can make a tutor rigid — refusing to give a worked example even after genuine repeated failure, or sounding cold. The rubric's edge-case and concision criteria plus the transcripts will show whether the guardrails over-trigger.

## v3 — DRAFT: contract, state-tracking and self-check (pending revision after v2 results)

**What changed (design intent):** moves the success definition into the prompt ("the learner solves a new problem with fewer hints"), makes hint-level tracking explicit, sharpens the error-questioning rule (never name the misconception), makes guesses zero-information (substitution check instead of confirm/deny), extends the pre-send self-check with a leakage re-read, adds escalation guards (3 hints without progress → worked example; silence → wait), and closes with a contract reminder. Full text: [system-prompt-v3.md](system-prompt-v3.md).

**Why (which v2 failures it targets):** v2 is *expected* to leave leakage persisting under multi-turn pressure, hint-level drift, and label-y diagnostics. **This is a hypothesis.** v3's actual content will be rewritten around whatever v2 measurably fails at; if v2 works better than expected, v3 may end up as a light-touch variant (e.g. only the self-check extension).

**Expected cost (watched for):** a longer prompt risks diluting attention on any single rule, and over-constraining can hurt the warmth the frustration cases need.

---

## Process this changelog commits to

1. Run v1 on the full suite (`eval/run-eval.mjs`, 3 runs/case, temperature 0), score it (human scoring primary; AI judge panel reported only with agreement stats — see [../../evaluation/METHODS.md](../../evaluation/METHODS.md)).
2. Identify the 3 biggest measured failure patterns from v1 transcripts.
3. Revise v2 around those patterns; re-run; score.
4. Identify what v2 still fails at; revise v3; re-run; score.
5. Record per-version: what changed, which measured failures drove it, expected effect, and the observed result (added after each run).
6. Update [../../eval/results/summary.md](../../eval/results/summary.md), [../../eval/analysis.md](../../eval/analysis.md) and the README evaluation notice after each run.

**Until step 1 happens, every results table in this repo stays empty and marked "PENDING: requires API key."**
