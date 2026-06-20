# scripts

Maintenance scripts for the asset catalog. This folder contains no application code.

| Script | Command | Purpose |
| --- | --- | --- |
| `build-index.js` | `npm run prompts:index` | Regenerates [prompts/INDEX.md](../prompts/INDEX.md) from every prompt's frontmatter |
| `build-assets.js` | `npm run assets:index` | Regenerates [ASSETS.md](../ASSETS.md) — the distribution map — from every asset's `consumers` |
| `check.js` | `npm run check` | Lints all asset frontmatter (name ↔ path, the `consumers` enum, unique leaf skill names, the uppercase-`SKILL.md` invariant, declared placeholders, schema) and fails if either generated file is stale — offline, no API key |
| `eval.js` | `npm run eval` | Runs every asset's `promptfooconfig.yaml` and prints a model leaderboard |
| `eval-one.js` | `make eval-one CONFIG=…` | Re-runs one asset with a plain-English before/after per model |
| `eval-ci.js` | — | PR eval report (advisory): evals only the changed assets, PR vs base |
| `list-skills.js` | — | Prints the folders of skills whose `consumers` includes a given target; used by `package-claude-desktop.sh` to discover what to build |
| `meta.js` | — | Shared frontmatter parser, asset collectors, and index renderers used by the above |

`npm run index` runs both generators; `npm run check` validates everything. Run `check` after any asset change and `index` whenever a generated file needs refreshing. Evals run through promptfoo; see [evals/README.md](../evals/README.md).
