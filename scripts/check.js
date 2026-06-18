#!/usr/bin/env node
// Offline check for asset frontmatter and the generated indexes. No API calls.
//
//   node scripts/check.js   (npm run check)
//
// Prompts (prompts/<area>/<name>/prompt.md):
//   - name matches the folder path (<area>-<name>); description present
//   - class / output / status from the allowed sets; consumers from the enum
//   - every {{placeholder}} in the body and resource URIs is a declared
//     argument ({{schema}} is built in when a schema.json exists)
//   - schema.json parses when output is json
//   - agentic prompts don't use a ## System section (MCP messages are user/assistant)
//
// Skills (skills/<name>/SKILL.md):
//   - the skill file is uppercase SKILL.md (lowercase skill.md is silently
//     ignored by the Claude Code loader)
//   - name == folder name; description present; status / consumers valid
//   - consumers ⟺ directory: `cc-plugin` requires skills/ (the only dir the
//     CLI scans)
//
// Reference (reference/<name>.md): name / description / status / consumers.
// Rules (rules/<name>.mdc): name / description / status / consumers.
//
// Freshness: prompts/INDEX.md and ASSETS.md are current (npm run index).
//
// Errors exit 1; warnings exit 0. This is asset tooling, not an eval — evals
// run through promptfoo (see evals/README.md).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONSUMERS,
  collectPrompts,
  collectReference,
  collectRules,
  collectSkills,
  placeholders,
  renderAssets,
  renderIndex,
  splitRoles,
} from "./meta.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOUNDATION_ROOT = path.resolve(__dirname, "..");

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

const PROMPT_CLASSES = new Set(["completion", "agentic"]);
const PROMPT_OUTPUTS = new Set(["text", "json", "image-prompt"]);
const STATUSES = new Set(["proposed", "active", "deprecated"]);
const PROMPT_CAPABILITIES = new Set(["image-generation", "tool-use", "vision"]);
const CONSUMER_KEYS = new Set(Object.keys(CONSUMERS));

// Which consumers each asset type may legitimately declare.
const PROMPT_CONSUMERS = new Set(["mcp"]);
const SKILL_CONSUMERS = new Set(["cc-plugin", "desktop-zip", "mcp"]);
const REFERENCE_CONSUMERS = new Set(["context-injection"]);
const RULE_CONSUMERS = new Set(["cursor"]);

// Validate a consumers list against the global enum and a per-type allow-set.
const checkConsumers = (rel, consumers, allowed) => {
  if (!consumers?.length) {
    err(rel, 'missing "consumers" — list the runtimes that package or serve this asset');
    return;
  }
  for (const c of consumers) {
    if (!CONSUMER_KEYS.has(c)) err(rel, `unknown consumer "${c}" (allowed: ${[...CONSUMER_KEYS].join(", ")})`);
    else if (!allowed.has(c)) err(rel, `consumer "${c}" is not valid for this asset type (allowed: ${[...allowed].join(", ")})`);
  }
};

const prompts = collectPrompts(FOUNDATION_ROOT);

