# scripts

Maintenance scripts for the asset catalog. This folder contains no application code.

| Script | Command | Purpose |
| --- | --- | --- |
| `check.js` | `npm run check` | Lints all asset frontmatter (name ↔ folder/file, uppercase `SKILL.md`, unique leaf skill names, valid `status`) — offline, no API key |
| `eval.js` | `npm run eval` | Runs every skill's `promptfooconfig.yaml`, applies the ship gate, and writes the leaderboard + reports |
| `eval-one.js` | `make eval-one CONFIG=…` | Re-runs one skill with a plain-English before/after per model |
| `eval-trend.js` | `npm run eval:trend` | Renders the score trend across past runs |
| `gate.js` | — | The ship-gate logic (sampling thresholds + margin) used by `eval.js` |
| `meta.js` | — | Shared frontmatter parser + asset collectors used by `check.js` |

Run `check` after any asset change. Evals run through promptfoo; see [evals/README.md](../evals/README.md).
