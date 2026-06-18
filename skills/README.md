# skills

A skill is a self-contained folder of instructions written **for the AI**, plus any data those instructions need. The AI always sees the skill's one-line description and loads the full file only when the task matches. Good skills stay available everywhere without crowding every conversation.

[`commit-message/`](commit-message/SKILL.md) is a complete working example — copy its shape.

## Where skills run

Skills live in `skills/` and declare where they ship via `consumers`:

| Consumer | Reaches |
| --- | --- |
| `cc-plugin` | the Claude Code plugin (loaded from this repo's `skills/` tree) |
| `desktop-zip` | the Claude Desktop / claude.ai skill zip (`make package`) |
| `mcp` | an MCP server / agent that serves skills as resources |

The Claude Code CLI only ever scans the literal `skills/` directory and loads every `SKILL.md` it finds there — it cannot filter. So **anything in `skills/` must declare `cc-plugin`**, and `npm run check` enforces it. The `consumers` list is the machine-readable record of where each skill goes; see the generated [ASSETS.md](../ASSETS.md) for the full distribution map.

## Anatomy

```text
skills/<name>/
  SKILL.md                 # the AI instructions + frontmatter (always uppercase)
  README.md                # explanation for humans
  promptfooconfig.yaml     # the eval that proves the skill helps
  <data files>             # catalogs or indexes referenced by relative path
```

### Frontmatter

| Field | Meaning |
| --- | --- |
| `name` | Must equal the folder name |
| `description` | The trigger — *what* it does and *when* to use it (the line the AI always sees) |
| `consumers` | Where it ships: `cc-plugin`, `desktop-zip`, `mcp` (one or more) |
| `status` | `proposed` / `active` / `deprecated` |

## What makes a good skill

1. **Make the description a trigger.** It is the line the AI always sees. Say *when* to use the skill, including literal user asks when useful.
2. **Keep it self-contained.** A skill must not reach outside its folder. Put data beside the skill and reference it with relative paths.
3. **Write for the AI.** Use imperative steps, concrete rules, exact tool names, and exact field names. Use `README.md` for human explanation.
4. **Prefer rules over essays.** Checklists and routing tables are easier for the AI to follow than long exposition.
5. **Include negative rules.** "Never infer configuration from behavior" prevents failures more reliably than only describing the happy path.
6. **Keep the main file lean.** Move bulky catalogs and indexes into data files, then tell the AI how to look them up.

## Add a skill

1. Create `skills/<name>/SKILL.md` (uppercase) with the frontmatter above and any data it needs, plus a `README.md`.
2. Set `consumers` — `[cc-plugin, desktop-zip]` is the common default for an engineering skill. `npm run check` rejects a `skills/` skill that doesn't declare `cc-plugin`.
3. Add a `promptfooconfig.yaml` that proves the skill earns its place. Knowledge skills are graded with and without the skill; tool-routing skills are checked for picking the right tool and arguments. See [../evals/README.md](../evals/README.md).
4. Run `npm run index` (refreshes [ASSETS.md](../ASSETS.md)) then `npm run check`.

A good candidate is expertise you repeat: a convention you keep restating, which tool to use for a job, what makes a strong result. If you have pasted the same context into the AI twice, capture it as a skill.

## Skill vs. rule vs. reference

- A **skill** is loaded on demand when a task matches its description — judgment and procedures.
- A **rule** (`../rules/`) is persistent guidance attached by the editor (Cursor / AGENTS) — standing coding conventions.
- A **reference** (`../reference/`) is stable facts injected into context — not advice.

## Tools live elsewhere

A **tool** is code that acts on a live system, with side effects, credentials, and access boundaries, so it lives with the runtime that executes it. This repo contributes the guidance: skills that tell the AI which tool to use, when, and which to avoid. Each routing skill needs an eval that checks the decision.
