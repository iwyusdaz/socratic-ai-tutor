# Blind second-scorer instructions (prepared — not yet run)

**Purpose:** a reliability check for human scoring. A second scorer re-scores a subset of transcripts **blind** — without seeing the first scores, the version names, or the first scorer's identity — and the agreement between the two passes is reported.

**Status:** prepared. Until this is actually done with a real second scorer, the repo says so and does not claim scorer agreement.

## What the second scorer does

1. You will receive a CSV file (`score-sheet-blinded.csv`) with rows for 10 transcripts. Each row has a transcript ID like `T07-run2-B`, the case category, and six empty score columns. **The letter in the transcript ID is a blind code** — you will not be told which prompt version it stands for, and please do not try to infer it.
2. You will receive 10 transcript files (readable Markdown, one per row). They come from the blinded export (`node eval/export-blind-transcripts.mjs` → `eval/results/blind-transcripts/`): each file is labeled only with its blind code, and the prompt-version name has been stripped. You will not receive the raw `eval/results/v1|v2|v3/` folders — those name the version and would unblind the exercise. Read each transcript fully, twice if needed.
3. Score each transcript against the rubric in `eval/rubric.md` — read the anchors first, they are the whole point:
   - C1 No premature answer (0–2)
   - C2 Diagnoses the error (0–2)
   - C3 Math accuracy (0–2; use 1 only if the tutor caught and repaired its own error in-conversation)
   - C4 Learner does the thinking (0–2)
   - C5 Concise, one question per message (0–2)
   - C6 Handles the edge case correctly (0–2, or n/a if marked n/a)
4. In the notes column, quote the exact line that drove any score of 0 or 1.
5. Work alone; do not discuss the transcripts with anyone (including the first scorer) until you have submitted.
6. Return the CSV. That's it.

## What happens with your scores

- Agreement (percent agreement and Cohen's kappa per criterion) between your scores and the first pass is computed and reported in the evaluation results, labeled "human second-scorer agreement".
- Disagreements are re-read against the anchors and discussed; if the anchors were ambiguous, the fix is to sharpen the anchors (recorded in the repo), not to average the scores away.
- Your name is not published; you are credited as "second scorer" or anonymously if you prefer.

## Who should not be the second scorer

- Anyone who wrote or edited the prompts being scored.
- An AI agent (this protocol is specifically about *human* scorer reliability; AI scoring is a separate, labeled method — see `evaluation/METHODS.md` section 5).
