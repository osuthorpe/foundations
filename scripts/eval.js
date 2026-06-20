#!/usr/bin/env node
// Run each asset's promptfoo eval independently, then print a model leaderboard,
// write a committable markdown report, and append a run to the history ledger.
//
//   nvm use && npm run eval         (needs Node ^20.20.0 || >=22.22.0 for promptfoo)
//   node scripts/eval.js --no-cache (extra args pass through to promptfoo)
//   node scripts/eval.js --report   (re-render report/leaderboard from saved runs)
//
// Why per-config: multiple `-c` configs make promptfoo *combine* them into one
// eval (union of prompts/tests/providers), which runs each asset's tests against
// the wrong prompts — and crashes on glob expansion. So we run one
// `promptfoo eval -c <config>` per asset and aggregate the JSON outputs.
//
// Exit codes: promptfoo returns 100 when any assertion fails — the baseline /
// no-skill columns are *meant* to fail — so 100 means "ran fine"; only other
// non-zero codes are real errors.
//
// Storage & visualization (see evals/README.md → "Run history & reports"):
//   • interactive   — `npm run eval:view` (promptfoo's web UI + SQLite history).
//                     Set PROMPTFOO_CONFIG_DIR=.promptfoo in .env so that store
//                     lives in the repo, not your home dir.
//   • per-run JSON  — reports/eval/runs/*.json (gitignored, wiped each run).
//   • markdown      — reports/eval/REPORT.md (committed): the latest run's
//                     heatmap + leaderboard, GitHub-renderable, stamped with SHA.
//   • history       — reports/eval/history.jsonl (committed): one summary line
//                     per run; render trends with `npm run eval:trend`.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { THRESHOLDS, evaluateGate, stdev, summarizeGate } from "./gate.js";

// Keep promptfoo's own store (SQLite history behind `eval:view`) inside the repo
// instead of ~/.promptfoo, so a clone is self-contained. .env can override this;
// we only set a default when nothing has. .promptfoo/ is gitignored.
process.env.PROMPTFOO_CONFIG_DIR ||= path.resolve(".promptfoo");

const ROOTS = ["prompts", "skills"];
const CONFIG = "promptfooconfig.yaml";
const PROMPTFOO = path.resolve("node_modules/.bin/promptfoo");
const REPORT_DIR = path.resolve("reports/eval");
const OUT_DIR = path.join(REPORT_DIR, "runs"); // per-run JSON (gitignored, wiped each run)
const REPORT_MD = path.join(REPORT_DIR, "REPORT.md"); // committed markdown snapshot
const HISTORY = path.join(REPORT_DIR, "history.jsonl"); // committed run-over-run ledger
// Labels for the "before" column (expected to fall short); everything else is
// treated as the shipped/candidate column that the leaderboard ranks on.
// The "before" columns, expected to fall short. Must match the labels the
// configs actually use (prompts/.../promptfooconfig.yaml): no-prompt, naive,
// no-skill, tool-baseline. ("legacy" is the loader export name; "naive" is its
// column label — both listed so either spelling is caught.)
const BASELINE = /^(no-?prompt|no-?skill|without|naive|baseline|legacy|tool-?baseline)$/i;
const NEUTRAL = "judge-primary"; // Opus — the unbiased judge we score the heatmap on

function findConfigs(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) findConfigs(p, out);
    else if (entry.name === CONFIG) out.push(p);
  }
  return out;
}

const rawArgs = process.argv.slice(2);
// --report re-renders the leaderboard + REPORT.md from existing runs without re-running.
const reportOnly = rawArgs.includes("--report");
// --no-gate runs + reports but never fails the process on a gate verdict.
const noGate = rawArgs.includes("--no-gate");
const passthrough = rawArgs.filter((a) => a !== "--report" && a !== "--no-gate");
// Sample each cell EVAL_SAMPLES times so the gate judges a distribution, not one
// noisy score. Skip --repeat at 1 (and if the caller passed their own).
const sampleArgs =
  THRESHOLDS.samples > 1 && !passthrough.includes("--repeat") ? ["--repeat", String(THRESHOLDS.samples)] : [];
