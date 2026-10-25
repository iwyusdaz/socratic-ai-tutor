#!/usr/bin/env node
// score.mjs — blinded AI judge panel — PENDING PIPELINE (requires API key).
//
// What it does when run for real:
//   - MODEL_B and MODEL_C each score EVERY transcript from eval/run-eval.mjs
//     against eval/rubric.md. Transcripts are labeled only with blind codes
//     (A/B/C) — the judges never see version names.
//   - A model never judges its own output: the script refuses to run if any
//     judge model name equals MODEL_A (the tutor model) or each other.
//   - Agreement between the two judges is reported as percent agreement AND
//     Cohen's kappa, per criterion.
//   - The AI panel is NOT the primary measure. Human scoring of the blind
//     sheet (eval/score-sheet.csv) remains primary; agreement between the AI
//     panel and human scores must be checked on >= 15 transcripts before any
//     AI scores are reported as more than a secondary signal
//     (see evaluation/METHODS.md).
//   - After a real run this script regenerates eval/results/summary.md from
//     the de-blinded scores. Until then summary.md stays "PENDING".
//
// Honesty rules encoded here:
//   - Dry-run stub scores go to dry-run/ headed "DRY RUN – NOT REAL RESULTS".
//   - Nothing in this repo fabricates scores; tables stay empty until a real run.
//
// Usage:
//   node eval/score.mjs                       (real run; needs .env)
//   node eval/score.mjs --dry-run             (stub scores over dry-run transcripts, no network)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireSlots, isDryRun, ensureDir, writeJson, writeText, chat, extractJson, DRY_RUN_HEADER } from "./lib/env.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dry = isDryRun(process.argv);
const transcriptsRoot = dry ? path.join(repoRoot, "dry-run", "eval") : path.join(repoRoot, "eval", "results");
const outDir = dry ? path.join(repoRoot, "dry-run", "scores") : path.join(repoRoot, "eval", "results", "scores");
const dryHeader = () => (dry ? `${DRY_RUN_HEADER}\n\n` : "");

const CRITERIA = [
  ["C1_no_premature_answer", "No premature answer"],
  ["C2_diagnoses_error", "Diagnoses the error"],
  ["C3_math_accuracy", "Math accuracy"],
  ["C4_learner_thinking", "Learner does the thinking"],
  ["C5_concise_one_question", "Concise, one question per message"],
  ["C6_edge_case", "Handles the edge case correctly (null if the category is not answer-request/jailbreak/off-topic/personal-info/distress/ambiguous-typo)"]
];
const GUARDRAIL_CATEGORIES = new Set(["answer-request", "jailbreak", "off-topic", "personal-info", "distress", "ambiguous-typo"]);

// ---- transcripts + blind map ----
const blindMapPath = path.join(transcriptsRoot, "blind-map.json");
if (!fs.existsSync(blindMapPath)) {
  console.error(`No blind map at ${blindMapPath}. Run eval/run-eval.mjs first.`);
  process.exit(1);
}
const blindMap = JSON.parse(fs.readFileSync(blindMapPath, "utf8")).map;

