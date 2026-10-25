#!/usr/bin/env node
// run-eval.mjs — tutor evaluation runs — PENDING PIPELINE (requires API key).
//
// What it does when run for real:
//   - MODEL_A plays the tutor. For each prompt version (v1, v2, v3) and each
//     scripted case in eval/test-cases.json, it sends the system prompt plus
//     the scripted student turns ONE AT A TIME and captures each tutor reply.
//   - Fixed temperature (0) for repeatability; each case is run 3 times
//     (configurable with --runs N) to expose variance.
//   - Saves results/<version>/<case-id>-run<n>.json and a readable .md
//     transcript, with model name, date and parameters in every file.
//   - Assigns blind codes (A/B/C) to versions for blind scoring; the mapping
//     is written to results/blind-map.json which is GITIGNORED — it must not
//     be committed or shown to scorers.
//
// Honesty rules encoded here:
//   - Output directories for a dry run are dry-run/ with every file headed
//     "DRY RUN – NOT REAL RESULTS"; they are never used as results.
//   - No transcripts are fabricated here or anywhere else in the repo.
//
// Usage:
//   node eval/run-eval.mjs                      (real run; needs .env)
//   node eval/run-eval.mjs --dry-run            (stub outputs to dry-run/, no network)
//   node eval/run-eval.mjs --version v1         (single version)
//   node eval/run-eval.mjs --runs 2             (default 3)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { requireSlots, isDryRun, ensureDir, writeJson, writeText, chat, flagValue, loadSystemPrompt, DRY_RUN_HEADER } from "./lib/env.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resultsDir = path.join(repoRoot, "eval", "results");
const dry = isDryRun(process.argv);
const outRoot = dry ? path.join(repoRoot, "dry-run", "eval") : resultsDir;

const dryHeader = () => (dry ? `${DRY_RUN_HEADER}\n\n` : "");
const nowIso = () => new Date().toISOString();

// ---- configuration (validated BEFORE any network-capable code path) ----
if (!dry) requireSlots(["MODEL_A"]);
const VERSIONS = ["v1", "v2", "v3"];
const versionArg = flagValue(process.argv, "--version", null);
const versions = versionArg ? [versionArg] : VERSIONS;
for (const v of versions) {
  if (!VERSIONS.includes(v)) {
    console.error(`Unknown version "${v}". Known: ${VERSIONS.join(", ")}`);
    process.exit(1);
  }
}
const runs = Math.max(1, parseInt(flagValue(process.argv, "--runs", "3"), 10));
const temperature = 0; // fixed for repeatability

const suite = JSON.parse(fs.readFileSync(path.join(repoRoot, "eval", "test-cases.json"), "utf8"));
const cases = suite.cases;

const tutorSlot = dry
  ? { prefix: "MODEL_A", model: "dry-run-stub-tutor" }
  : requireSlots(["MODEL_A"]).MODEL_A;

// ---- blind code assignment (A/B/C over the versions being run) ----
let blindMap;
if (!dry) {
  // random blind assignment, seed recorded for audit after de-blinding
  const seed = crypto.randomInt(0, 2 ** 31);
  const shuffled = [...versions];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2 ** 31;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  blindMap = Object.fromEntries(["A", "B", "C"].slice(0, shuffled.length).map((code, i) => [code, shuffled[i]]));
  writeJson(path.join(resultsDir, "blind-map.json"), { seed, generated: nowIso(), note: "GITIGNORED - do not commit, do not show scorers", map: blindMap });
  console.log("Blind codes assigned (mapping in eval/results/blind-map.json, gitignored):", Object.keys(blindMap).join(", "));
} else {
  blindMap = Object.fromEntries(["A", "B", "C"].slice(0, versions.length).map((code, i) => [code, versions[i]]));
  ensureDir(outRoot);
  writeJson(path.join(outRoot, "blind-map.json"), { generated: nowIso(), note: "DRY RUN – NOT REAL RESULTS. dry-run mapping, versions not blinded.", map: blindMap });
}

