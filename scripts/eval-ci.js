#!/usr/bin/env node
// PR eval report (ADVISORY — does not block merges). Evals only the
// prompts/skills changed in this PR, compares the PR version against the base
// branch, and writes a PR-comment body (eval-comment.md) with per-model quality,
// pass rate, and structural/infra/rubric flags. It always exits 0 — surfacing
// information for the reviewer, not gating. (To turn it back into a hard gate,
// exit non-zero on `blocking` and re-add the required check in branch protection.)
//
//   BASE_REF=origin/main node scripts/eval-ci.js          # full run
//   node scripts/eval-ci.js --dry                         # just list changed assets

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROMPTFOO = path.resolve("node_modules/.bin/promptfoo");
const BASE_REF = process.env.BASE_REF || "origin/main";
const BASELINE = /^(no-?prompt|no-?skill|without|baseline|legacy|tool-?baseline)$/i;
const NEUTRAL = "judge-primary"; // Opus — the unbiased judge
const DRY = process.argv.includes("--dry");
const COMMENT = "eval-comment.md";
const PR_DIR = "reports/ci/pr";
const BASE_DIR = "reports/ci/base";

function git(args, fatal = true) {
  const r = spawnSync("git", args, { encoding: "utf8" });
  if (fatal && r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr || r.stdout}`);
  return r;
}

// --- 1. which assets changed? map each changed file up to its config dir ---
const changed = git(["diff", "--name-only", `${BASE_REF}...HEAD`]).stdout.split("\n").filter(Boolean);
const assets = new Set();
for (const f of changed) {
  if (!/^(prompts|skills)\//.test(f)) continue;
  let dir = path.dirname(f);
  while (dir && dir !== "." && !fs.existsSync(path.join(dir, "promptfooconfig.yaml"))) dir = path.dirname(dir);
  if (dir && dir !== "." && fs.existsSync(path.join(dir, "promptfooconfig.yaml"))) assets.add(dir);
}
const assetList = [...assets].sort();

if (DRY) {
  console.log(assetList.length ? "Changed assets:\n  " + assetList.join("\n  ") : "No changed assets.");
  process.exit(0);
}

if (!assetList.length) {
  write(`### Prompt eval\n\n_No prompt/skill changes detected — eval skipped._`);
  console.log("No changed assets; nothing to eval.");
  process.exit(0);
}

// --- 2. eval helpers ---
function runEval(dirs, outDir) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const d of dirs) {
    const cfg = path.join(d, "promptfooconfig.yaml");
    if (!fs.existsSync(cfg)) continue;
    const out = path.join(outDir, d.replace(/[/\\]/g, "__") + ".json");
    const r = spawnSync(process.execPath, [PROMPTFOO, "eval", "-c", cfg, "-o", out], { stdio: "inherit" });
    if (r.status !== 0 && r.status !== 100) console.error(`promptfoo error on ${cfg} (exit ${r.status ?? r.signal})`);
  }
}

function summarize(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    } catch {
      continue;
    }
    const asset = f.replace(/\.json$/, "").replace(/__/g, "/").replace(/^prompts\//, "");
    const pm = {};
    for (const r of data.results?.results || data.results || []) {
      if (BASELINE.test((r.prompt?.label || "").trim())) continue;
      const model = (r.provider?.id || r.provider?.label || "?").replace(/^litellm:(chat:)?/, "").replace(/^claude-/, "");
      const e = (pm[model] ??= { n: 0, pass: 0, det: 0, err: 0, q: [] });
      e.n++;
      if (r.success) e.pass++;
      // BLOCKING (deterministic) = a failed NON-rubric assertion (is-json,
      // tool-routing) — the model produced structurally wrong output. Runtime/
      // provider errors (rate-limit, timeout, 5xx) are transient infra, not a
      // prompt defect, so they're advisory; llm-rubric misses are advisory too.
      const detFail = (r.gradingResult?.componentResults || []).some(
        (c) => c.pass === false && (c.assertion?.type || "") !== "llm-rubric",
      );
      if (detFail) e.det++;
      if (r.error) e.err++;
      for (const c of r.gradingResult?.componentResults || [])
        if ((c.assertion?.type || "") === "llm-rubric" && typeof c.score === "number" && String(c.assertion?.provider || "").includes(NEUTRAL))
          e.q.push(c.score);
    }
    out[asset] = pm;
  }
  return out;
}

// --- 3. run PR, then base (per-asset checkout so a brand-new asset is tolerated) ---
runEval(assetList, PR_DIR);

const baseDirs = [];
for (const d of assetList) {
  if (git(["checkout", BASE_REF, "--", d], false).status === 0) baseDirs.push(d);
}
if (baseDirs.length) {
  runEval(baseDirs, BASE_DIR);
  git(["checkout", "HEAD", "--", ...baseDirs], false); // restore PR versions
}

// --- 4. build the comment + decide pass/fail ---
const pr = summarize(PR_DIR);
const base = summarize(BASE_DIR);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const q = (v) => (v == null ? "–" : v.toFixed(2));
const blocking = [];
const body = ["### Prompt eval — changed assets\n"];

for (const asset of Object.keys(pr).sort()) {
  body.push(`\n**${asset}**\n`);
  body.push("| model | base | PR | pass | Δ |");
  body.push("|---|---|---|---|---|");
  for (const model of Object.keys(pr[asset]).sort()) {
    const e = pr[asset][model];
    const prQ = mean(e.q);
    const baseQ = base[asset]?.[model] ? mean(base[asset][model].q) : null;
    const d = prQ != null && baseQ != null ? prQ - baseQ : null;
    if (e.det > 0) blocking.push(`\`${asset}\` · ${model} (${e.pass}/${e.n})`);
    const status = e.det > 0 ? "❌ invalid output" : e.err > 0 ? "⚠️ infra error" : e.pass < e.n ? "⚠️ rubric" : "✅";
    const arrow = d == null ? "" : d >= 0.1 ? "⬆️ " : d <= -0.1 ? "⬇️ " : "≈ ";
    const dStr = d == null ? "(new)" : arrow + (d >= 0 ? "+" : "") + d.toFixed(2);
    body.push(`| ${model} | ${q(baseQ)} | ${q(prQ)} | ${e.pass}/${e.n} ${status} | ${dStr} |`);
  }
}

body.push(
  "\n_This report is **advisory — it does not block the merge.** Quality = neutral " +
    "Opus judge (0–1); Δ vs base. ❌ invalid output (bad JSON / tool-routing) is worth " +
    "a look but can be a flaky generation — re-run to confirm. ⚠️ infra errors (transient " +
    "rate-limits), ⚠️ rubric misses, and score deltas are all advisory (the judges are noisy)._",
);

const verdict = blocking.length
  ? `> ⚠️ **${blocking.length} cell(s) produced invalid output** (bad JSON / tool-routing) — ${blocking.join("; ")}. _Advisory, not blocking; may be a flaky generation — re-run to confirm._\n`
  : `> ✅ No invalid-output issues across ${Object.keys(pr).length} changed asset(s). _(Advisory report.)_\n`;

write(verdict + "\n" + body.join("\n"));
console.log(verdict);
process.exit(0); // advisory — never blocks the merge

function write(md) {
  fs.writeFileSync(COMMENT, "<!-- prompt-eval-report -->\n" + md);
}
