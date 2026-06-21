# foundations

A personal, canonical home for AI assets: **skills**, stable **reference** facts, and editor **rules** — plus the evals that keep them honest. Everything is plain text, reviewed in git, and taken à la carte: grab the one asset you want, not the whole repo.

## One-minute version

- **Knowledge as code.** Assets are plain text in git and change by PR.
- **Skills teach; rules govern; reference states facts.** A **skill** teaches the AI judgment and loads when a task matches. A **rule** is standing editor guidance (Cursor / AGENTS). A **reference doc** is stable facts injected into context.
- **Tools live with runtimes.** Code that reads or changes live systems belongs in the consuming runtime. This repo supplies the guidance.
- **Evals prove it.** A skill ships only when its eval shows a clear improvement over the no-skill baseline — so a change is *measurably* better, not just different.

## Repo map

| Folder | Purpose |
| --- | --- |
| [`skills/`](skills/) | Playbooks you take à la carte into Claude Code / Desktop. See [skills/README.md](skills/README.md). |
| [`reference/`](reference/) | Stable facts injected into AI context. See [reference/README.md](reference/README.md). |
| [`rules/`](rules/) | Cursor / AGENTS-style persistent editor guidance. See [rules/README.md](rules/README.md). |
| [`evals/`](evals/) | Shared promptfoo configuration, the skill loader, and the two judges. See [evals/README.md](evals/README.md). |
| [`scripts/`](scripts/) | Frontmatter linter + eval runner. See [scripts/README.md](scripts/README.md). |

## Choose the asset

| Need | Build |
| --- | --- |
| The AI needs judgment, a procedure, or gotchas, loaded on demand | A **skill** in [skills/](skills/) |
| The AI needs a stable fact set, catalog, or quirk list | A **reference doc** in [reference/](reference/) |
| The editor should always (or by-glob) follow a standing convention | A **rule** in [rules/](rules/) |
| The AI must read or change live data | A **tool** in the consuming runtime, not here |

Rule of thumb: wrong or generic answer → skill; standing editor convention → rule; stable fact → reference. If you have pasted the same context into the AI twice, it probably belongs here.

## Use a skill (or rule)

Take only what you want — nothing here is all-or-nothing.

**Claude Code.** Copy a skill's folder into your personal or project skills directory; it self-activates when a task matches its description:

```sh
cp -R skills/commit-message ~/.claude/skills/                          # personal (all projects)
cp -R skills/product-management/ai-agency-review .claude/skills/  # one project
```

(Skills are grouped into `skills/<category>/<name>/` here for browsing — copy just the leaf skill folder.)

**Claude Desktop / claude.ai.** Zip a skill's folder and upload it under **Settings → Capabilities → Skills → Upload skill**.

**Cursor / AGENTS.** Copy or symlink a file from [`rules/`](rules/) into a project's `.cursor/rules/` (or reference it from an `AGENTS.md`). Edit the rule here; re-sync when it changes.

## Work here

- Run `npm install` once. The [Makefile](Makefile) is the task runner — run `make` to list targets.
- `make check` lints every asset's frontmatter (offline, no key).
- `make eval` runs the skill evals — it calls each model provider directly using the API keys in `.env`. Set them up per [evals/README.md](evals/README.md).
- Keep PRs to one asset and include its eval.

## License

[MIT](LICENSE) — use, adapt, and redistribute these skills, rules, and reference docs freely, including commercially. Attribution is appreciated but not required.
