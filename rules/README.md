# rules

Rules are **persistent guidance** for AI coding assistants — Cursor project rules (`.mdc`) and AGENTS-style standing instructions. Unlike a skill (loaded on demand when a task matches) a rule is attached by the editor according to its own attachment logic: always, by file glob, or when the model decides the `description` is relevant.

[code-comments.mdc](code-comments.mdc) is a complete working example — copy its shape.

## Layout

Rules are flat files in `rules/`, one rule per file:

```text
rules/<name>.mdc      # frontmatter + the rule body
```

Use `.mdc` (Cursor's format); `.md` also works. The file name is the rule's `name`.

## Frontmatter

A rule's frontmatter carries the foundation fields **and** any Cursor-native keys side by side:

| Field | Meaning |
| --- | --- |
| `name` | Must equal the file name (without extension) |
| `description` | What the rule covers and *when* it applies — Cursor uses this to decide whether to attach the rule |
| `consumers` | `cursor` — drives [ASSETS.md](../ASSETS.md) |
| `status` | `proposed` / `active` / `deprecated` |
| `globs` | *(Cursor, optional)* file patterns that auto-attach the rule, e.g. `src/**/*.ts` |
| `alwaysApply` | *(Cursor, optional)* `true` to attach the rule in every context |

`npm run check` validates the foundation fields and ignores the Cursor-native ones, so a rule stays valid in both worlds.

## Using a rule in a project

A rule here is the source of truth. To use it in a project, copy or symlink the file into that project's `.cursor/rules/` directory (or reference it from an `AGENTS.md`). Edit it here; re-sync consumers when it changes.

## What makes a good rule

1. **Make the description a precise trigger.** It is how the editor decides when to attach the rule.
2. **State standing conventions, not one-off judgment.** If it only applies to a specific task, it is a [skill](../skills/README.md).
3. **Prefer rules over essays.** Short, imperative, with explicit "never do" lines.
4. **Keep facts out.** Stable facts belong in [reference/](../reference/README.md); a rule tells the AI how to behave.

## Add a rule

1. Create `rules/<name>.mdc` with the frontmatter above and the rule body.
2. Run `npm run index` (refreshes [ASSETS.md](../ASSETS.md)) then `npm run check`.
