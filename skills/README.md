# skills

A skill is a self-contained folder of instructions written **for the AI**, plus any data those instructions need. The AI always sees the skill's one-line description and loads the full file only when the task matches. Good skills stay available everywhere without crowding every conversation.

[`commit-message/`](commit-message/SKILL.md) is a complete working example — copy its shape.

## How skills are used

Skills are taken **à la carte** — grab the one you want, not the whole repo:

- **Claude Code:** copy the skill's folder into `~/.claude/skills/<name>/` (personal) or `.claude/skills/<name>/` (a project). It self-activates when a task matches its description.
- **Claude Desktop / claude.ai:** zip the skill's folder and upload it under Settings → Capabilities → Skills.

Each skill is self-contained, so its folder is the unit you copy.

## Anatomy

Skills may be **grouped into a category** one level deep to keep the tree navigable. Both layouts are valid; a skill's `name` is always its **leaf** folder name (the category is organizational only):

```text
skills/<name>/                       # flat
skills/<category>/<name>/            # grouped (e.g. product-management/ai-trust-agency-review)
  SKILL.md                 # the AI instructions + frontmatter (always uppercase)
  README.md                # explanation for humans
  promptfooconfig.yaml     # the eval that proves the skill helps
  <data files>             # catalogs or indexes referenced by relative path
```

### Frontmatter

| Field | Meaning |
| --- | --- |
| `name` | Must equal the **leaf** folder name; unique across categories |
| `description` | The trigger — *what* it does and *when* to use it (the line the AI always sees) |
| `status` | `proposed` / `active` / `deprecated` |

## What makes a good skill

1. **Make the description a trigger.** It is the line the AI always sees. Say *when* to use the skill, including literal user asks when useful.
2. **Keep it self-contained.** A skill must not reach outside its folder. Put data beside the skill and reference it with relative paths.
3. **Write for the AI.** Use imperative steps, concrete rules, exact tool names, and exact field names. Use `README.md` for human explanation.
4. **Prefer rules over essays.** Checklists and routing tables are easier for the AI to follow than long exposition.
5. **Include negative rules.** "Never infer configuration from behavior" prevents failures more reliably than only describing the happy path.
6. **Keep the main file lean.** Move bulky catalogs and indexes into data files, then tell the AI how to look them up.

## Add a skill

1. Create `skills/<name>/SKILL.md` (or `skills/<category>/<name>/SKILL.md`, uppercase) with the frontmatter above and any data it needs, plus a `README.md`.
2. Add a `promptfooconfig.yaml` that proves the skill earns its place. Knowledge skills are graded with and without the skill; tool-routing skills are checked for picking the right tool and arguments. See [../evals/README.md](../evals/README.md). (A grouped skill sits one level deeper, so its config references shared eval files as `file://../../../evals/...`.)
3. Run `npm run check`.

A good candidate is expertise you repeat: a convention you keep restating, which tool to use for a job, what makes a strong result. If you have pasted the same context into the AI twice, capture it as a skill.

## Skill vs. rule vs. reference

- A **skill** is loaded on demand when a task matches its description — judgment and procedures.
- A **rule** (`../rules/`) is persistent guidance attached by the editor (Cursor / AGENTS) — standing coding conventions.
- A **reference** (`../reference/`) is stable facts injected into context — not advice.

## Tools live elsewhere

A **tool** is code that acts on a live system, with side effects, credentials, and access boundaries, so it lives with the runtime that executes it. This repo contributes the guidance: skills that tell the AI which tool to use, when, and which to avoid. Each routing skill needs an eval that checks the decision.
