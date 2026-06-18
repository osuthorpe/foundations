# foundations

A personal, canonical home for AI assets: **prompts**, **skills**, stable **reference** facts, and editor **rules** — plus the evals that keep them honest. Everything is plain text, reviewed in git, and consumed from this repo. The structure, tooling, and testing harness are adapted from [brightideainc/foundation](https://github.com/brightideainc/foundation).

## One-minute version

- **Knowledge as code.** Assets are plain text in git and change by PR.
- **Skills teach; prompts ask; rules govern; reference states facts.** A **skill** teaches the AI judgment and loads when a task matches. A **prompt** is a named request template a surface fills with arguments. A **rule** is standing editor guidance (Cursor / AGENTS). A **reference doc** is stable facts injected into context.
- **Tools live with runtimes.** Code that reads or changes live systems belongs in the consuming runtime. This repo supplies the guidance.
- **Evals are required.** A prompt or skill ships only when its eval shows a clear improvement over the baseline.

## Repo map

| Folder | Purpose |
| --- | --- |
| [`prompts/`](prompts/) | Named request templates. See [prompts/README.md](prompts/README.md). |
| [`skills/`](skills/) | Playbooks loaded by the Claude Code plugin / Desktop zip / MCP. See [skills/README.md](skills/README.md). |
| [`reference/`](reference/) | Stable facts injected into AI context. See [reference/README.md](reference/README.md). |
| [`rules/`](rules/) | Cursor / AGENTS-style persistent editor guidance. See [rules/README.md](rules/README.md). |
| [`evals/`](evals/) | Shared promptfoo configuration, loaders, judges, and helpers. See [evals/README.md](evals/README.md). |
| [`scripts/`](scripts/) | Repo maintenance scripts for indexing and checks. See [scripts/README.md](scripts/README.md). |
| [`gateway/`](gateway/) | Local LiteLLM gateway for running evals. See [gateway/README.md](gateway/README.md). |
| [`ASSETS.md`](ASSETS.md) | Generated map of every asset by its distribution target (`consumers`). |

Where each asset goes is declared in its frontmatter `consumers` list and validated by `npm run check`; [ASSETS.md](ASSETS.md) is the generated view of it.

## Choose the asset

| Need | Build |
| --- | --- |
| The AI needs judgment, a procedure, or gotchas, loaded on demand | A **skill** in [skills/](skills/) |
| A surface needs the same structured request again and again | A **prompt** in [prompts/](prompts/) |
| The AI needs a stable fact set, catalog, or quirk list | A **reference doc** in [reference/](reference/) |
| The editor should always (or by-glob) follow a standing convention | A **rule** in [rules/](rules/) |
| The AI must read or change live data | A **tool** in the consuming runtime, not here |

Rule of thumb: wrong or generic answer → skill; repeated request shape → prompt; standing editor convention → rule; stable fact → reference. If you have pasted the same context into the AI twice, it probably belongs here.

## Use foundations

**Claude Code.** Treat this repo as a plugin marketplace:

```text
/plugin marketplace add osuthorpe/foundations
/plugin install foundations@osuthorpe-foundations
```

Restart Claude Code. The plugin loads the skills in [`skills/`](skills/); they activate themselves when a task matches. Update with `/plugin marketplace update osuthorpe-foundations`.

**Claude Desktop / claude.ai.** Build the skill zip and upload it under **Settings → Capabilities → Skills → Upload skill**:

```sh
make package   # writes dist/<skill>.zip for every skill with consumer desktop-zip
```

**Cursor / AGENTS.** Copy or symlink a file from [`rules/`](rules/) into a project's `.cursor/rules/` (or reference it from an `AGENTS.md`). Edit the rule here; re-sync when it changes.

**Other runtimes.** Pin this repo (commit or tag) and read `prompts/`, `skills/`, and `reference/` directly. See [prompts/README.md](prompts/README.md) for the prompt loading contract.

## Work here

- Run `npm install` once. The [Makefile](Makefile) is the task runner — run `make` to list targets.
- Use `make check` to lint every asset's frontmatter and the generated files (`prompts/INDEX.md`, `ASSETS.md`) offline; `make index` regenerates them.
- Use `make eval` for promptfoo evals. Gateway setup is documented in [evals/README.md](evals/README.md).
- Keep PRs to one asset and include its eval.
