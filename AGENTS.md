# AGENTS.md

Operating guide for AI agents working in **foundations** — a personal canonical repo of AI assets (prompts, skills, reference docs, editor rules) and their evals. Everything is plain text, versioned in git, changed by PR. This is the single source of truth.

Human docs live in each folder's `README.md` (start at [README.md](README.md)). This file is the short operational version — what to do, and what never to do.

## Repo map

| Path | Holds | Guide |
| --- | --- | --- |
| `prompts/<area>/<name>/` | request templates callers invoke by name | [prompts/README.md](prompts/README.md) |
| `skills/[<category>/]<name>/` | playbooks taken à la carte (Claude Code / Desktop / MCP) | [skills/README.md](skills/README.md) |
| `reference/` | stable facts injected into context | [reference/README.md](reference/README.md) |
| `rules/` | Cursor / AGENTS-style persistent editor guidance | [rules/README.md](rules/README.md) |
| `evals/` | shared promptfoo config + prompt loader | [evals/README.md](evals/README.md) |
| `scripts/` | `index` / `check` tooling | [scripts/README.md](scripts/README.md) |
| `ASSETS.md` | generated distribution map (every asset × consumer) | — |

**Where an asset goes is declared, not implied.** Every asset carries a `consumers` frontmatter list (the closed set of runtimes that package or serve it): skills use `desktop-zip` / `mcp`, prompts use `mcp`, reference uses `context-injection`, rules use `cursor`. `npm run check` validates it and keeps `ASSETS.md` in sync.

## Never do these

- **Don't duplicate content.** This repo is canonical. Never copy a prompt or skill into another repo or into product code — consumers read it here.
- **Don't hand-edit generated files.** `prompts/INDEX.md` and `ASSETS.md` are built by `npm run index`; `dist/` is a build artifact.
- **Skills are consumed à la carte, not as a bundle.** There is no plugin that loads the whole tree; a consumer copies the one skill folder they want into `~/.claude/skills/` (or builds its Desktop zip). Keep each skill self-contained so its folder travels alone.
- **Don't rename or remove a shipped prompt in place.** `name` and `arguments` are a consumer contract. Add the new name, migrate callers, drop the old one in a later major. New arguments must be optional.
- **Don't add tools here.** Tools (code that acts on live systems) live in the product that runs the agent — the codebase with the credentials and access. This repo only teaches the AI how to use them.
- **Don't let the [Makefile](Makefile) fall behind.** It is the de facto task runner. Any core change to how work is run here — a new script, a renamed npm command, a new build/generation/test step — must add or update the matching `make` target in the same PR.
- **Don't let a skill reach outside its folder.** Reference data by relative path so the folder travels as a unit.
- **Group skills with at most one category level.** `skills/<name>/` or `skills/<category>/<name>/` — both are recognized; deeper nesting is not. A skill's `name` is its leaf folder name and must be unique across categories.
- **Don't merge a prompt or skill without an eval that shows it beats a baseline.** The eval gate (`scripts/gate.js`) makes this concrete: the foundation column must clear `EVAL_MIN_QUALITY` and beat its strongest baseline by `EVAL_MIN_MARGIN` on the neutral judge, sampled `EVAL_SAMPLES` times. `make eval` exits non-zero on a gate FAIL.

## Conventions

