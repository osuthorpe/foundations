#!/usr/bin/env node
// Run each asset's promptfoo eval independently, then print a model leaderboard.
//
//   nvm use && npm run eval         (needs Node ^20.20.0 || >=22.22.0 for promptfoo)
//   node scripts/eval.js --no-cache (extra args pass through to promptfoo)
//
// Why per-config: multiple `-c` configs make promptfoo *combine* them into one
// eval (union of prompts/tests/providers), which runs each asset's tests against
// the wrong prompts — and crashes on glob expansion. So we run one
// `promptfoo eval -c <config>` per asset and aggregate the JSON outputs.
//
// Exit codes: promptfoo returns 100 when any assertion fails — the baseline /
// no-skill columns are *meant* to fail — so 100 means "ran fine"; only other
// non-zero codes are real errors.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["prompts", "skills"];
const CONFIG = "promptfooconfig.yaml";
const PROMPTFOO = path.resolve("node_modules/.bin/promptfoo");
const OUT_DIR = path.resolve("reports/eval");
// Labels for the "before" column (expected to fall short); everything else is
// treated as the shipped/candidate column that the leaderboard ranks on.
const BASELINE = /^(no-?prompt|no-?skill|without|baseline|legacy|tool-?baseline)$/i;
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
// --report re-prints the leaderboard from existing reports/eval/ without re-running.
const reportOnly = rawArgs.includes("--report");
const passthrough = rawArgs.filter((a) => a !== "--report");
const configs = ROOTS.filter(fs.existsSync)
  .flatMap((r) => findConfigs(r))
  .sort();

if (configs.length === 0) {
  console.error(`No ${CONFIG} found under: ${ROOTS.join(", ")}`);
  process.exit(1);
}

