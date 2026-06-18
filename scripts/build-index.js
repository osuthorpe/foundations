#!/usr/bin/env node
// Regenerates prompts/INDEX.md from each prompt's frontmatter.
//
//   npm run prompts:index
//
// `npm run prompts:check` fails when INDEX.md is out of date, so run this after
// adding or editing any prompt.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectPrompts, renderIndex } from "./meta.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOUNDATION_ROOT = path.resolve(__dirname, "..");

const prompts = collectPrompts(FOUNDATION_ROOT);
const indexPath = path.join(FOUNDATION_ROOT, "prompts", "INDEX.md");
fs.writeFileSync(indexPath, renderIndex(prompts));
console.log(`prompts/INDEX.md — ${prompts.filter((p) => p.exists).length} prompts indexed`);
