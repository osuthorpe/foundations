# AGENTS.md

Operating guide for AI agents working in **foundations** — a personal repo of AI assets (**skills**, **reference** docs, editor **rules**) and the evals that keep them honest. Everything is plain text, versioned in git, changed by PR. People take individual assets à la carte; nobody installs the whole repo or wires it into CI.

Human docs live in each folder's `README.md` (start at [README.md](README.md)). This file is the short operational version — what to do, and what never to do.

## Repo map

| Path | Holds | Guide |
| --- | --- | --- |
| `skills/[<category>/]<name>/` | playbooks taken à la carte (Claude Code / Desktop) | [skills/README.md](skills/README.md) |
| `reference/` | stable facts injected into context | [reference/README.md](reference/README.md) |
| `rules/` | Cursor / AGENTS-style persistent editor guidance | [rules/README.md](rules/README.md) |
| `evals/` | shared promptfoo config + the skill loader + two judges | [evals/README.md](evals/README.md) |
| `scripts/` | frontmatter `check` + the eval runner | [scripts/README.md](scripts/README.md) |

Every asset carries `name`, `description`, and `status` frontmatter; `npm run check` validates it.

## Never do these

- **Don't duplicate content.** This repo is canonical. Don't fork an asset into product code — point people at it here.
- **Don't add tools here.** Tools (code that acts on live systems) live in the product that runs the agent — the codebase with the credentials and access. This repo only teaches the AI how to use them.
- **Don't let a skill reach outside its folder.** Reference data by relative path so the folder travels as a self-contained unit (the unit a consumer copies).
- **Group skills with at most one category level.** `skills/<name>/` or `skills/<category>/<name>/` — both are recognized; deeper nesting is not. A skill's `name` is its leaf folder name and must be unique across categories.
- **Don't let the [Makefile](Makefile) fall behind.** It is the task runner. Any change to how work is run here — a new script, a renamed command — updates the matching `make` target in the same PR.
- **Don't merge a skill change without an eval that shows it beats the no-skill baseline.** The gate (`scripts/gate.js`) makes this concrete: the with-skill column must clear `EVAL_MIN_QUALITY` and beat the no-skill baseline by `EVAL_MIN_MARGIN` on the neutral judge, sampled `EVAL_SAMPLES` times. `make eval` exits non-zero on a gate FAIL.

## Conventions

- **Skill name = leaf folder name.** `npm run check` enforces the match, and names must be unique across categories.
- **Skill description is the trigger** — spell out *when* to use it. Write skills for the AI (imperative, rules and routing tables, say what not to do).
- **Skills are always `SKILL.md` (uppercase).** The skill loader silently ignores lowercase `skill.md`.
- **Each skill is self-contained** — its folder is the unit someone copies into `~/.claude/skills/`. No cross-folder references.
- **Rule description is the trigger too** — Cursor uses it to decide when to attach the rule. A rule's file name is its `name`. Rules carry the foundation fields and Cursor-native keys (`globs`, `alwaysApply`) side by side.

## Add a skill

1. `skills/<name>/SKILL.md` (or `skills/<category>/<name>/SKILL.md`, always uppercase, + `README.md`) — frontmatter `name` (= leaf folder) / `description` / `status`, plus any data by relative path.
2. `promptfooconfig.yaml` proving it helps — knowledge skill: graded with vs. without the skill; tool-routing skill: checked for the right tool choice.
3. `make check` (0 errors) → `make eval` passes the gate for the new config.

## Add a reference doc

`reference/<name>.md` with frontmatter (`name` = file name, `description`, `status`) holding stable **facts** (not advice — advice is a skill or rule). No eval needed.

## Add a rule

`rules/<name>.mdc` with frontmatter (`name` = file name, `description`, `status`, optional `globs` / `alwaysApply`) and the rule body. `make check`. No eval needed.

## Commands

**The [Makefile](Makefile) is the canonical way to run anything here.** Run `make` (or `make help`) to list targets.

```bash
make            # list all targets (default)
make install    # install dependencies (once)
make check      # lint all asset frontmatter (offline, no key)
make eval       # run the skill evals + ship gate (needs provider keys in .env)
make eval-view  # results / history UI
make eval-one CONFIG=skills/<name>   # re-run one skill, before/after per model
make ci         # install + strict check
```

Evals call each model provider directly — set the provider keys you use (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, …) in `.env` (`cp .env.example .env`). Runner models live in `evals/promptfoo.base.yaml`; the two judges in `evals/judge-*.yaml`; each entry is a native promptfoo provider id (e.g. `anthropic:messages:…`).

## Before opening a PR

- `make check` passes (0 errors).
- The changed skill's eval **passes the gate** (`make eval` exits 0 — quality + margin clear the thresholds; see [evals/README.md](evals/README.md#sampling--the-ship-gate)).
- One asset per PR, with its eval in the same PR.