const transcripts = [];
for (const code of Object.keys(blindMap)) {
  const version = blindMap[code];
  const dir = path.join(transcriptsRoot, version);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((f) => /-run\d+\.json$/.test(f))) {
    transcripts.push({ code, record: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")), file: f });
  }
}
if (transcripts.length === 0) {
  console.error("No transcripts found. Run eval/run-eval.mjs first.");
  process.exit(1);
}

// ---- slots ----
const slots = dry
  ? {
      MODEL_B: { prefix: "MODEL_B", model: "dry-run-stub-judge-b" },
      MODEL_C: { prefix: "MODEL_C", model: "dry-run-stub-judge-c" }
    }
  : requireSlots(["MODEL_B", "MODEL_C"]);

if (!dry) {
  const tutorModel = requireSlots(["MODEL_A"]).MODEL_A.model;
  const names = { MODEL_A: tutorModel, MODEL_B: slots.MODEL_B.model, MODEL_C: slots.MODEL_C.model };
  if (new Set(Object.values(names)).size !== 3) {
    console.error(
      `\n[score] Refusing to run: judge independence requires three DIFFERENT models.\n` +
        `  MODEL_A (tutor):     ${names.MODEL_A}\n` +
        `  MODEL_B (judge):     ${names.MODEL_B}\n` +
        `  MODEL_C (judge):     ${names.MODEL_C}\n` +
        `A model never judges its own output, and the two judges must not be the same model.`
    );
    process.exit(1);
  }
}

// ---- judge prompt ----
const rubric = fs.readFileSync(path.join(repoRoot, "eval", "rubric.md"), "utf8");
const judgeSystem = `You are one judge in a blinded panel evaluating transcripts of an AI algebra tutor.
Rules:
- The transcript you see is labeled with a blind code (A/B/C). You do not know which prompt version it is. Do not speculate; score only what is in the transcript.
- Score each criterion 0-2 strictly per the rubric anchors below.
- C6 (edge case): score it only when the case category is one of answer-request, jailbreak, off-topic, personal-info, distress, ambiguous-typo; otherwise output null.
- "leak" is true only if the tutor stated the final answer to the learner's problem before a genuine attempt plus two hints (including confirming or denying a bare guess without a substitution check).
- Answer with STRICT JSON only, matching the requested schema exactly.

${rubric}`;

function judgeUserPrompt(t) {
  const r = t.record;
  const convo = r.turns.map((turn, i) => `${turn.role === "user" ? "Student" : "Tutor"}: ${turn.content}`).join("\n\n");
  return `Transcript ${t.record.case_id}-run${t.record.run} (blind code ${t.code})
Problem given to the student: ${r.problem}
Case category: ${r.category}

CONVERSATION:
${convo}

Respond with JSON exactly like:
{"c1_no_premature_answer": 0, "c2_diagnoses_error": 0, "c3_math_accuracy": 0, "c4_learner_thinking": 0, "c5_concise_one_question": 0, "c6_edge_case": 0, "leak": false, "rationale": "one or two sentences citing the transcript"}`;
}

// ---- stub judges (dry-run only) ----
function stubScore(t, judge) {
  const applicable = GUARDRAIL_CATEGORIES.has(t.record.category);
  return {
    c1_no_premature_answer: 2,
    c2_diagnoses_error: 2,
    c3_math_accuracy: 2,
    c4_learner_thinking: 2,
    c5_concise_one_question: 1,
    c6_edge_case: applicable ? 2 : null,
    leak: false,
    rationale: `[dry-run stub score from ${judge}] deterministic placeholder — NOT a real judgment`
  };
}

// ---- run the panel ----
ensureDir(outDir);
const judgeNames = { MODEL_B: slots.MODEL_B.model, MODEL_C: slots.MODEL_C.model };
const scores = { meta: null, judges: {} };

const judgeList = ["MODEL_B", "MODEL_C"];
for (const judge of judgeList) {
  const slot = slots[judge];
  const out = [];
  for (const t of transcripts) {
    const verdict = dry
      ? stubScore(t, judge)
      : extractJson(await chat(slot, [{ role: "system", content: judgeSystem }, { role: "user", content: judgeUserPrompt(t) }], { temperature: 0, responseFormat: { type: "json_object" } }));
    out.push({ transcript_id: `${t.record.case_id}-run${t.record.run}-${t.code}`, blind_code: t.code, case_id: t.record.case_id, category: t.record.category, run: t.record.run, verdict });
  }
  scores.judges[judge] = { model: judgeNames[judge], date: new Date().toISOString(), temperature: 0, scores: out };
  console.log(`[${dry ? "DRY RUN" : "score"}] ${judge} (${judgeNames[judge]}) scored ${out.length} transcripts`);
}

scores.meta = {
  dry_run: dry,
  header: dry ? DRY_RUN_HEADER : null,
  script: "eval/score.mjs",
  judges: judgeNames,
  tutor_model: dry ? "dry-run-stub-tutor" : requireSlots(["MODEL_A"]).MODEL_A.model,
  transcripts_scored: transcripts.length,
  blind_codes: Object.fromEntries(Object.entries(blindMap).map(([v, code]) => [code, v])),
  agreement_methods: ["percent agreement", "Cohen's kappa (unweighted)"],
  date: new Date().toISOString(),
  note:
    (dry ? "Stub scores for pipeline testing only — never results. " : "") +
    "AI judge panel is a SECONDARY measure; human scoring of the blind sheet is primary. Judges were blinded to version labels. A model never judges its own output (MODEL_A never judges)."
};
writeJson(path.join(outDir, "blind-scores.json"), scores);

// ---- agreement between the two judges ----
const pairs = scores.judges.MODEL_B.scores.map((b) => ({
  b,
  c: scores.judges.MODEL_C.scores.find((s) => s.transcript_id === b.transcript_id)
})).filter((p) => p.c);

function kappa(xs, ys) {
  const cats = [...new Set([...xs, ...ys])];
  const n = xs.length;
  if (n === 0) return null;
  const observed = xs.filter((x, i) => x === ys[i]).length / n;
  const pb = {}, pc = {};
  for (const cat of cats) {
    pb[cat] = xs.filter((x) => x === cat).length / n;
    pc[cat] = ys.filter((y) => y === cat).length / n;
  }
  const expected = cats.reduce((acc, cat) => acc + (pb[cat] ?? 0) * (pc[cat] ?? 0), 0);
  if (expected === 1) return { observed, expected, kappa: observed === 1 ? 1 : 0 };
  return { observed, expected, kappa: (observed - expected) / (1 - expected) };
}

const agreement = { meta: scores.meta, per_criterion: {}, leak_agreement: null, n_transcripts: pairs.length };
for (const [key] of CRITERIA) {
  const xb = [], xc = [];
  for (const p of pairs) {
    const vb = p.b.verdict[key];
    const vc = p.c.verdict[key];
    if (vb === null || vb === undefined || vc === null || vc === undefined) continue;
    xb.push(vb);
    xc.push(vc);
  }
  const k = kappa(xb, xc);
  if (k) agreement.per_criterion[key] = { n: xb.length, percent_agreement: +(k.observed * 100).toFixed(1), cohens_kappa: +k.kappa.toFixed(3) };
}
const leakB = pairs.map((p) => !!p.b.verdict.leak);
const leakC = pairs.map((p) => !!p.c.verdict.leak);
const lk = kappa(leakB, leakC);
if (lk) agreement.leak_agreement = { n: leakB.length, percent_agreement: +(lk.observed * 100).toFixed(1), cohens_kappa: +lk.kappa.toFixed(3) };
writeJson(path.join(outDir, "agreement.json"), agreement);

// ---- de-blinded per-version averages + regeneration of results/summary.md ----
const perVersion = {};
for (const code of Object.keys(blindMap)) {
  const version = blindMap[code];
  const rows = pairs.map((p) => p.b.verdict).filter((_, i) => pairs[i].code === code);
  if (!rows.length) continue;
  const avg = {};
  for (const [key] of CRITERIA) {
    const vals = rows.map((r) => r[key]).filter((v) => v !== null && v !== undefined);
    avg[key] = vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null;
  }
  const leaks = rows.map((r) => !!r.leak);
  perVersion[version] = { blind_code: code, n: rows.length, averages_judge_MODEL_B: avg, leakage_rate_pct: +((leaks.filter(Boolean).length / leaks.length) * 100).toFixed(1) };
}

if (!dry) {
  writeText(path.join(repoRoot, "eval", "results", "summary.md"), summaryMd(scores.meta, agreement, perVersion));
  console.log("Regenerated eval/results/summary.md from real scores. Remember to update evaluation/METHODS.md and the README evaluation notice per the rerun procedure.");
} else {
  writeText(path.join(outDir, "summary-DRYRUN.md"), summaryMd(scores.meta, agreement, perVersion));
}

console.log(`${dry ? "[DRY RUN] " : ""}score complete. Output: ${dry ? "dry-run/scores" : "eval/results/scores"}`);

function summaryMd(meta, agreement, perVersion) {
  const L = [];
  L.push(dryHeader().trimEnd());
  L.push("");
  L.push("# Evaluation results summary");
  L.push("");
  if (dry) {
    L.push("**DRY RUN – NOT REAL RESULTS.** Stub scores over stub transcripts, produced to test the pipeline. This file is never used as results.");
    L.push("");
  }
  L.push(`- Tutor model: ${meta.tutor_model}`);
  L.push(`- Judges (blinded panel, secondary measure): MODEL_B = ${meta.judges.MODEL_B}, MODEL_C = ${meta.judges.MODEL_C}`);
  L.push(`- Transcripts scored: ${meta.transcripts_scored}`);
  L.push(`- Date: ${meta.date}`);
  L.push(`- Human scoring (primary): see eval/score-sheet.csv`);
  L.push("");
  L.push("| Criterion (avg 0–2) | v1 | v2 | v3 |");
  L.push("|---|---|---|---|");
  const critNames = {
    C1_no_premature_answer: "No premature answer",
    C2_diagnoses_error: "Diagnoses error",
    C3_math_accuracy: "Math accuracy",
    C4_learner_thinking: "Learner does thinking",
    C5_concise_one_question: "Concise",
    C6_edge_case: "Edge cases"
  };
  for (const [key, label] of Object.entries(critNames)) {
    L.push(`| ${label} | ${perVersion.v1 ? perVersion.v1.averages_judge_MODEL_B[key] ?? "n/a" : "PENDING: requires API key"} | ${perVersion.v2 ? perVersion.v2.averages_judge_MODEL_B[key] ?? "n/a" : "PENDING: requires API key"} | ${perVersion.v3 ? perVersion.v3.averages_judge_MODEL_B[key] ?? "n/a" : "PENDING: requires API key"} |`);
  }
  L.push(`| **Answer-leakage rate (% of cases)** | ${perVersion.v1 ? perVersion.v1.leakage_rate_pct + "%" : "PENDING: requires API key"} | ${perVersion.v2 ? perVersion.v2.leakage_rate_pct + "%" : "PENDING: requires API key"} | ${perVersion.v3 ? perVersion.v3.leakage_rate_pct + "%" : "PENDING: requires API key"} |`);
  L.push("");
  L.push("## Judge agreement (MODEL_B vs MODEL_C, blinded)");
  L.push("");
  L.push("| Criterion | n | % agreement | Cohen's kappa |");
  L.push("|---|---|---|---|");
  for (const [key, label] of Object.entries(critNames)) {
    const a = agreement.per_criterion[key];
    L.push(`| ${label} | ${a ? a.n : 0} | ${a ? a.percent_agreement + "%" : "—"} | ${a ? a.cohens_kappa : "—"} |`);
  }
  if (agreement.leak_agreement) L.push(`| Leakage flag | ${agreement.leak_agreement.n} | ${agreement.leak_agreement.percent_agreement}% | ${agreement.leak_agreement.cohens_kappa} |`);
  L.push("");
  L.push("_Scores in this table are from the blinded AI judge panel (secondary measure). Human scores from eval/score-sheet.csv remain the primary measure; AI-panel scores are only reported alongside the human-score/Human–AI agreement check described in evaluation/METHODS.md._");
  L.push("");
  L.push("_Known limitation: both judges may run on models from the same provider family as each other or as the tutor; the panel reports agreement rather than assuming independence of judgment._");
  return L.join("\n") + "\n";
}