- **Prompt name = folder path joined with `-`.** `prompts/writing/summarize/` → `name: writing-summarize`. `npm run check` enforces the match.
- **Prompt vs skill.** Build a **prompt** only when a non-conversational caller invokes it by name, with arguments, and depends on its output shape (a typed, testable contract). If the model should *decide on its own* to apply judgment, a procedure, or tools, that's a **skill**. Prompts are caller-invoked functions; skills self-activate.
- **Prompt class.** `completion` is the only class: caller supplies every input, one model call, one output. (Agentic / tool-using work is a skill, not a prompt.)
- **Model-agnostic.** Never name a model. Split the body with `## System` / `## User`; inline JSON contracts via the `{{schema}}` placeholder (filled from `schema.json`); declare needed capabilities in `requires:`.
- **Output contract.** End a prompt body with it ("Return only the corrected text" / "Return only JSON conforming to the schema").
- **Skill description is the trigger** — spell out *when* to use it. Write skills for the AI (imperative, rules and routing tables, say what not to do).
- **Skills are always `SKILL.md` (uppercase).** The skill loader silently ignores lowercase `skill.md`. `consumers` records where it ships (`desktop-zip` / `mcp`).
- **Rule description is the trigger too** — Cursor uses it to decide when to attach the rule. A rule's file name is its `name`. Rules carry foundation fields and Cursor-native keys (`globs`, `alwaysApply`) side by side.

## Add a prompt

1. `prompts/<area>/<name>/prompt.md` — frontmatter (`name` = `<area>-<name>`, `description`, `class`, `status`, `consumers: [mcp]`, `audience`, `surfaces`, `output`, `arguments`) + body ending in its output contract.
2. `rubric.txt` (write it with the prompt) and, for `output: json`, `schema.json`.
3. `promptfooconfig.yaml` — copy a sibling, point `promptPath` at the new file, set the `baseline`/`legacy` variants and the test `vars`. See [evals/README.md](evals/README.md).
4. `make index` → `make check` (must be 0 errors) → have `make eval` pass for the new config.

## Add a skill

1. `skills/<name>/SKILL.md` (or `skills/<category>/<name>/SKILL.md`, always uppercase, + `README.md`) — with `name` (= leaf folder) / `description` / `consumers` / `status` frontmatter and any data by relative path.
2. Set `consumers` (e.g. `[desktop-zip]`; add `mcp` if an agent serves it).
3. `promptfooconfig.yaml` proving it helps — knowledge skill: graded with vs. without the skill; tool-routing skill: checked for the right tool choice.
4. `make index` → `make check` → `make eval` for the config.

## Add a reference doc

`reference/<name>.md` with frontmatter (`name` = file name, `description`, `consumers: [context-injection]`, `status`) holding stable **facts** (not advice — advice is a skill or rule). No eval needed.

## Add a rule

`rules/<name>.mdc` with frontmatter (`name` = file name, `description`, `consumers: [cursor]`, `status`, optional `globs` / `alwaysApply`) and the rule body. `make index` → `make check`. No eval needed.

## Commands

**The [Makefile](Makefile) is the canonical way to run anything in this repo.** Reach for `make <target>` first; run `make` (or `make help`) to list targets.

```bash
make            # list all targets (default)
make install    # install dependencies (once)
make check      # lint all asset frontmatter + verify INDEX/ASSETS are fresh (offline, no key)
make index      # regenerate prompts/INDEX.md and ASSETS.md
make fix        # regenerate, then check
make eval       # run promptfoo evals (needs provider keys in .env)
make eval-view  # results / history UI
make package    # build the Claude Desktop / claude.ai skill zips into dist/
make clean      # remove dist/
make ci         # what CI runs: install + strict check
```

One-offs not wrapped by the Makefile:

```bash
npx promptfoo validate config -c <path>   # check one config parses
npx promptfoo eval -c <path>              # run one asset's eval
```

Evals call each model provider directly — set the provider keys you use (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, …) in `.env` (`cp .env.example .env`). Runner models live in `evals/promptfoo.base.yaml`; the two judges in `evals/judge-*.yaml`; each entry is a native promptfoo provider id (e.g. `anthropic:messages:…`).

## Before opening a PR

- `make check` passes (0 errors).
- `make index` leaves `prompts/INDEX.md` and `ASSETS.md` unchanged (i.e. they're fresh).
- The new/changed prompt or skill's eval **passes the gate** (`make eval` exits 0 — quality + margin clear the thresholds; see [evals/README.md](evals/README.md#sampling--the-ship-gate)).
- One asset per PR, with its eval in the same PR.
