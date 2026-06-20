#!/usr/bin/env node
// Offline check for asset frontmatter. No API calls.
//
//   node scripts/check.js   (npm run check)
//
// Skills (skills/<name>/SKILL.md, or skills/<category>/<name>/SKILL.md):
//   - the skill file is uppercase SKILL.md (lowercase skill.md is silently
//     ignored by the skill loader)
//   - name == leaf folder name; description present; status valid
//   - leaf skill names are unique across categories
//   - a non-deprecated skill has a promptfooconfig.yaml (warn) — prove it helps
//
// Reference (reference/<name>.md) and rules (rules/<name>.mdc):
//   - name == file name; description present; status valid
//
// Errors exit 1; warnings exit 0. This is asset tooling, not an eval — evals
// run through promptfoo (see evals/README.md).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectReference, collectRules, collectSkills } from "./meta.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOUNDATION_ROOT = path.resolve(__dirname, "..");

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

const STATUSES = new Set(["proposed", "active", "deprecated"]);
const checkStatus = (rel, m) => {
  if (!STATUSES.has(m.status)) err(rel, `"status" must be proposed|active|deprecated (got "${m.status ?? ""}")`);
};

// --- Skills -----------------------------------------------------------------
const skills = collectSkills(FOUNDATION_ROOT);

for (const s of skills) {
  if (!s.exists) {
    err(s.folder, "skill folder has no SKILL.md");
    continue;
  }
  const rel = `${s.folder}/${s.skillFile}`;
  // The skill loader only recognizes uppercase SKILL.md; lowercase skill.md is
  // silently dropped. Catching this is the whole point of the convention.
  if (!s.isUpperCase) {
    err(rel, `skill file must be uppercase "SKILL.md" (found "${s.skillFile}") — the skill loader ignores lowercase`);
  }
  const m = s.meta;
  if (!m.name) err(rel, 'missing "name"');
  else if (m.name !== s.name) err(rel, `name "${m.name}" must equal the (leaf) folder name "${s.name}"`);
  if (!m.description) err(rel, 'missing "description" — it is the trigger the AI sees');
  checkStatus(rel, m);

  const hasEval = fs.existsSync(path.join(s.dir, "promptfooconfig.yaml"));
  if (!hasEval && m.status !== "deprecated") {
    warn(rel, "no promptfooconfig.yaml — add an eval to prove the skill helps");
  }
}

// Leaf skill names must be unique across categories — a consumer copies a skill
// by its own folder name into ~/.claude/skills/<name>/, so two skills sharing a
// leaf name would collide there.
const seen = {};
for (const s of skills) {
  if (s.exists && s.name) (seen[s.name] ??= []).push(s.folder);
}
for (const [name, folders] of Object.entries(seen)) {
  if (folders.length > 1) err("skills", `duplicate skill name "${name}" in: ${folders.join(", ")} — leaf folder names must be unique`);
}

// --- Reference docs ---------------------------------------------------------
const reference = collectReference(FOUNDATION_ROOT);
for (const d of reference) {
  const m = d.meta;
  if (!m.name) err(d.folder, 'missing "name"');
  else if (m.name !== d.name) err(d.folder, `name "${m.name}" must equal the file name "${d.name}"`);
  if (!m.description) err(d.folder, 'missing "description"');
  checkStatus(d.folder, m);
}

// --- Rules ------------------------------------------------------------------
const rules = collectRules(FOUNDATION_ROOT);
for (const r of rules) {
  const m = r.meta;
  if (!m.name) err(r.folder, 'missing "name"');
  else if (m.name !== r.name) err(r.folder, `name "${m.name}" must equal the file name "${r.name}"`);
  if (!m.description) err(r.folder, 'missing "description" — Cursor uses it to decide when to attach the rule');
  checkStatus(r.folder, m);
}

const skillCount = skills.filter((s) => s.exists).length;
for (const e of errors) console.log(`✗ ${e}`);
for (const w of warnings) console.log(`⚠ ${w}`);
console.log(
  `\n${skillCount} skills, ${reference.length} reference docs, ${rules.length} rules — ${errors.length} error(s), ${warnings.length} warning(s)`,
);
if (errors.length > 0) process.exit(1);
