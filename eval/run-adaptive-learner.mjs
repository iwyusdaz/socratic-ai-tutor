#!/usr/bin/env node
// run-adaptive-learner.mjs — adaptive simulated learner — PENDING PIPELINE (requires API key).
//
// What it does when run for real:
//   - MODEL_C plays five misconception personas (from spec/misconceptions.md),
//     one conversation per persona per problem (5 personas x 2 problems = 10 runs).
//   - Unlike run-eval.mjs's scripted turns, the simulated learner READS the
//     tutor's reply and adapts its next turn — a real two-way conversation.
//   - MODEL_A tutors with the chosen prompt version (default v3; --version vN).
//   - A run ends when the learner marks [SOLVED] or [GAVE UP], or after 12
//     learner turns.
//   - Saves results/adaptive/<persona>-<problem>-run.json + readable .md.
//
// Honesty rules encoded here:
//   - Every output is labeled "AI-simulated persona" — never a real learner.
//   - Simulated runs CANNOT show learning gains: the persona model already
//     knows the math. These runs surface interaction problems (tutor flooding,
//     wrong ladder escalation, ignoring the persona's misconception), which is
//     all they will ever be used for. See evaluation/METHODS.md.
//   - Dry-run stubs go to dry-run/ headed "DRY RUN – NOT REAL RESULTS".
//
// Usage:
//   node eval/run-adaptive-learner.mjs                    (real run; needs .env)
//   node eval/run-adaptive-learner.mjs --dry-run          (no network)
//   node eval/run-adaptive-learner.mjs --version v1       (tutor prompt version, default v3)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireSlots, isDryRun, ensureDir, writeJson, writeText, chat, loadSystemPrompt, flagValue, DRY_RUN_HEADER } from "./lib/env.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = isDryRun(process.argv);
const version = flagValue(process.argv, "--version", "v3");
const outRoot = dry ? path.join(repoRoot, "dry-run", "adaptive") : path.join(repoRoot, "eval", "results", "adaptive");
const dryHeader = () => (dry ? `${DRY_RUN_HEADER}\n\n` : "");

const MAX_LEARNER_TURNS = 12;
const TEMPERATURE = 0;

const PERSONAS = [
  { id: "P-M1", misconception: "M1", name: "Riley (fictional)", persona: "Applies each operation to only one side of the equation (e.g. subtracts 5 from the left side but leaves the right side unchanged). Believes 'move it over' means just erasing it from where it was." },
  { id: "P-M2", misconception: "M2", name: "Sam (fictional)", persona: "Makes sign errors when moving terms across the equals sign (e.g. from x - 7 = 2 writes x = 2 - 7 = -5). Confidently states wrong signed results." },
  { id: "P-M3", misconception: "M3", name: "Alex (fictional)", persona: "Distributes incorrectly: multiplies only the FIRST term inside parentheses, e.g. 2(x - 4) = 2x - 4. Does not notice anything wrong when asked to expand." },
  { id: "P-M4", misconception: "M4", name: "Jordan (fictional)", persona: "Divides only some terms by the coefficient, e.g. from 4x + 2 = 14 writes x + 2 = 3.5. Usually does this silently as 'get rid of the 4'." },
  { id: "P-M5", misconception: "M5", name: "Casey (fictional)", persona: "Treats the equals sign as 'the answer comes next' and chains results down the page: 3x + 5 = 20 = 15 = 5. Resists the idea that both sides must stay equal." }
];

const PROBLEMS = ["3x + 5 = 20", "2(x - 4) = x + 6"];

const learnerSystem = (p, problem) => `You are simulating a student learning algebra. This is an AI-SIMULATION for design evaluation — your output is never treated as a real learner's.

Persona: ${p.name}, ${p.persona}
The persona is practicing AFTER a lesson and wants to solve the problem, but their misconception is their default behavior: they should naturally slip into it, and correct it only if the tutor's questions lead THEM to see it (never because you, the model, know better).

Problem: ${problem}

Rules:
- Output ONLY the student's next message. No stage directions, no commentary, no quotes around it.
- 1-3 sentences per message, like a real chat student.
- Slip into the misconception naturally at least twice before correcting it, even if the tutor's hints are good.
- If the tutor gives away the answer or solves the step, go along passively (that is useful evaluation data), but do not celebrate it.
- If you have solved and VERIFIED the problem (substituted back), end your message with the exact token [SOLVED].
- If after 8+ tutor messages you still cannot progress, end your message with [GAVE UP].`;

// ---- slots (validated before any network-capable code path) ----
let tutorSlot, learnerSlot;
if (dry) {
  tutorSlot = { prefix: "MODEL_A", model: "dry-run-stub-tutor" };
  learnerSlot = { prefix: "MODEL_C", model: "dry-run-stub-learner" };
} else {
  const slots = requireSlots(["MODEL_A", "MODEL_C"]);
  tutorSlot = slots.MODEL_A;
  learnerSlot = slots.MODEL_C;
}

const tutorPrompt = loadSystemPrompt(repoRoot, version);
ensureDir(outRoot);

