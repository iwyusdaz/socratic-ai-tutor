# Usability session protocol (prepared — not yet run)

**Label for any results:** "Usability session (real participant)" — qualitative and exploratory. **No causal claims.**

## Overview

- **Participants:** 4–6 adults who are rusty at algebra (target: haven't taken a math course in 3+ years). Adults only — no minors.
- **Format:** 45–60 minutes, one participant at a time, think-aloud.
- **Setup:** the participant uses the [demo](../../docs/demo/index.html) with the organizer's own restricted API key on a provided device (the participant never handles a key). Screen and audio recorded only with consent.
- **Tutor version:** v3 (current draft) at the time of the study; record the model name and date in the session log.

## Session flow

1. **Welcome + consent (5 min).** Read [consent-text.md](consent-text.md). Answer questions. Confirm recording permission. Explain: the tutor is being evaluated, not the participant; there is no pass/fail; they can stop at any time.
2. **Warm-up task (3 min).** "Solve `x + 3 = 10` out loud, telling me what you're thinking." Confirms the participant can think aloud. Not scored.
3. **Tutor problems (3 × 8–10 min).** The participant asks the tutor for help with, in order:
   - `3x + 5 = 20`
   - `2(x − 4) = x + 6`
   - `4x + 2 = 14` (or a fresh equation of similar difficulty)
   Prompt: "Work with the tutor however you normally would. Say what you're thinking."
   Organizer notes: hints given per problem; whether the tutor leaked the answer; whether the participant explained their thinking when asked; moments of frustration or delight (quote them).
4. **No-AI problems (2 × 5 min).** "Now two problems on paper, without the tutor: `5x − 2 = 18` and `2x + 7 = 3x − 2`." Record: solved or not, steps used, asked-for-help moments (organizer does not help beyond "do what you can").
5. **Debrief (5–8 min).** Questions: What did the tutor do that helped? What was annoying? Did you ever want it to just tell you the answer? Would you use it again?
6. **Close.** Thank them; restate how their notes will be used; remind them they can withdraw their notes within 14 days.

## Recording template (one row per session)

| Field | Notes |
|---|---|
| Participant code (P1–P6, no names) | |
| Date, tutor model, tutor prompt version | |
| Hints used per problem (1–3) | |
| Solved with tutor? (Y/N per problem) | |
| Tutor leaked answer? (Y/N + quote) | |
| Explained thinking when asked? (always / sometimes / never) | |
| Solved no-AI problems? (Y/N per problem) | |
| Frustration points (quotes) | |
| Positive moments (quotes) | |
| Would use again? | |

## Reporting rules

- Report as "Usability session (real participant)", qualitative and exploratory, n = 4–6.
- Report hint counts and no-AI solves descriptively; **no** learning-gain claims, no statistics, no generalization beyond "these participants".
- Quote participants anonymously by code; do not publish anything that could identify them.
- If findings lead to prompt or UI changes, record them in [DECISIONS.md](../../DECISIONS.md).
