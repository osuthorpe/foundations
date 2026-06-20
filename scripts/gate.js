// Shared eval gate: turns noisy single scores into a defensible ship/no-ship
// decision, used by scripts/eval.js.
//
// The repo's promise is "a prompt/skill ships only when it clearly beats the
// baseline." A single LLM-judge score can't carry that — the judges are noisy.
// So we (1) SAMPLE each cell N times (promptfoo --repeat, see EVAL_SAMPLES) and
// (2) gate on the POOLED distribution, not one number:
//
//   • quality  — the foundation column's neutral-judge mean must clear an
//                 absolute floor (EVAL_MIN_QUALITY).
//   • margin   — it must beat the STRONGEST baseline column (no-prompt / naive)
//                 by at least EVAL_MIN_MARGIN. Beating the strongest, not the
//                 average, is the conservative test.
//   • noise    — if the foundation scores are too spread out (stdev over
//                 EVAL_MAX_STDEV) the result is a WARN: the sample is too noisy
//                 to trust, raise EVAL_SAMPLES rather than believe the mean.
//
// Assets with no llm-rubric (tool-routing / json-only) gate structurally
// instead: every foundation check must pass.

const num = (v, d) => (v != null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : d);

export const THRESHOLDS = {
  samples: Math.max(1, Math.round(num(process.env.EVAL_SAMPLES, 3))),
  minQuality: num(process.env.EVAL_MIN_QUALITY, 0.7),
  minMargin: num(process.env.EVAL_MIN_MARGIN, 0.1),
  maxStdev: num(process.env.EVAL_MAX_STDEV, 0.15),
};

export const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

export function stdev(a) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
}

// Decide one asset's verdict from its pooled scores.
//   foundationPrimary       — every neutral-judge score for the foundation column
//                             (pooled across models, tests, and samples)
//   foundationPass / N       — foundation cell pass/total (structural fallback)
//   baselinePrimaryByLabel   — { "no-prompt": [...scores], "naive": [...] }
// Returns { kind, verdict: PASS|WARN|FAIL|NODATA, ...stats, reasons[] }.
export function evaluateGate({ foundationPrimary = [], foundationPass = 0, foundationN = 0, baselinePrimaryByLabel = {} }, t = THRESHOLDS) {
  if (foundationPrimary.length) {
    const fMean = mean(foundationPrimary);
    const fStd = stdev(foundationPrimary);
    const bases = Object.entries(baselinePrimaryByLabel)
      .map(([label, xs]) => ({ label, m: xs.length ? mean(xs) : null }))
      .filter((b) => b.m != null);
    const strongest = bases.length ? bases.reduce((a, b) => (b.m > a.m ? b : a)) : null;
    const margin = strongest ? fMean - strongest.m : null;

    const reasons = [];
    let verdict = "PASS";
    if (fMean < t.minQuality) {
      verdict = "FAIL";
      reasons.push(`quality ${fMean.toFixed(2)} < ${t.minQuality}`);
    }
    if (margin != null && margin < t.minMargin) {
      verdict = "FAIL";
      reasons.push(`margin ${(margin >= 0 ? "+" : "") + margin.toFixed(2)} < ${t.minMargin} (vs ${strongest.label})`);
    }
    if (verdict !== "FAIL" && fStd > t.maxStdev) {
      verdict = "WARN";
      reasons.push(`noisy: stdev ${fStd.toFixed(2)} > ${t.maxStdev} — raise EVAL_SAMPLES`);
    }
    return { kind: "rubric", verdict, fMean, fStd, baseMean: strongest?.m ?? null, baseLabel: strongest?.label ?? null, margin, n: foundationPrimary.length, reasons };
  }

  if (foundationN > 0) {
    const rate = foundationPass / foundationN;
    const verdict = rate === 1 ? "PASS" : "FAIL";
    return { kind: "structural", verdict, rate, pass: foundationPass, n: foundationN, reasons: verdict === "PASS" ? [] : [`${foundationPass}/${foundationN} foundation checks passed`] };
  }

  return { kind: "nodata", verdict: "NODATA", reasons: ["no scored foundation results"] };
}

// Roll per-asset verdicts into an overall decision.
export function summarizeGate(verdicts) {
  const counts = { PASS: 0, WARN: 0, FAIL: 0, NODATA: 0 };
  for (const v of verdicts) counts[v.verdict] = (counts[v.verdict] ?? 0) + 1;
  return { counts, failed: counts.FAIL > 0, scored: verdicts.length - counts.NODATA };
}