const errored = [];
if (reportOnly) {
  console.log("Report-only: building leaderboard from existing reports/eval/ ...");
} else {
  // Fresh results dir so the leaderboard reflects only this run.
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Running ${configs.length} eval configs...`);
  for (const cfg of configs) {
    const id = cfg.replace(/[/\\]promptfooconfig\.yaml$/, "").replace(/[/\\]/g, "__");
    const outFile = path.join(OUT_DIR, `${id}.json`);
    console.log(`\n${"=".repeat(72)}\n=== ${cfg}\n${"=".repeat(72)}`);
    // Run promptfoo under THIS node (process.execPath), not the PATH `node` the
    // bin's shebang would pick — so a single `nvm use` covers the whole run.
    const res = spawnSync(process.execPath, [PROMPTFOO, "eval", "-c", cfg, "-o", outFile, ...passthrough], {
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

// One colored cell: neutral-judge quality (0–1), or pass fraction if no rubric.
function cell(e, w) {
  if (!e || e.n === 0) return pad("·", w);
  let txt, color;
  if (e.q.length) {
    const m = mean(e.q);
    txt = m.toFixed(2);
    color = m >= 0.8 ? C.G : m >= 0.5 ? C.Y : C.R;
  } else {
    txt = `${e.pass}/${e.n}`;
    color = e.pass === e.n ? C.G : C.R;
  }
  if (e.pass < e.n) txt += "✗"; // a test case failed a check (e.g. invalid JSON)
  return color + txt + C.RST + " ".repeat(Math.max(1, w - txt.length));
}

// Per-prompt × per-model grid for the latest run (foundation column, neutral judge).
function heatmap() {
  const files = fs.existsSync(OUT_DIR) ? fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json")) : [];
  const rows = [];
  const modelSet = new Set();
  for (const f of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
    } catch {
      continue;
    }
    const name = f.replace(/\.json$/, "").replace(/__/g, "/").replace(/^prompts\//, "");
    const pm = {};
    for (const r of data.results?.results || data.results || []) {
      if (BASELINE.test((r.prompt?.label || "").trim())) continue;
      const model = (r.provider?.id || r.provider?.label || "?").replace(/^litellm:(chat:)?/, "").replace(/^claude-/, "");
      modelSet.add(model);
      const e = (pm[model] ??= { n: 0, pass: 0, q: [] });
      e.n++;
      if (r.success) e.pass++;
      for (const c of r.gradingResult?.componentResults || []) {
        if ((c.assertion?.type || "") === "llm-rubric" && typeof c.score === "number" && String(c.assertion?.provider || "").includes(NEUTRAL))
          e.q.push(c.score);
      }
    }
    rows.push({ name, pm });
  }
  const NAMEW = 32;
  const COLW = 14;
  const line = "═".repeat(NAMEW + COLW * Math.max(1, modelSet.size));
  console.log(`\n${line}\nPROMPT × MODEL HEATMAP — latest run · foundation prompt · quality 0–1 (neutral Opus judge)\n${line}`);
  if (!rows.length) {
    console.log("(no results in reports/eval/ — run `make eval` first)");
    return;
  }
  const models = [...modelSet].sort();
  rows.sort((a, b) => a.name.localeCompare(b.name));
  console.log(pad("prompt", NAMEW) + models.map((m) => pad(m, COLW)).join(""));
  for (const row of rows) {
    console.log(pad(trunc(row.name, NAMEW - 1), NAMEW) + models.map((m) => cell(row.pm[m], COLW)).join(""));
  }
  console.log(
    `\nlegend: ${C.G}0.80+${C.RST}  ${C.Y}0.50–0.79${C.RST}  ${C.R}<0.50${C.RST}  ` +
      `· "✗" = a test case failed a check (e.g. invalid JSON) · "n/n" = pass rate (asset has no rubric) · "·" = no data`,
  );
}

// Aggregate the shipped-column scores per runner model across all assets.
function leaderboard() {
  const files = fs.existsSync(OUT_DIR) ? fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".json")) : [];
  const models = {}; // model -> { cells, pass, judges: { name: {sum,n} } }
  let any = false;

  for (const f of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(OUT_DIR, f), "utf8"));
    } catch {
      continue;
    }
    const rows = data.results?.results || data.results || [];
    for (const r of rows) {
      const col = (r.prompt?.label || "").trim();
      if (BASELINE.test(col)) continue; // rank on the shipped column only
      const model = r.provider?.label || r.provider?.id || (typeof r.provider === "string" ? r.provider : "?");
      const m = (models[model] ??= { cells: 0, pass: 0, judges: {} });
      m.cells++;
      if (r.success) m.pass++;
      any = true;
      for (const c of r.gradingResult?.componentResults || []) {
        if ((c.assertion?.type || "") !== "llm-rubric" || typeof c.score !== "number") continue;
        const j = (m.judges[judgeName(c.assertion?.provider)] ??= { sum: 0, n: 0 });
        j.sum += c.score;
        j.n++;
      }
    }
  }

  console.log(`\n${"=".repeat(72)}\nMODEL LEADERBOARD — foundation prompt only, across all assets\n(bare/legacy columns are designed to fail and are NOT counted here)\n${"=".repeat(72)}`);
  if (!any) {
    console.log("(no scored results found in reports/eval/)");
    return;
  }
  const judgeKeys = [...new Set(Object.values(models).flatMap((m) => Object.keys(m.judges)))].sort();
  const mean = (j) => (j && j.n ? j.sum / j.n : null);
  const rows = Object.entries(models)
    .map(([model, m]) => ({
      model: model.replace(/^litellm:(chat:)?/, ""),
      cells: m.cells,
      passPct: m.cells ? (100 * m.pass) / m.cells : 0,
      judges: Object.fromEntries(judgeKeys.map((k) => [k, mean(m.judges[k])])),
    }))
    .sort((a, b) => b.passPct - a.passPct || (b.judges.primary ?? 0) - (a.judges.primary ?? 0));

  const pad = (s, n) => String(s).padEnd(n);
  const fmt = (v) => (v == null ? "  -  " : v.toFixed(2));
  console.log(`${pad("model", 22)}${pad("cells", 7)}${pad("pass%", 8)}${judgeKeys.map((k) => pad(`${k} (mean)`, 16)).join("")}`);
  for (const r of rows) {
    console.log(`${pad(r.model, 22)}${pad(r.cells, 7)}${pad(r.passPct.toFixed(0) + "%", 8)}${judgeKeys.map((k) => pad(fmt(r.judges[k]), 16)).join("")}`);
  }
  console.log(
    "\nNotes:\n" +
      "  • pass% / cells count the FOUNDATION column only — the bare and legacy\n" +
      "    columns (which are supposed to fail) are excluded. promptfoo's own\n" +
      "    per-run 'X passed (Y%)' line counts every column, so ignore it here.\n" +
      "  • judge means are per judge — the two use different scales, so compare\n" +
      "    models *within* a judge column, not across. Higher is better.\n" +
      "  • Full per-cell scores + reasons: npm run eval:view.",
  );
}

// ---- run the report (all helpers above are now defined) ----
heatmap();
leaderboard();

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