for (const p of prompts) {
  const rel = `prompts/${p.folder}/prompt.md`;
  if (!p.exists) {
    err(`prompts/${p.folder}`, "folder has no prompt.md");
    continue;
  }
  const m = p.meta;
  const expectedName = p.folder.replace(/\//g, "-");
  if (!m.name) err(rel, 'missing "name"');
  else if (m.name !== expectedName) err(rel, `name "${m.name}" must be "${expectedName}" (matches folder path ${p.folder})`);
  if (!m.description) err(rel, 'missing "description"');
  if (!PROMPT_CLASSES.has(m.class)) err(rel, `"class" must be completion|agentic (got "${m.class ?? ""}")`);
  if (!PROMPT_OUTPUTS.has(m.output)) err(rel, `"output" must be text|json|image-prompt (got "${m.output ?? ""}")`);
  if (!STATUSES.has(m.status)) err(rel, `"status" must be proposed|active|deprecated (got "${m.status ?? ""}")`);
  checkConsumers(rel, m.consumers, PROMPT_CONSUMERS);
  if (!m.audience) warn(rel, 'missing "audience" — who is this prompt for?');
  if (!m.surfaces?.length) warn(rel, 'missing "surfaces" — record where this prompt is used');

  for (const cap of m.requires ?? []) {
    if (!PROMPT_CAPABILITIES.has(cap)) {
      err(rel, `unknown capability "${cap}" in requires (allowed: ${[...PROMPT_CAPABILITIES].join(", ")})`);
    }
  }

  const sections = splitRoles(p.body);
  if (sections.system !== null && m.class === "agentic") {
    warn(rel, "agentic prompt has a ## System section — MCP prompt messages only carry user/assistant roles");
  }

  const declared = new Set((m.arguments ?? []).map((a) => a.name));
  // {{schema}} is a built-in placeholder filled from the prompt's schema.json
  const hasSchemaFile = fs.existsSync(path.join(p.dir, "schema.json"));
  if (hasSchemaFile) declared.add("schema");
  const used = placeholders(p.body + " " + (m.messages ?? []).map((x) => x.uri ?? "").join(" "));
  for (const u of used) {
    if (!declared.has(u)) {
      err(rel, u === "schema"
        ? "placeholder {{schema}} requires a schema.json in the prompt folder"
        : `placeholder {{${u}}} is not a declared argument`);
    }
  }
  for (const a of m.arguments ?? []) {
    if (a.required && !used.has(a.name)) {
      warn(rel, `required argument "${a.name}" never appears in the body or resource URIs`);
    }
  }

  if (m.output === "json") {
    const schemaPath = path.join(p.dir, "schema.json");
    if (!fs.existsSync(schemaPath)) {
      warn(rel, "output is json but no schema.json — the contract lives only with the caller");
    } else {
      try {
        JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
      } catch (e) {
        err(`prompts/${p.folder}/schema.json`, `not valid JSON: ${e.message}`);
      }
    }
  }

  const hasEval = fs.existsSync(path.join(p.dir, "promptfooconfig.yaml"));
  if (!hasEval && m.status !== "deprecated") {
    warn(rel, "no promptfooconfig.yaml — add an eval before any consumer pins to this prompt");
  }
}

// --- Skills (skills/) -------------------------------------------------------
const skills = collectSkills(FOUNDATION_ROOT);

for (const s of skills) {
  if (!s.exists) {
    err(s.folder, "skill folder has no SKILL.md");
    continue;
  }
  const rel = `${s.folder}/${s.skillFile}`;
  // The CLI loader only recognizes uppercase SKILL.md; a lowercase skill.md is
  // silently dropped. Catching this is the whole point of the convention.
  if (!s.isUpperCase) {
    err(rel, `skill file must be uppercase "SKILL.md" (found "${s.skillFile}") — the Claude Code loader ignores lowercase`);
  }
  const m = s.meta;
  if (!m.name) err(rel, 'missing "name"');
  else if (m.name !== s.name) err(rel, `name "${m.name}" must equal the folder name "${s.name}"`);
  if (!m.description) err(rel, 'missing "description"');
  if (!STATUSES.has(m.status)) err(rel, `"status" must be proposed|active|deprecated (got "${m.status ?? ""}")`);
  checkConsumers(rel, m.consumers, SKILL_CONSUMERS);

  // The directory IS the cc-plugin boundary: Claude Code only scans skills/.
  const claimsPlugin = (m.consumers ?? []).includes("cc-plugin");
  if (!claimsPlugin && s.inPluginDir) {
    err(rel, "lives in skills/ (which the CLI always loads) but does not declare consumer \"cc-plugin\" — add cc-plugin.");
  }

  const hasEval = fs.existsSync(path.join(s.dir, "promptfooconfig.yaml"));
  if (!hasEval && m.status !== "deprecated") {
    warn(rel, "no promptfooconfig.yaml — add an eval before any consumer pins to this skill");
  }
}

// --- Reference docs ---------------------------------------------------------
const reference = collectReference(FOUNDATION_ROOT);

for (const d of reference) {
  const rel = d.folder;
  const m = d.meta;
  if (!m.name) err(rel, 'missing "name"');
  else if (m.name !== d.name) err(rel, `name "${m.name}" must equal the file name "${d.name}"`);
  if (!m.description) err(rel, 'missing "description"');
  if (!STATUSES.has(m.status)) err(rel, `"status" must be proposed|active|deprecated (got "${m.status ?? ""}")`);
  checkConsumers(rel, m.consumers, REFERENCE_CONSUMERS);
}

// --- Rules ------------------------------------------------------------------
const rules = collectRules(FOUNDATION_ROOT);

for (const r of rules) {
  const rel = r.folder;
  const m = r.meta;
  if (!m.name) err(rel, 'missing "name"');
  else if (m.name !== r.name) err(rel, `name "${m.name}" must equal the file name "${r.name}"`);
  if (!m.description) err(rel, 'missing "description" — Cursor uses it to decide when to attach the rule');
  if (!STATUSES.has(m.status)) err(rel, `"status" must be proposed|active|deprecated (got "${m.status ?? ""}")`);
  checkConsumers(rel, m.consumers, RULE_CONSUMERS);
}

// --- Generated files are current --------------------------------------------
const checkGenerated = (relPath, expected) => {
  const full = path.join(FOUNDATION_ROOT, relPath);
  const actual = fs.existsSync(full) ? fs.readFileSync(full, "utf-8") : "";
  if (actual !== expected) err(relPath, "stale or missing — run `npm run index`");
};
checkGenerated("prompts/INDEX.md", renderIndex(prompts));
checkGenerated("ASSETS.md", renderAssets(skills, prompts, reference, rules));

const promptCount = prompts.filter((p) => p.exists).length;
const skillCount = skills.filter((s) => s.exists).length;
for (const e of errors) console.log(`✗ ${e}`);
for (const w of warnings) console.log(`⚠ ${w}`);
console.log(
  `\n${promptCount} prompts, ${skillCount} skills, ${reference.length} reference docs, ${rules.length} rules — ${errors.length} error(s), ${warnings.length} warning(s)`
);
if (errors.length > 0) process.exit(1);