const configs = ROOTS.filter(fs.existsSync)
  .flatMap((r) => findConfigs(r))
  .sort();

if (configs.length === 0) {
  console.error(`No ${CONFIG} found under: ${ROOTS.join(", ")}`);
  process.exit(1);
}

const errored = [];
if (reportOnly) {
  console.log("Report-only: re-rendering leaderboard + REPORT.md from existing reports/eval/runs/ ...");
} else {
  // Fresh runs dir so the leaderboard reflects only this run. Note we wipe only
  // runs/ — the committed REPORT.md / history.jsonl beside it are preserved.
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Running ${configs.length} eval configs (${THRESHOLDS.samples} sample(s)/cell)...`);
  for (const cfg of configs) {
    const id = cfg.replace(/[/\\]promptfooconfig\.yaml$/, "").replace(/[/\\]/g, "__");
    const outFile = path.join(OUT_DIR, `${id}.json`);
    console.log(`\n${"=".repeat(72)}\n=== ${cfg}\n${"=".repeat(72)}`);
    // Run promptfoo under THIS node (process.execPath), not the PATH `node` the
    // bin's shebang would pick — so a single `nvm use` covers the whole run.
    // promptfoo's response cache (in PROMPTFOO_CONFIG_DIR, i.e. the repo) is left
    // ON: unchanged baseline/foundation calls are served from disk, so reruns
    // don't re-pay for known-good/known-bad cells. --repeat adds the samples.
    const res = spawnSync(process.execPath, [PROMPTFOO, "eval", "-c", cfg, "-o", outFile, ...sampleArgs, ...passthrough], {
      stdio: "inherit",
    });
    if (res.status !== 0 && res.status !== 100) {
      errored.push(`${cfg} (exit ${res.status ?? res.signal})`);
    }
  }
}

// The report + run summary are invoked at the very end of this file, after all
// helper consts/functions are defined (avoids temporal-dead-zone errors).

function judgeName(assertionProvider) {
  const s = typeof assertionProvider === "string" ? assertionProvider : assertionProvider?.id || "";
  if (s.includes("judge-primary")) return "primary";
  if (s.includes("judge-secondary")) return "secondary";
  return s || "judge";
}

const C = { G: "\x1b[32m", Y: "\x1b[33m", R: "\x1b[31m", DIM: "\x1b[2m", RST: "\x1b[0m" };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const pad = (s, n) => String(s).padEnd(n);
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
// Strip the provider prefix (anthropic:messages:, openai:chat:, bedrock:, …)
// for compact leaderboard/heatmap labels. shortModel also drops a leading
// "claude-"/"anthropic." so families read cleanly.
const PROVIDER_PREFIX = /^(anthropic:messages:|openai:chat:|google:|vertex:|bedrock:)/;
const shortModel = (s) => String(s).replace(PROVIDER_PREFIX, "").replace(/^anthropic\./, "").replace(/^claude-/, "");
const labelModel = (s) => String(s).replace(PROVIDER_PREFIX, "");

// --- shared collector -------------------------------------------------------
// Read every saved run JSON once and return per-asset, per-model tallies for the
// SHIPPED column (baseline/legacy/no-skill columns are excluded — they're meant
// to fail). Both the heatmap, the leaderboard, the markdown report, and the
// history ledger are derived from this, so they can never drift apart.
function collect() {
  const files = fs.existsSync(OUT_DIR) ? fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json")) : [];
  const assets = [];
  const modelSet = new Set();
  for (const f of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
    } catch {
      continue;
    }
    const name = f.replace(/\.json$/, "").replace(/__/g, "/").replace(/^prompts\//, "");
    const models = {}; // foundation/shipped column(s): per-model tallies (heatmap, leaderboard)
    const baseline = {}; // baseline columns by label: pooled neutral scores (gate margin)
    for (const r of data.results?.results || data.results || []) {
      const label = (r.prompt?.label || "").trim();
      // Pull this row's neutral (primary) and secondary judge scores once.
      const scores = { primary: [], secondary: [] };
      for (const c of r.gradingResult?.componentResults || []) {
        if ((c.assertion?.type || "") !== "llm-rubric" || typeof c.score !== "number") continue;
        const j = judgeName(c.assertion?.provider);
        if (j === "primary" || j === "secondary") scores[j].push(c.score);
      }
      if (BASELINE.test(label)) {
        // Baselines exist only to set the floor the foundation must clear — track
        // their neutral scores per column so the gate can beat the strongest.
        (baseline[label] ??= { primary: [] }).primary.push(...scores.primary);
        continue;
      }
      const model = r.provider?.id || r.provider?.label || (typeof r.provider === "string" ? r.provider : "?");
      modelSet.add(model);
      const e = (models[model] ??= { n: 0, pass: 0, primary: [], secondary: [] });
      e.n++;
      if (r.success) e.pass++;
      e.primary.push(...scores.primary);
      e.secondary.push(...scores.secondary);
    }
    assets.push({ name, models, baseline });
  }
  assets.sort((a, b) => a.name.localeCompare(b.name));
  return { assets, models: [...modelSet].sort() };
}

// Pool an asset's foundation scores across models + the baseline columns into the
// shape evaluateGate() wants.
function gatePools(asset) {
  const cells = Object.values(asset.models);
  return {
    foundationPrimary: cells.flatMap((e) => e.primary),
    foundationPass: cells.reduce((s, e) => s + e.pass, 0),
    foundationN: cells.reduce((s, e) => s + e.n, 0),
    baselinePrimaryByLabel: Object.fromEntries(Object.entries(asset.baseline).map(([l, v]) => [l, v.primary])),
  };
}

// Per-asset gate verdicts (sorted by asset name, matching the heatmap order).
function gateAll({ assets }) {
  return assets.map((a) => ({ name: a.name, ...evaluateGate(gatePools(a)) }));
}

// One colored cell: neutral-judge quality (0–1), or pass fraction if no rubric.
function cell(e, w) {
  if (!e || e.n === 0) return pad("·", w);
  let txt, color;
  if (e.primary.length) {
    const m = mean(e.primary);
    txt = m.toFixed(2);
    color = m >= 0.8 ? C.G : m >= 0.5 ? C.Y : C.R;
  } else {
    txt = `${e.pass}/${e.n}`;
    color = e.pass === e.n ? C.G : C.R;
  }
  if (e.pass < e.n) txt += "✗"; // a test case failed a check (e.g. invalid JSON)
  return color + txt + C.RST + " ".repeat(Math.max(1, w - txt.length));
}

// Plain-text version of `cell` for markdown (neutral-judge quality or pass rate).
function cellText(e) {
  if (!e || e.n === 0) return "·";
  let txt;
  if (e.primary.length) txt = mean(e.primary).toFixed(2);
  else txt = `${e.pass}/${e.n}`;
  if (e.pass < e.n) txt += "✗";
  return txt;
}

// Per-prompt × per-model grid for the latest run (foundation column, neutral judge).
function heatmap({ assets, models: modelIds }) {
  const models = modelIds.map(shortModel);
  const NAMEW = 32;
  const COLW = 14;
  const line = "═".repeat(NAMEW + COLW * Math.max(1, models.length));
  console.log(`\n${line}\nPROMPT × MODEL HEATMAP — latest run · foundation prompt · quality 0–1 (neutral Opus judge)\n${line}`);
  if (!assets.length) {
    console.log("(no results in reports/eval/runs/ — run `make eval` first)");
    return;
  }
  console.log(pad("prompt", NAMEW) + models.map((m) => pad(m, COLW)).join(""));
  for (const row of assets) {
    const byShort = Object.fromEntries(Object.entries(row.models).map(([k, v]) => [shortModel(k), v]));
    console.log(pad(trunc(row.name, NAMEW - 1), NAMEW) + models.map((m) => cell(byShort[m], COLW)).join(""));
  }
  console.log(
    `\nlegend: ${C.G}0.80+${C.RST}  ${C.Y}0.50–0.79${C.RST}  ${C.R}<0.50${C.RST}  ` +
      `· "✗" = a test case failed a check (e.g. invalid JSON) · "n/n" = pass rate (asset has no rubric) · "·" = no data`,
  );
}

// Aggregate the shipped-column scores per runner model across all assets.
function aggregateModels({ assets }) {
  const models = {}; // model -> { cells, pass, primary[], secondary[] }
  for (const a of assets) {
    for (const [model, e] of Object.entries(a.models)) {
      const m = (models[model] ??= { cells: 0, pass: 0, primary: [], secondary: [] });
      m.cells += e.n;
      m.pass += e.pass;
      m.primary.push(...e.primary);
      m.secondary.push(...e.secondary);
    }
  }
  return Object.entries(models)
    .map(([model, m]) => ({
      model,
      cells: m.cells,
      passPct: m.cells ? (100 * m.pass) / m.cells : 0,
      primary: mean(m.primary),
      primaryStdev: stdev(m.primary),
      secondary: mean(m.secondary),
    }))
    .sort((a, b) => b.passPct - a.passPct || (b.primary ?? 0) - (a.primary ?? 0));
}

function leaderboard(data) {
  const rows = aggregateModels(data);
  console.log(`\n${"=".repeat(72)}\nMODEL LEADERBOARD — foundation prompt only, across all assets\n(bare/legacy columns are designed to fail and are NOT counted here)\n${"=".repeat(72)}`);
  if (!rows.length) {
    console.log("(no scored results found in reports/eval/runs/)");
    return;
  }
  const fmt = (v) => (v == null ? "  -  " : v.toFixed(2));
  const fmtSd = (m, sd) => (m == null ? "  -  " : `${m.toFixed(2)}±${(sd ?? 0).toFixed(2)}`);
  console.log(`${pad("model", 22)}${pad("cells", 7)}${pad("pass%", 8)}${pad("primary (mean±sd)", 18)}${pad("secondary (mean)", 16)}`);
  for (const r of rows) {
    console.log(`${pad(labelModel(r.model), 22)}${pad(r.cells, 7)}${pad(r.passPct.toFixed(0) + "%", 8)}${pad(fmtSd(r.primary, r.primaryStdev), 18)}${pad(fmt(r.secondary), 16)}`);
  }
  console.log(
    "\nNotes:\n" +
      "  • pass% / cells count the FOUNDATION column only — the bare and legacy\n" +
      "    columns (which are supposed to fail) are excluded. promptfoo's own\n" +
      "    per-run 'X passed (Y%)' line counts every column, so ignore it here.\n" +
      "  • primary is mean±sd over all samples (EVAL_SAMPLES); a big ±sd means a\n" +
      "    noisy cell — raise EVAL_SAMPLES before trusting the mean.\n" +
      "  • judge means are per judge — the two use different scales, so compare\n" +
      "    models *within* a judge column, not across. Higher is better.\n" +
      "  • Full per-cell scores + reasons: npm run eval:view.",
  );
}

// The ship/no-ship gate (see scripts/gate.js): does each asset clear the quality
// floor AND beat its strongest baseline by the required margin?
const GATE_GLYPH = { PASS: `${C.G}PASS${C.RST}`, WARN: `${C.Y}WARN${C.RST}`, FAIL: `${C.R}FAIL${C.RST}`, NODATA: `${C.DIM}—${C.RST}` };

function gateSection(verdicts) {
  const t = THRESHOLDS;
  console.log(`\n${"=".repeat(72)}\nEVAL GATE — foundation must clear quality ≥ ${t.minQuality} and beat the\nstrongest baseline by ≥ ${t.minMargin} (neutral Opus judge, ${t.samples} sample(s)/cell)\n${"=".repeat(72)}`);
  if (!verdicts.length) {
    console.log("(no assets evaluated)");
    return;
  }
  console.log(`${pad("asset", 32)}${pad("verdict", 8)}${pad("quality", 14)}${pad("vs baseline", 16)}detail`);
  for (const v of verdicts) {
    let quality = "·";
    let vsBase = "·";
    if (v.kind === "rubric") {
      quality = `${v.fMean.toFixed(2)}±${v.fStd.toFixed(2)}`;
      vsBase = v.margin == null ? "(no baseline)" : `${(v.margin >= 0 ? "+" : "") + v.margin.toFixed(2)} vs ${v.baseLabel}`;
    } else if (v.kind === "structural") {
      quality = `${v.pass}/${v.n} pass`;
    }
    const detail = v.reasons.join("; ");
    console.log(`${pad(trunc(v.name, 31), 32)}${GATE_GLYPH[v.verdict]}${" ".repeat(4)}${pad(quality, 14)}${pad(vsBase, 16)}${C.DIM}${detail}${C.RST}`);
  }
  const { counts } = summarizeGate(verdicts);
  console.log(`\n${counts.PASS} pass · ${counts.WARN} warn · ${counts.FAIL} fail · ${counts.NODATA} no-data`);
  console.log("Tune with EVAL_MIN_QUALITY / EVAL_MIN_MARGIN / EVAL_MAX_STDEV / EVAL_SAMPLES in .env.");
}

// Short git SHA of HEAD, or "unknown" outside a checkout.
function gitSha() {
  const r = spawnSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : "unknown";
}

// --- committable markdown snapshot of the latest run ------------------------
function writeReport(data, verdicts) {
  const { assets, models: modelIds } = data;
  const models = modelIds.map(shortModel);
  const when = new Date().toISOString();
  const sha = gitSha();
  const t = THRESHOLDS;
  const out = [];
  out.push("<!-- generated by scripts/eval.js — do not edit by hand; re-run `npm run eval` -->");
  out.push("# Eval report\n");
  out.push(`_Latest run · commit \`${sha}\` · ${when} · ${t.samples} sample(s)/cell_\n`);

  if (!assets.length) {
    out.push("_No results in `reports/eval/runs/` — run `npm run eval` first._\n");
    fs.writeFileSync(REPORT_MD, out.join("\n"));
    return;
  }

  // Gate first — the ship/no-ship decision is the headline.
  const { counts } = summarizeGate(verdicts);
  out.push("## Gate\n");
  out.push(`Foundation must clear quality ≥ **${t.minQuality}** and beat its strongest baseline by ≥ **${t.minMargin}** (neutral Opus judge). ${counts.PASS} pass · ${counts.WARN} warn · ${counts.FAIL} fail · ${counts.NODATA} no-data.\n`);
  out.push("| asset | verdict | quality (mean±sd) | vs baseline | notes |");
  out.push("|---|---|---|---|---|");
  for (const v of verdicts) {
    let quality = "·";
    let vsBase = "·";
    if (v.kind === "rubric") {
      quality = `${v.fMean.toFixed(2)}±${v.fStd.toFixed(2)}`;
      vsBase = v.margin == null ? "(no baseline)" : `${(v.margin >= 0 ? "+" : "") + v.margin.toFixed(2)} vs ${v.baseLabel}`;
    } else if (v.kind === "structural") {
      quality = `${v.pass}/${v.n} pass`;
    }
    out.push(`| ${v.name} | ${v.verdict} | ${quality} | ${vsBase} | ${v.reasons.join("; ") || "—"} |`);
  }
  out.push("");

  // Heatmap: prompt × model, neutral (Opus) judge quality on the foundation column.
  out.push("## Prompt × model heatmap\n");
  out.push("Foundation prompt only, neutral Opus judge. Quality is 0–1; `n/n` is a pass rate (asset has no rubric); `✗` marks a failed check (e.g. invalid JSON); `·` is no data.\n");
  out.push(`| prompt | ${models.join(" | ")} |`);
  out.push(`|---|${models.map(() => "---").join("|")}|`);
  for (const row of assets) {
    const byShort = Object.fromEntries(Object.entries(row.models).map(([k, v]) => [shortModel(k), v]));
    out.push(`| ${row.name} | ${models.map((m) => cellText(byShort[m])).join(" | ")} |`);
  }
  out.push("");

  // Leaderboard: per-model aggregate across all assets (foundation column only).
  out.push("## Model leaderboard\n");
  out.push("Foundation prompt only, aggregated across all assets. The bare/legacy columns are designed to fail and are excluded. `primary` is mean±sd over all samples — a large ±sd means a noisy cell. Judge means use different scales — compare models *within* a column, not across.\n");
  out.push("| model | cells | pass% | primary (mean±sd) | secondary (mean) |");
  out.push("|---|---|---|---|---|");
  const fmt = (v) => (v == null ? "–" : v.toFixed(2));
  for (const r of aggregateModels(data)) {
    out.push(`| ${labelModel(r.model)} | ${r.cells} | ${r.passPct.toFixed(0)}% | ${fmt(r.primary)}±${(r.primaryStdev ?? 0).toFixed(2)} | ${fmt(r.secondary)} |`);
  }
  out.push("\n_Full per-cell scores, diffs, and judge reasoning: `npm run eval:view`. Score trends over time: `npm run eval:trend`._");

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_MD, out.join("\n") + "\n");
  console.log(`\nWrote ${path.relative(process.cwd(), REPORT_MD)} (committable snapshot).`);
}

