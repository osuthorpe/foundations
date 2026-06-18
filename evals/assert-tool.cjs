/*
 * promptfoo javascript assertion for tool-guidance evals.
 *
 * The model is asked to choose a tool and reply with a JSON object
 *   {"tool": "<name>", "arguments": { ... }}
 * (see the question template in each skill's promptfooconfig.yaml). This
 * assertion parses that object and checks routing against the test's vars:
 *   mustCall     — array; the chosen tool must be one of these
 *   mustNotCall  — array; the chosen tool must not be one of these
 *   dryRun       — "truthy" | "falsy" (optional); checks arguments.dry_run
 *
 * Referenced as: { type: javascript, value: file://../../evals/assert-tool.cjs }
 */
module.exports = (output, context) => {
  const vars = (context && context.vars) || {};
  const mustCall = vars.mustCall || [];
  const mustNotCall = vars.mustNotCall || [];
  const dryRun = vars.dryRun;

  let parsed;
  try {
    if (output && typeof output === "object") parsed = output;
    else {
      const m = String(output).match(/\{[\s\S]*\}/);
      parsed = JSON.parse(m ? m[0] : String(output));
    }
  } catch (e) {
    return { pass: false, score: 0, reason: `output is not the required JSON tool object: ${e.message}` };
  }

  const tool = parsed.tool ?? null;
  const args = parsed.arguments || {};

  if (mustCall.length && !mustCall.includes(tool)) {
    return { pass: false, score: 0, reason: `expected one of [${mustCall.join(", ")}], routed to "${tool}"` };
  }
  if (mustNotCall.includes(tool)) {
    return { pass: false, score: 0, reason: `routed to forbidden tool "${tool}"` };
  }
  if (dryRun === "truthy" && !args.dry_run) {
    return { pass: false, score: 0, reason: `expected dry_run truthy, got ${JSON.stringify(args.dry_run)}` };
  }
  if (dryRun === "falsy" && args.dry_run) {
    return { pass: false, score: 0, reason: `expected dry_run falsy, got ${JSON.stringify(args.dry_run)}` };
  }
  return { pass: true, score: 1, reason: `routed to "${tool}"${dryRun ? ` (dry_run=${JSON.stringify(args.dry_run)})` : ""}` };
};
