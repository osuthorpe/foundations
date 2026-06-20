#!/usr/bin/env node
// Re-run ONE asset and explain, per model, whether the prompt improved.
//
//   make eval-one CONFIG=prompts/writing/summarize
//   node scripts/eval-one.js prompts/writing/summarize [--no-cache]
//
// It answers two questions in plain language:
//   1. "Did my edit help?"  — this run vs the previous run of this asset.
//   2. "Is the prompt worth it?" — the foundation column vs the no-prompt column.
//
// Quality is scored 0-1 by the NEUTRAL judge (Opus) only — the gpt-5.5 judge is
// biased toward gpt outputs, so it's excluded from the headline number. Pass
// rate is shown too, because it catches structural failures (e.g. invalid JSON)
// that a quality score alone can miss.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROMPTFOO = path.resolve("node_modules/.bin/promptfoo");
const OUT_DIR = path.resolve("reports/eval");
// Match the baseline column labels the configs use (no-prompt, naive, no-skill,
// tool-baseline) — "naive" is the label, "legacy" the loader export.
const BASELINE = /^(no-?prompt|no-?skill|without|naive|baseline|legacy|tool-?baseline)$/i;
const NEUTRAL = "judge-primary"; // Opus — not a candidate runner model, so unbiased
const NOISE = 0.1; // quality changes smaller than this are treated as grading noise

const args = process.argv.slice(2);
const spec = args.find((a) => !a.startsWith("-"));
const passthrough = args.filter((a) => a.startsWith("-"));
if (!spec) {
  console.error("Usage: make eval-one CONFIG=prompts/<area>/<name>");
  process.exit(1);
}


function resolveConfig(s) {
  const clean = s.replace(/[/\\]$/, "");
  const tries = [
    clean,
    clean.endsWith("promptfooconfig.yaml") ? clean : path.join(clean, "promptfooconfig.yaml"),
    path.join("prompts", clean, "promptfooconfig.yaml"),
    path.join("skills", clean, "promptfooconfig.yaml"),
  ];
  return tries.find((t) => fs.existsSync(t));
}
const cfg = resolveConfig(spec);
if (!cfg) {
  console.error(`No promptfooconfig.yaml found for "${spec}".`);
  console.error(`Try a path like: prompts/writing/summarize`);
  process.exit(1);
}

const id = cfg.replace(/[/\\]promptfooconfig\.yaml$/, "").replace(/[/\\]/g, "__");
const outFile = path.join(OUT_DIR, `${id}.json`);
const label = cfg.replace(/[/\\]promptfooconfig\.yaml$/, "").replace(/^prompts[/\\]/, "");

// "Before" = the previous run of this asset, captured before we overwrite it.
let before = null;
if (fs.existsSync(outFile)) {
  try {
    before = summarize(JSON.parse(fs.readFileSync(outFile, "utf8")));
  } catch {}
}

fs.mkdirSync(OUT_DIR, { recursive: true });
console.log(`\nRunning ${label} ...`);
const res = spawnSync(process.execPath, [PROMPTFOO, "eval", "-c", cfg, "-o", outFile, ...passthrough], {
  stdio: "inherit",
});
if (res.status !== 0 && res.status !== 100) {
  console.error(`\npromptfoo errored (exit ${res.status ?? res.signal}).`);
  process.exit(1);
}

let after;
try {
  after = summarize(JSON.parse(fs.readFileSync(outFile, "utf8")));
} catch (e) {
  console.error("Could not read results:", e.message);
  process.exit(1);
}

report(label, before, after);

// ---------- helpers (function declarations so they're hoisted above the calls above) ----------
function mean(a) {
  return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
}
function pad(s, n) {
  return String(s).padEnd(n);
}
function q(v) {
  return v == null ? " n/a" : v.toFixed(2);
}
function signed(d) {
  return d == null ? "" : (d >= 0 ? "+" : "") + d.toFixed(2);
}