// --- append this run to the history ledger ----------------------------------
function appendHistory(data, verdicts) {
  const models = {};
  for (const r of aggregateModels(data)) {
    models[shortModel(r.model)] = {
      cells: r.cells,
      passPct: Math.round(r.passPct),
      primary: r.primary == null ? null : Number(r.primary.toFixed(3)),
      primaryStdev: Number((r.primaryStdev ?? 0).toFixed(3)),
      secondary: r.secondary == null ? null : Number(r.secondary.toFixed(3)),
    };
  }
  if (!Object.keys(models).length) return; // nothing scored — don't pad the ledger
  const { counts } = summarizeGate(verdicts);
  const entry = { ts: new Date().toISOString(), commit: gitSha(), samples: THRESHOLDS.samples, gate: counts, models };
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.appendFileSync(HISTORY, JSON.stringify(entry) + "\n");
  console.log(`Appended run to ${path.relative(process.cwd(), HISTORY)} (history ledger).`);
}

// ---- run the report (all helpers above are now defined) ----
const data = collect();
const verdicts = gateAll(data);
heatmap(data);
leaderboard(data);
gateSection(verdicts);
writeReport(data, verdicts);
if (!reportOnly) appendHistory(data, verdicts); // ledger only grows on real runs, not re-renders

const { failed } = summarizeGate(verdicts);

if (!reportOnly) {
  console.log(`\n${"=".repeat(72)}`);
  console.log(`Ran ${configs.length} configs. Full per-cell results: npm run eval:view`);
  if (errored.length) {
    console.error(`\n${errored.length} config(s) hit a runtime error:`);
    for (const e of errored) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log("No runtime errors.");
}

// The gate is the ship decision: a FAIL exits non-zero so `make eval` / CI can
// block on it. --no-gate keeps the report but never fails (exploration). A
// re-render (--report) reflects the saved verdict in its exit code too.
if (failed && !noGate) {
  console.error(`\nGATE FAILED — see the EVAL GATE table above. (override locally with --no-gate)`);
  process.exit(1);
}