const STUB_LEARNER = {
  "P-M1": ["I subtract 5 from the left: 3x = 20", "so x = 6.67? [SOLVED]"],
  "P-M2": ["x = 10 - 4 so x = 6", "oh wait that check fails... [SOLVED]"],
  "P-M3": ["2x - 4 = x + 6 so x = 10", "hmm ok let me redo it [SOLVED]"],
  "P-M4": ["I divided by 4: x + 2 = 3.5", "x = 1.5? [SOLVED]"],
  "P-M5": ["3x + 5 = 20 = 15", "so 3x = 15, x = 5 [SOLVED]"]
};
const STUB_TUTOR = "[dry-run stub tutor reply] What could you try as a first step?";

const runs = [];
for (const p of PERSONAS) {
  for (const problem of PROBLEMS) {
    const convo = []; // {role: 'user'|'assistant'} from the TUTOR's perspective
    let status = "max-turns";
    const learnerTurns = [];

    for (let t = 0; t < MAX_LEARNER_TURNS; t++) {
      const learnerReply = dry
        ? STUB_LEARNER[p.id][Math.min(t, STUB_LEARNER[p.id].length - 1)]
        : await chat(learnerSlot, [
            { role: "system", content: learnerSystem(p, problem) },
            ...convo.map((m) => ({ role: m.role === "user" ? "assistant" : "user", content: m.content })),
            { role: "user", content: "(You are the student. Write your next message only.)" }
          ], { temperature: TEMPERATURE, maxTokens: 200 });
      learnerTurns.push(learnerReply);
      if (/\[SOLVED\]|\[GAVE UP\]/.test(learnerReply)) {
        status = learnerReply.includes("[SOLVED]") ? "solved" : "gave-up";
        convo.push({ role: "user", content: learnerReply.replace(/\[SOLVED\]|\[GAVE UP\]/g, "").trim() });
        break;
      }
      convo.push({ role: "user", content: learnerReply });
      const tutorReply = dry ? STUB_TUTOR : await chat(tutorSlot, [{ role: "system", content: tutorPrompt }, ...convo], { temperature: TEMPERATURE });
      convo.push({ role: "assistant", content: tutorReply });
    }

    const record = {
      header: dry ? DRY_RUN_HEADER : undefined,
      run_id: `${p.id}-${problem.replace(/[^a-z0-9]+/gi, "-")}`,
      persona: p,
      problem,
      tutor_version: version,
      tutor_model: tutorSlot.model,
      learner_model: learnerSlot.model,
      temperature: TEMPERATURE,
      max_learner_turns: MAX_LEARNER_TURNS,
      date: new Date().toISOString(),
      end_status: status,
      learner_turns_used: learnerTurns.length,
      label: "AI-simulated persona — not a real learner; cannot show learning gains",
      convo
    };
    runs.push({ ...record, convo: undefined });
    writeJson(path.join(outRoot, `${record.run_id}.json`), record);
    writeText(path.join(outRoot, `${record.run_id}.md`), adaptiveMd(record, dryHeader()));
    console.log(`[${dry ? "DRY RUN" : "adaptive"}] ${p.id} on "${problem}": ${status} after ${learnerTurns.length} learner turn(s)`);
  }
}

writeJson(path.join(outRoot, "adaptive-summary.json"), {
  dry_run: dry,
  header: dry ? DRY_RUN_HEADER : null,
  date: new Date().toISOString(),
  tutor_version: version,
  tutor_model: tutorSlot.model,
  learner_model: learnerSlot.model,
  label: "AI-simulated personas (spec/misconceptions.md). NOT real learners; runs cannot show learning gains — they surface interaction problems only.",
  runs
});
console.log(`${dry ? "[DRY RUN] " : ""}run-adaptive-learner complete: ${PERSONAS.length} personas x ${PROBLEMS.length} problems, tutor prompt ${version}. Output: ${dry ? "dry-run/adaptive" : "eval/results/adaptive"}`);

function adaptiveMd(record, header) {
  const lines = [];
  lines.push(header.trimEnd());
  lines.push("");
  lines.push(`# Adaptive simulated run — ${record.run_id}`);
  lines.push("");
  lines.push(`- **Label:** AI-simulated persona (fictional). Not a real learner. Cannot show learning gains.`);
  lines.push(`- Problem: \`${record.problem}\``);
  lines.push(`- Persona: ${record.persona.name} — ${record.persona.persona}`);
  lines.push(`- Misconception: ${record.persona.misconception} (see spec/misconceptions.md)`);
  lines.push(`- Tutor prompt: ${record.tutor_version} (model ${record.tutor_model}) · Learner model: ${record.learner_model}`);
  lines.push(`- Temperature: ${record.temperature} · Date: ${record.date}`);
  lines.push(`- End status: ${record.end_status} after ${record.learner_turns_used} learner turns`);
  lines.push("");
  lines.push("## Conversation");
  lines.push("");
  for (const m of record.convo) {
    lines.push(`**${m.role === "user" ? "Student (simulated)" : "Tutor"}:** ${m.content}`);
    lines.push("");
  }
  return lines.join("\n") + "\n";
}
