#!/usr/bin/env node
// export-blind-transcripts.mjs — packages BLIND transcript copies for scorers.
//
// Why this exists (agent review 2026-10-26, finding F3): the committed
// transcripts live in eval/results/v1|v2|v3/ and their headers name the
// version ("Transcript T01 — version v1 (blind code A)"), so anyone holding
// the raw transcripts knows which prompt version produced them — which would
// defeat the blind second-scorer protocol. This command re-packages the
// readable .md transcripts under their blind codes with the version stripped
// from the header, into eval/results/blind-transcripts/ (gitignored).
// Give scorers the files from that folder plus eval/score-sheet.csv — never
// the raw v1/v2/v3 directories, and never the blind map or the score outputs
// (all gitignored; see evaluation/METHODS.md §7).
//
// Usage:
//   node eval/export-blind-transcripts.mjs            (from eval/results/)
//   node eval/export-blind-transcripts.mjs --dry-run  (from dry-run/eval)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDryRun, DRY_RUN_HEADER } from "./lib/env.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = isDryRun(process.argv);
const root = dry ? path.join(repoRoot, "dry-run", "eval") : path.join(repoRoot, "eval", "results");
const outDir = dry ? path.join(repoRoot, "dry-run", "blind-transcripts") : path.join(repoRoot, "eval", "results", "blind-transcripts");

const blindMapPath = path.join(root, "blind-map.json");
if (!fs.existsSync(blindMapPath)) {
  console.error(`No blind map at ${blindMapPath}. Run eval/run-eval.mjs first (it assigns blind codes).`);
  process.exit(1);
}
const blindMap = JSON.parse(fs.readFileSync(blindMapPath, "utf8")).map; // code -> version
const versionByCode = Object.fromEntries(Object.entries(blindMap).map(([code, v]) => [v, code]));

fs.mkdirSync(outDir, { recursive: true });
let written = 0;
for (const [version, code] of Object.entries(versionByCode)) {
  const dir = path.join(root, version);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md") && /-run\d+\.md$/.test(f))) {
    const rec = JSON.parse(fs.readFileSync(path.join(dir, f.replace(/\.md$/, ".json")), "utf8"));
    let text = fs.readFileSync(path.join(dir, f), "utf8");
    // strip the version from the header: "# Transcript T01 — version v1 (blind code A), run 1"
    text = text.replace(
      /^(# Transcript \S+) — version \S+ \(blind code ([A-Z])\), run (\d+)$/m,
      `$1 — blind code $2, run $3`
    );
    // guard: the exported copy must not name any prompt version anywhere
    if (new RegExp(`\\b${version}\\b`).test(text)) {
      console.error(`Refusing to write ${f}: a version name still appears in the blinded copy.`);
      process.exit(1);
    }
    const outName = f.replace(/-run(\d+)\.md$/, `-run$1-${code}.md`);
    fs.writeFileSync(path.join(outDir, outName), text);
    written++;
  }
}
console.log(
  `Wrote ${written} blinded transcript(s) to ${outDir}. Give scorers these files + eval/score-sheet.csv only. ` +
    `Never give scorers the raw v1/v2/v3 directories, eval/results/blind-map.json, or the score outputs (all gitignored).`
);