// ---- stub tutor (dry-run only): deterministic, obviously fake ----
const STUB_REPLIES = [
  "[dry-run stub tutor reply] What could you try as a first step?",
  "[dry-run stub tutor reply] One hint: what do we want x to be alone on?",
  "[dry-run stub tutor reply] What operation undoes +5?"
];
function stubTutorReply(version, caseId, run, turnIndex) {
  return STUB_REPLIES[(turnIndex + run + version.length + caseId.length) % STUB_REPLIES.length];
}

// ---- main loop ----
ensureDir(outRoot);
const manifest = {
  dry_run: dry,
  header: dry ? DRY_RUN_HEADER : null,
  script: "eval/run-eval.mjs",
  tutor_model: tutorSlot.model,
  temperature,
  runs_per_case: runs,
  versions,
  blind_codes: Object.fromEntries(Object.entries(blindMap).map(([code, v]) => [v, code])),
  suite_size: cases.length,
  date: nowIso(),
  notes: dry
    ? "Stub responses for pipeline testing only. Never used as results."
    : "Real API run. Transcripts are MODEL_A behavior on scripted student turns; scripted learners do not adapt (limitation)."
};
writeJson(path.join(outRoot, "run-manifest.json"), manifest);

let callCount = 0;
for (const version of versions) {
  const code = Object.entries(blindMap).find(([, v]) => v === version)?.[0];
  const systemPrompt = loadSystemPrompt(repoRoot, version);
  const versionDir = ensureDir(path.join(outRoot, version));
  for (const c of cases) {
    for (let run = 1; run <= runs; run++) {
      const turns = [];
      for (let t = 0; t < c.student_turns.length; t++) {
        const reply = dry
          ? stubTutorReply(version, c.id, run, t)
          : await chat(tutorSlot, [{ role: "system", content: systemPrompt }, ...turns, { role: "user", content: c.student_turns[t] }], { temperature });
        callCount++;
        turns.push({ role: "user", content: c.student_turns[t] });
        turns.push({ role: "assistant", content: reply });
      }

      const record = {
        header: dry ? DRY_RUN_HEADER : undefined,
        case_id: c.id,
        category: c.category,
        problem: c.problem,
        version,
        blind_code: code,
        run,
        model: tutorSlot.model,
        temperature,
        date: nowIso(),
        expected_behaviors: c.expected_behaviors,
        turns
      };
      writeJson(path.join(versionDir, `${c.id}-run${run}.json`), record);
      writeText(
        path.join(versionDir, `${c.id}-run${run}.md`),
        transcriptMd(record, dryHeader())
      );
    }
  }
  console.log(`[${dry ? "DRY RUN" : "eval"}] version ${version} (blind code ${code}): ${cases.length} cases x ${runs} runs done`);
}

writeJson(path.join(outRoot, "call-count.json"), { dry_run: dry, tutor_calls: callCount, date: nowIso() });
console.log(`${dry ? "[DRY RUN] " : ""}run-eval complete: ${versions.length} version(s), ${cases.length} cases, ${runs} run(s) each, ${callCount} tutor API calls (${tutorSlot.model}). Output: ${dry ? "dry-run/eval" : "eval/results"}`);

function transcriptMd(record, header) {
  const lines = [];
  lines.push(header.trimEnd());
  lines.push("");
  lines.push(`# Transcript ${record.case_id} — version ${record.version} (blind code ${record.blind_code}), run ${record.run}`);
  lines.push("");
  lines.push(`- Problem: \`${record.problem}\``);
  lines.push(`- Category: ${record.category}`);
  lines.push(`- Tutor model: ${record.model}`);
  lines.push(`- Temperature: ${record.temperature}`);
  lines.push(`- Date: ${record.date}`);
  lines.push(`- Expected behaviors: ${record.expected_behaviors.join(", ")}`);
  lines.push("");
  lines.push("| Turn | Speaker | Message |");
  lines.push("|---|---|---|");
  record.turns.forEach((t, i) => {
    lines.push(`| ${Math.floor(i / 2) + 1} | ${t.role === "user" ? "Student" : "Tutor"} | ${t.content.replace(/\|/g, "\\|").replace(/\n/g, " ")} |`);
  });
  lines.push("");
  lines.push(header ? "Stub responses — NOT model output." : "Transcript of MODEL_A behavior on a scripted learner. The scripted learner does not adapt; see the limitation note in evaluation/METHODS.md.");
  return lines.join("\n") + "\n";
}
