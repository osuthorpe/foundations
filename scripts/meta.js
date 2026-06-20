// Shared metadata layer for every asset's frontmatter.
//
// Parses the constrained YAML subset the convention uses (scalars, string
// lists, and the arguments/messages item lists — no YAML dependency), collects
// prompts / skills / reference docs / rules, and renders the generated indexes
// (prompts/INDEX.md and ASSETS.md). Used by scripts/check.js (lint + freshness)
// and scripts/build-index.js / scripts/build-assets.js (generation).

import fs from "node:fs";
import path from "node:path";

const LIST_KEYS = new Set(["arguments", "surfaces", "messages", "requires", "consumers"]);

// The closed set of distribution targets. A `consumers` value answers "which
// runtime packages or serves this asset" and is what each build step filters
// on.
export const CONSUMERS = {
  cursor: "Cursor / AGENTS rules",
  "cc-plugin": "Claude Code plugin",
  "desktop-zip": "Claude Desktop / claude.ai zip",
  mcp: "MCP server / agent",
  "context-injection": "Reference context",
};

export function parsePromptSource(source) {
  const lines = source.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return { meta: emptyMeta(), body: source.trim() };
  const close = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (close === -1) return { meta: emptyMeta(), body: source.trim() };

  const meta = emptyMeta();
  let section = null; // which LIST_KEY we are inside
  let item = null; // current arguments/messages item

  const unquote = (s) => s.trim().replace(/^["']|["']$/g, "");

  for (const line of lines.slice(1, close)) {
    const top = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (top) {
      const [, key, raw] = top;
      item = null;
      if (LIST_KEYS.has(key)) {
        section = key;
        if (raw.trim() === "[]") meta[key] = [];
        continue;
      }
      section = null;
      meta[key] = unquote(raw);
      continue;
    }

    if (section === "surfaces" || section === "requires" || section === "consumers") {
      const m = line.match(/^\s*-\s*(.+)$/);
      if (m) meta[section].push(unquote(m[1]));
      continue;
    }

    if (section === "arguments") {
      const start = line.match(/^\s*-\s*name:\s*(.+)$/);
      if (start) {
        item = { name: unquote(start[1]), required: false };
        meta.arguments.push(item);
        continue;
      }
      const field = line.match(/^\s*(description|required):\s*(.+)$/);
      if (field && item) {
        item[field[1]] = field[1] === "required" ? field[2].trim() === "true" : unquote(field[2]);
      }
      continue;
    }

    if (section === "messages") {
      const start = line.match(/^\s*-\s*type:\s*(.+)$/);
      if (start) {
        item = { type: unquote(start[1]) };
        meta.messages.push(item);
        continue;
      }
      const uri = line.match(/^\s*uri:\s*(.+)$/);
      if (uri && item) item.uri = unquote(uri[1]);
    }
  }

  return { meta, body: lines.slice(close + 1).join("\n").trim() };
}

function emptyMeta() {
  return { arguments: [], surfaces: [], messages: [], requires: [], consumers: [] };
}

// Split a body into role sections. "## System" / "## User" headings declare
// which provider channel each part targets; a body with no role headings is a
// single user message (correct for image endpoints and MCP prompt bodies).
export function splitRoles(body) {
  const m = body.match(/^## (System|User)\s*$/m);
  if (!m) return { system: null, user: body.trim() };
  const sections = { system: null, user: "" };
  const parts = body.split(/^## (System|User)\s*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    sections[parts[i].toLowerCase()] = parts[i + 1].trim();
  }
  return sections;
}

export function placeholders(text) {
  const found = new Set();
  for (const m of text.matchAll(/{{\s*([A-Za-z0-9_]+)\s*}}/g)) found.add(m[1]);
  return found;
}

// Prompts are organized as prompts/<area>/<name>/prompt.md. This walks that
// structure and also tolerates a flat prompts/<name>/prompt.md. The `folder`
// field is the path under prompts/ (e.g. "writing/summarize"); the prompt's
// frontmatter `name` must equal that path with "/" replaced by "-".
export function collectPrompts(foundationRoot) {
  const base = path.join(foundationRoot, "prompts");
  const prompts = [];
  if (!fs.existsSync(base)) return prompts;
  const skip = (n) => n.startsWith(".") || n.startsWith("_");
  const isDir = (p) => fs.statSync(p).isDirectory();

  const load = (folder, dir) => {
    const promptPath = path.join(dir, "prompt.md");
    if (!fs.existsSync(promptPath)) return { folder, dir, exists: false, meta: emptyMeta(), body: "" };
    const { meta, body } = parsePromptSource(fs.readFileSync(promptPath, "utf-8"));
    return { folder, dir, exists: true, meta, body };
  };

  for (const top of fs.readdirSync(base).sort()) {
    if (skip(top)) continue;
    const topDir = path.join(base, top);
    if (!isDir(topDir)) continue; // skip files like INDEX.md
    if (fs.existsSync(path.join(topDir, "prompt.md"))) {
      prompts.push(load(top, topDir)); // flat prompt at prompts/<top>/
      continue;
    }
    for (const leaf of fs.readdirSync(topDir).sort()) {
      if (skip(leaf)) continue;
      const leafDir = path.join(topDir, leaf);
      if (!isDir(leafDir)) continue;
      prompts.push(load(`${top}/${leaf}`, leafDir));
    }
  }
  return prompts;
}

export function renderIndex(prompts) {
  const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
  const row = (p) => {
    const m = p.meta;
    const args = (m.arguments ?? []).map((a) => `\`${a.name}\`${a.required ? "" : "?"}`).join(", ") || "—";
    const surfaces = (m.surfaces ?? []).map(esc).join("<br>") || "—";
    const output = `\`${m.output}\`${m.requires?.length ? ` · needs ${m.requires.join(", ")}` : ""}`;
    return `| [${m.name}](${p.folder}/prompt.md) | ${esc(m.description)} | ${surfaces} | ${esc(m.audience ?? "—")} | ${output} | ${m.status} | ${args} |`;
  };
  const header =
    "| Prompt | What it does | Used in | Audience | Output | Status | Arguments |\n" +
    "| --- | --- | --- | --- | --- | --- | --- |";

  const rows = prompts
    .filter((p) => p.exists)
    .sort((a, b) => a.folder.localeCompare(b.folder))
    .map(row)
    .join("\n");

  return `# Prompt Index

> **Generated file — do not edit.** Regenerate with \`npm run prompts:index\`
> after adding or changing a prompt. \`npm run check\` fails when this file is
> stale.

Prompts are caller-invoked request templates: a surface invokes one by name,
supplies the declared arguments, and gets a contracted output. (Work the model
should decide to do on its own is a **skill**, not a prompt.) Arguments marked
\`?\` are optional. The **Used in** column comes from each prompt's \`surfaces\`
field — keep it current; it is how anyone finds what a change will affect.

${header}
${rows}
`;
}

// Skills live in skills/ (auto-loaded by the Claude Code plugin when they
// declare cc-plugin). The CLI only ever scans the literal skills/ dir for
// <name>/SKILL.md, so the directory IS the cc-plugin boundary; the frontmatter
// `consumers` field records the full set of runtimes. readdir returns the real
// on-disk filename, so SKILL.md vs skill.md case is detected even on
// case-insensitive macOS.
export function collectSkills(foundationRoot) {
  const roots = [{ base: "skills", inPluginDir: true }];
  const skills = [];
  const skip = (n) => n.startsWith(".") || n.startsWith("_");

  for (const { base, inPluginDir } of roots) {
    const root = path.join(foundationRoot, base);
    if (!fs.existsSync(root)) continue;
    for (const name of fs.readdirSync(root).sort()) {
      if (skip(name)) continue;
      const dir = path.join(root, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      const skillFile = fs.readdirSync(dir).find((f) => f.toLowerCase() === "skill.md");
      const entry = {
        name,
        base,
        dir,
        folder: `${base}/${name}`,
        inPluginDir,
        exists: Boolean(skillFile),
        skillFile: skillFile ?? null,
        isUpperCase: skillFile === "SKILL.md",
        meta: emptyMeta(),
        body: "",
      };
      if (skillFile) {
        const parsed = parsePromptSource(fs.readFileSync(path.join(dir, skillFile), "utf-8"));
        entry.meta = parsed.meta;
        entry.body = parsed.body;
      }
      skills.push(entry);
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
    const full = path.join(root, file);
    const { meta, body } = parsePromptSource(fs.readFileSync(full, "utf-8"));
    docs.push({ name: file.replace(/\.md$/, ""), folder: `reference/${file}`, dir: root, meta, body });
  }
  return docs;
}

// Rules are flat rules/<name>.mdc (or .md) — Cursor / AGENTS-style persistent
// guidance. README.md is excluded (it explains the folder to humans). The
// frontmatter carries the foundation fields (name / description / consumers /
// status) alongside any Cursor-native keys (globs, alwaysApply) the parser
// passes through untouched.
export function collectRules(foundationRoot) {
  const root = path.join(foundationRoot, "rules");
  const rules = [];
  if (!fs.existsSync(root)) return rules;
  for (const file of fs.readdirSync(root).sort()) {
    if (file === "README.md" || !/\.(mdc|md)$/.test(file)) continue;
    const full = path.join(root, file);
    const { meta, body } = parsePromptSource(fs.readFileSync(full, "utf-8"));
    rules.push({ name: file.replace(/\.(mdc|md)$/, ""), folder: `rules/${file}`, dir: root, meta, body });
  }
  return rules;
}

// ASSETS.md — the distribution matrix. Answers "what ships where" at a glance
// by listing every asset under each consumer it declares, so a reader can see
// exactly what the Claude Code plugin loads, what an MCP server serves, etc.
export function renderAssets(skills, prompts, reference, rules = []) {
  const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");

  // Flatten every asset into {label, link, type, consumers, status}.
  const rows = [];
  for (const s of skills) {
    if (!s.exists) continue;
    rows.push({
      label: s.meta.name || s.name,
      link: `${s.folder}/${s.skillFile}`,
      type: "skill",
      consumers: s.meta.consumers ?? [],
      status: s.meta.status ?? "—",
    });
  }
  for (const p of prompts) {
    if (!p.exists) continue;
    rows.push({
      label: p.meta.name,
      link: `prompts/${p.folder}/prompt.md`,
      type: `prompt (${p.meta.class})`,
      consumers: p.meta.consumers ?? [],
      status: p.meta.status ?? "—",
    });
  }
  for (const d of reference) {
    rows.push({
      label: d.meta.name || d.name,
      link: d.folder,
      type: "reference",
      consumers: d.meta.consumers ?? [],
      status: d.meta.status ?? "—",
    });
  }
  for (const r of rules) {
    rows.push({
      label: r.meta.name || r.name,
      link: r.folder,
      type: "rule",
      consumers: r.meta.consumers ?? [],
      status: r.meta.status ?? "—",
    });
  }

  const byConsumer = (key) =>
    rows
      .filter((r) => r.consumers.includes(key))
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((r) => `| [${esc(r.label)}](${r.link}) | ${r.type} | ${r.status} | ${r.consumers.join(", ")} |`)
      .join("\n") || "| _none_ | | | |";

  const section = (key) => `### ${CONSUMERS[key]} — \`${key}\`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
${byConsumer(key)}
`;

  return `# Asset Distribution Map

> **Generated file — do not edit.** Regenerate with \`npm run assets:index\`
> after changing any asset's \`consumers\`. \`npm run check\` fails when this
> file is stale.

Each asset declares a \`consumers\` list in its frontmatter — the closed set of
runtimes that package or serve it. This map groups every asset by consumer so
you can see what each runtime ships. The list is authoritative: the Claude Code
plugin loads exactly the \`skills/\` tree, the Desktop packager and MCP loaders
filter on \`consumers\`.

${Object.keys(CONSUMERS).map(section).join("\n")}`;
}
