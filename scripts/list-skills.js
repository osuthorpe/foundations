#!/usr/bin/env node
// Prints the folder of every skill whose `consumers` frontmatter includes the
// given target, one per line. Used by packaging scripts so they discover what
// to build from the assets' own metadata instead of hardcoding skill names.
//
//   node scripts/list-skills.js desktop-zip

import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectSkills } from "./meta.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2];
if (!target) {
  console.error("usage: node scripts/list-skills.js <consumer>");
  process.exit(2);
}
for (const s of collectSkills(root)) {
  if (s.exists && (s.meta.consumers ?? []).includes(target)) console.log(s.folder);
}