function summarize(data) {
  const rows = data.results?.results || data.results || [];
  const acc = {}; // model -> { shipped:{n,pass,q[]}, baseline:{n,pass,q[]} }
  for (const r of rows) {
    const model = (r.provider?.id || r.provider?.label || "?").replace(/^(anthropic:messages:|openai:chat:|google:|vertex:|bedrock:)/, "");
    const kind = BASELINE.test((r.prompt?.label || "").trim()) ? "baseline" : "shipped";
    const e = (acc[model] ??= { shipped: { n: 0, pass: 0, q: [] }, baseline: { n: 0, pass: 0, q: [] } })[kind];
    e.n++;
    if (r.success) e.pass++;
    for (const c of r.gradingResult?.componentResults || []) {
      if (
        (c.assertion?.type || "") === "llm-rubric" &&
        typeof c.score === "number" &&
        String(c.assertion?.provider || "").includes(NEUTRAL)
      ) {
        e.q.push(c.score);
      }
    }
  }
  const out = {};
  for (const [model, e] of Object.entries(acc)) {
    out[model] = {
      n: e.shipped.n,
      pass: e.shipped.pass,
      quality: mean(e.shipped.q),
      baselineQuality: mean(e.baseline.q),
      hasRubric: e.shipped.q.length > 0,
    };
  }
  return out;
}

function verdict(b, a) {
  if (!b) return "";
  if (a.pass > b.pass) return "✅ improved";
  if (a.pass < b.pass) return "⚠️  regressed";
  if (a.quality != null && b.quality != null) {
    const d = a.quality - b.quality;
    if (d >= NOISE) return "✅ improved";
    if (d <= -NOISE) return "⚠️  regressed";
  }
  return "➖ no real change";
}

function report(label, before, after) {
  const models = Object.keys(after);
  const anyRubric = models.some((m) => after[m].hasRubric);
  const n = after[models[0]]?.n ?? 0;
  const line = "═".repeat(74);

  console.log(`\n${line}\n  ${label}   ·   ${n} test case${n === 1 ? "" : "s"}   ·   ${models.length} models\n${line}`);

  console.log(`\nDID YOUR EDIT HELP?   (this run vs the previous run)`);
  if (!before) {
    console.log(`  First run for this asset — nothing to compare yet.`);
    console.log(`  Edit the prompt, run this again, and you'll see the change here.`);
  } else {
    for (const m of models) {
      const b = before[m], a = after[m];
      const parts = [`pass ${b ? b.pass + "/" + b.n : "?"}→${a.pass}/${a.n}`];
      if (a.hasRubric) parts.push(`quality ${q(b?.quality)}→${q(a.quality)} (${signed(a.quality != null && b?.quality != null ? a.quality - b.quality : null)})`);
      console.log(`  ${pad(m, 20)} ${pad(parts.join("   "), 42)} ${verdict(b, a)}`);
    }
  }

  if (anyRubric) {
    console.log(`\nIS THE PROMPT WORTH IT?   (foundation vs "no prompt", this run)`);
    for (const m of models) {
      const a = after[m];
      const lift = a.quality != null && a.baselineQuality != null ? a.quality - a.baselineQuality : null;
      const tag = lift == null ? "" : lift >= NOISE ? "✅ yes" : lift <= -NOISE ? "⚠️  worse than no prompt" : "➖ about the same";
      console.log(`  ${pad(m, 20)} quality ${q(a.baselineQuality)}→${q(a.quality)} (${signed(lift)} lift)   ${tag}`);
    }
  }

  console.log(`\nHow to read this:`);
  console.log(`  • quality = 0–1 from the neutral Opus judge (higher is better). The gpt-5.5`);
  console.log(`    judge is biased toward gpt outputs, so it's left out of these numbers.`);
  console.log(`  • a change under ±${NOISE.toFixed(2)} is usually grading noise, not a real difference.`);
  console.log(`  • pass = how many test cases met every check (incl. valid JSON).`);
  console.log(`  See the actual outputs + both judges' reasoning:  make eval-view`);
  console.log(line + "\n");
}
