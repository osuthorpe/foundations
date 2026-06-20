/*
 * promptfoo provider for skill evals.
 *
 * The single piece of glue between promptfoo and the repo's skills: it lets
 * every eval test the REAL skills/<name>/SKILL.md, never a copy. Each export
 * builds the chat messages for one comparison column and returns them as a JSON
 * string (promptfoo parses a JSON-array prompt into `messages`).
 *
 * promptfoo does NOT apply templating to a function's return value, so every
 * variable is substituted here. Referenced from a promptfooconfig.yaml as e.g.
 *   function: file://../../evals/load-prompt.cjs:withSkill
 * Paths in vars (skillPath) resolve from the repo root, which is the working
 * directory when evals run via `npm run eval` from root.
 *
 * Columns:
 *   skillBaseline — the question with no skill (the control)
 *   withSkill     — the same question with the SKILL.md injected (vars.skillPath)
 *   toolBaseline  — a tool-routing request with no skill
 *   toolSkill     — the same request with the routing SKILL.md injected
 */
const fs = require("node:fs");
const path = require("node:path");

const BASE_SYSTEM = "You are a helpful assistant.";

const interpolate = (tpl, vars) =>
  String(tpl ?? "").replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : "",
  );

function messages(system, user) {
  const msgs = [];
  if (system) msgs.push({ role: "system", content: system });
  msgs.push({ role: "user", content: user });
  return JSON.stringify(msgs);
}

const fromRoot = (p) => path.resolve(process.cwd(), p);

function skillBaseline({ vars }) {
  return messages(BASE_SYSTEM, interpolate(vars.question ?? "", vars));
}

function withSkill({ vars }) {
  const skill = fs.readFileSync(fromRoot(vars.skillPath), "utf-8");
  return messages(
    `${BASE_SYSTEM}\n\n=== Domain knowledge ===\n${skill}`,
    interpolate(vars.question ?? "", vars),
  );
}

// --- tool-routing: ask the model to pick a tool and reply as a JSON object ---
const ROUTE_INSTRUCTION =
  'Respond ONLY with a JSON object — no prose, no markdown fences: ' +
  '{"tool": "<tool_name>", "arguments": { ... }}. ' +
  'If no tool fits, respond with {"tool": null, "arguments": {}}.';

const routePrompt = (vars) =>
  `Available tools:\n${interpolate(vars.tools ?? "", vars)}\n\n` +
  `User request: ${interpolate(vars.request ?? "", vars)}\n\n${ROUTE_INSTRUCTION}`;

function toolBaseline({ vars }) {
  return messages(BASE_SYSTEM, routePrompt(vars));
}

function toolSkill({ vars }) {
  const skill = fs.readFileSync(fromRoot(vars.skillPath), "utf-8");
  return messages(`${BASE_SYSTEM}\n\n${skill}`, routePrompt(vars));
}

module.exports = { skillBaseline, withSkill, toolBaseline, toolSkill };
