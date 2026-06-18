/*
 * promptfoo prompt provider for foundation evals.
 *
 * This is the single piece of glue between promptfoo and the repo's canonical
 * assets: it lets every eval test the REAL prompts/<name>/prompt.md and
 * skills/<name>/SKILL.md, never a copy. Each export builds the chat messages
 * for one variant and returns them as a JSON string (promptfoo's OpenAI-format
 * providers parse a JSON-array prompt into `messages`).
 *
 * promptfoo does NOT apply templating to a function's return value, so every
 * variable is substituted here. Referenced from a promptfooconfig.yaml as e.g.
 *   function: file://../../evals/load-prompt.cjs:improved
 * Paths in vars (promptPath, skillPath) are resolved from the repo root, which
 * is the working directory when evals run via `npm run eval` / npx from root.
 *
 * Variants:
 *   baseline  — no prompt: the user's raw input, no instructions (vars.baseline)
 *   legacy    — the existing/legacy product prompt (vars.legacy)
 *   improved  — the canonical prompt.md at vars.promptPath
 *   skillBaseline — a question with no skill (skill-coverage control)
 *   withSkill — the same question with the SKILL.md injected (vars.skillPath)
 */
const fs = require("node:fs");
const path = require("node:path");

const BASE_SYSTEM = "You are a helpful assistant.";

const interpolate = (tpl, vars) =>
  String(tpl ?? "").replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : "",
  );

// Strip a leading --- frontmatter --- block, returning just the body.
function stripFrontmatter(src) {
  const lines = src.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return src.trim();
  const close = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  return close === -1 ? src.trim() : lines.slice(close + 1).join("\n").trim();
}

// Split a body on "## System" / "## User" headings into provider channels.
// A body with no headings is a single user message.
function splitRoles(body) {
  if (!/^## (System|User)\s*$/m.test(body)) return { system: null, user: body.trim() };
  const out = { system: null, user: "" };
  const parts = body.split(/^## (System|User)\s*$/m);
  for (let i = 1; i < parts.length; i += 2) out[parts[i].toLowerCase()] = parts[i + 1].trim();
  return out;
}

function messages(system, user) {
  const msgs = [];
  if (system) msgs.push({ role: "system", content: system });
  msgs.push({ role: "user", content: user });
  return JSON.stringify(msgs);
}

const fromRoot = (p) => path.resolve(process.cwd(), p);

// Prepend resolved-resource text (the old mock_context) to a control request.
const withContext = (vars, body) =>
  vars.context ? `Here is the context:\n\n${vars.context}\n\n${body}` : body;

function baseline({ vars }) {
  return messages(BASE_SYSTEM, withContext(vars, interpolate(vars.baseline ?? "", vars)));
}

function legacy({ vars }) {
  return messages(BASE_SYSTEM, withContext(vars, interpolate(vars.legacy ?? "", vars)));
}

function improved({ vars }) {
  const body = stripFrontmatter(fs.readFileSync(fromRoot(vars.promptPath), "utf-8"));
  const v = { ...vars };
  // {{schema}} is filled from the prompt's sibling schema.json
  if (v.schema === undefined) {
    const schemaPath = path.join(path.dirname(fromRoot(vars.promptPath)), "schema.json");
    if (fs.existsSync(schemaPath)) v.schema = fs.readFileSync(schemaPath, "utf-8").trim();
  }
  const sections = splitRoles(body);
  const baseSystem = sections.system ? interpolate(sections.system, v) : BASE_SYSTEM;
  const system = v.context ? `${baseSystem}\n\n${v.context}` : baseSystem;
  return messages(system, interpolate(sections.user, v));
}

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

// --- tool-guidance: ask the model to pick a tool and reply as a JSON object ---
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

module.exports = { baseline, legacy, improved, skillBaseline, withSkill, toolBaseline, toolSkill };
