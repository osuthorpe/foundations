#!/usr/bin/env node
// Regenerates ASSETS.md — the distribution matrix — from each asset's
// `consumers` frontmatter.
//
//   npm run assets:index
//
// `npm run check` fails when ASSETS.md is out of date, so run this after
// changing any asset's consumers.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectPrompts, collectReference, collectRules, collectSkills, renderAssets } from "./meta.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOUNDATION_ROOT = path.resolve(__dirname, "..");

const skills = collectSkills(FOUNDATION_ROOT);
const prompts = collectPrompts(FOUNDATION_ROOT);
const reference = collectReference(FOUNDATION_ROOT);
const rules = collectRules(FOUNDATION_ROOT);

const assetsPath = path.join(FOUNDATION_ROOT, "ASSETS.md");
fs.writeFileSync(assetsPath, renderAssets(skills, prompts, reference, rules));

const n =
  skills.filter((s) => s.exists).length + prompts.filter((p) => p.exists).length + reference.length + rules.length;
console.log(`ASSETS.md — ${n} assets mapped`);
