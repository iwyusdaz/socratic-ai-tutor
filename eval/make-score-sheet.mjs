#!/usr/bin/env node
// make-score-sheet.mjs — generates the BLIND human-scoring sheet.
//
// Reads every transcript produced by run-eval.mjs and writes eval/score-sheet.csv
// with one row per transcript. Version labels are replaced by blind codes (A/B/C)
// from eval/results/blind-map.json (gitignored). Scorers never learn which code
// is which version. The edge-case criterion (C6) is pre-filled "n/a" for
// non-guardrail categories per eval/rubric.md.
//
// Usage:
//   node eval/make-score-sheet.mjs            (from eval/results/)
//   node eval/make-score-sheet.mjs --dry-run  (from dry-run/eval)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDryRun, DRY_RUN_HEADER } from "./lib/env.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = isDryRun(process.argv);
const root = dry ? path.join(repoRoot, "dry-run", "eval") : path.join(repoRoot, "eval", "results");
const outFile = dry ? path.join(repoRoot, "dry-run", "score-sheet.csv") : path.join(repoRoot, "eval", "score-sheet.csv");

const GUARDRAIL_CATEGORIES = new Set(["answer-request", "jailbreak", "off-topic", "personal-info", "distress", "ambiguous-typo"]);

const blindMapPath = path.join(root, "blind-map.json");
if (!fs.existsSync(blindMapPath)) {
  console.error(`No blind map at ${blindMapPath}. Run eval/run-eval.mjs first (it assigns blind codes).`);
  process.exit(1);
}
const blindMap = JSON.parse(fs.readFileSync(blindMapPath, "utf8")).map; // code -> version

// guard: never write version names into the sheet
const versionByCode = Object.fromEntries(Object.entries(blindMap).map(([code, v]) => [v, code]));

const rows = [];
const versions = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && versionByCode[d.name])
  .map((d) => d.name);

for (const version of versions) {
  const dir = path.join(root, version);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && /-run\d+\.json$/.test(f));
  for (const f of files) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const code = versionByCode[rec.version];
    if (!code) {
      console.error(`Transcript ${f} has version ${rec.version} not in the blind map — skipping (possible stale results).`);
      continue;
    }
    const c6 = GUARDRAIL_CATEGORIES.has(rec.category) ? "" : "n/a";
    rows.push({
      transcript_id: `${rec.case_id}-run${rec.run}-${code}`,
      blind_code: code,
      case_id: rec.case_id,
      category: rec.category,
      run: rec.run,
      C1_no_premature_answer: "",
      C2_diagnoses_error: "",
      C3_math_accuracy: "",
      C4_learner_thinking: "",
      C5_concise_one_question: "",
      C6_edge_case: c6,
      notes: ""
    });
  }
}

rows.sort((a, b) => a.transcript_id.localeCompare(b.transcript_id));

const header = "transcript_id,blind_code,case_id,category,run,C1_no_premature_answer,C2_diagnoses_error,C3_math_accuracy,C4_learner_thinking,C5_concise_one_question,C6_edge_case,notes";
const escape = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v);
const csv = [header, ...rows.map((r) => Object.values(r).map(escape).join(","))].join("\n") + "\n";

if (dry) fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, (dry ? `# ${DRY_RUN_HEADER}\n` : "") + csv);

console.log(`Wrote ${rows.length} rows to ${outFile}. Blind codes: ${Object.keys(versionByCode).join(", ")}. Do not commit the blind map; scorers score against these codes.`);
