// Shared metadata layer for every asset's frontmatter.
//
// Parses the constrained frontmatter the convention uses (scalars + simple
// string lists — no YAML dependency) and collects skills / reference docs /
// rules. Used by scripts/check.js (lint).

import fs from "node:fs";
import path from "node:path";

// Frontmatter keys whose value is a "- item" list rather than a scalar.
const LIST_KEYS = new Set(["globs"]);

export function parseFrontmatter(source) {
  const lines = source.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return { meta: emptyMeta(), body: source.trim() };
  const close = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (close === -1) return { meta: emptyMeta(), body: source.trim() };

  const meta = emptyMeta();
  let section = null; // which LIST_KEY we are inside
  const unquote = (s) => s.trim().replace(/^["']|["']$/g, "");

  for (const line of lines.slice(1, close)) {
    const top = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (top) {
      const [, key, raw] = top;
      if (LIST_KEYS.has(key)) {
        section = key;
        meta[key] = [];
        if (raw.trim() && raw.trim() !== "[]") meta[key] = [unquote(raw)]; // inline single value
        continue;
      }
      section = null;
      meta[key] = unquote(raw);
      continue;
    }
    if (section) {
      const m = line.match(/^\s*-\s*(.+)$/);
      if (m) meta[section].push(unquote(m[1]));
    }
  }

  return { meta, body: lines.slice(close + 1).join("\n").trim() };
}

function emptyMeta() {
  return { globs: [] };
}

// Skills live in skills/ and may be organized into one level of category
// subfolder: both a flat skills/<name>/SKILL.md and a grouped
// skills/<category>/<name>/SKILL.md are recognized. A skill's `name` is its
// LEAF folder name (the category is organizational only); `folder` is the full
// path under the repo root. readdir returns the real on-disk filename, so
// SKILL.md vs skill.md case is detected even on case-insensitive macOS.
export function collectSkills(foundationRoot) {
  const base = "skills";
  const root = path.join(foundationRoot, base);
  const skills = [];
  if (!fs.existsSync(root)) return skills;
  const skip = (n) => n.startsWith(".") || n.startsWith("_");
  const isDir = (p) => fs.statSync(p).isDirectory();

  const load = (name, folder, dir) => {
    const skillFile = isDir(dir) ? fs.readdirSync(dir).find((f) => f.toLowerCase() === "skill.md") : null;
    const entry = {
      name,
      folder,
      dir,
      exists: Boolean(skillFile),
      skillFile: skillFile ?? null,
      isUpperCase: skillFile === "SKILL.md",
      meta: emptyMeta(),
      body: "",
    };
    if (skillFile) {
      const parsed = parseFrontmatter(fs.readFileSync(path.join(dir, skillFile), "utf-8"));
      entry.meta = parsed.meta;
      entry.body = parsed.body;
    }
    return entry;
  };

  for (const top of fs.readdirSync(root).sort()) {
    if (skip(top)) continue;
    const topDir = path.join(root, top);
    if (!isDir(topDir)) continue; // skip files like README.md
    // A folder holding a SKILL.md is a flat skill; otherwise it's a category
    // whose immediate children are skills.
    if (fs.readdirSync(topDir).some((f) => f.toLowerCase() === "skill.md")) {
      skills.push(load(top, `${base}/${top}`, topDir));
      continue;
    }
    for (const leaf of fs.readdirSync(topDir).sort()) {
      if (skip(leaf)) continue;
      const leafDir = path.join(topDir, leaf);
      if (!isDir(leafDir)) continue;
      skills.push(load(leaf, `${base}/${top}/${leaf}`, leafDir));
    }
  }
  return skills;
}

// Reference docs are flat reference/<name>.md (README.md excluded — it explains
// the folder to humans rather than being an asset).
export function collectReference(foundationRoot) {
  const root = path.join(foundationRoot, "reference");
  const docs = [];
  if (!fs.existsSync(root)) return docs;
  for (const file of fs.readdirSync(root).sort()) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(root, file), "utf-8"));
    docs.push({ name: file.replace(/\.md$/, ""), folder: `reference/${file}`, dir: root, meta, body });
  }
  return docs;
}

// Rules are flat rules/<name>.mdc (or .md) — Cursor / AGENTS-style persistent
// guidance. README.md is excluded. The frontmatter carries name / description /
// status alongside any Cursor-native keys (globs, alwaysApply) passed through.
export function collectRules(foundationRoot) {
  const root = path.join(foundationRoot, "rules");
  const rules = [];
  if (!fs.existsSync(root)) return rules;
  for (const file of fs.readdirSync(root).sort()) {
    if (file === "README.md" || !/\.(mdc|md)$/.test(file)) continue;
    const { meta, body } = parseFrontmatter(fs.readFileSync(path.join(root, file), "utf-8"));
    rules.push({ name: file.replace(/\.(mdc|md)$/, ""), folder: `rules/${file}`, dir: root, meta, body });
  }
  return rules;
}
