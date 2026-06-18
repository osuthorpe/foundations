# prompts

Prompts are reusable request templates. A caller invokes a prompt **by name**, passes declared arguments, and receives a consistent result with a known output contract.

[INDEX.md](INDEX.md) is generated from prompt frontmatter. It lists each prompt's purpose, surfaces, status, and output contract. Regenerate it with `npm run index`; `npm run check` fails when the index is stale. For the cross-asset distribution view (every prompt, skill, reference doc, and rule by consumer), see [ASSETS.md](../ASSETS.md).

## Layout and naming

Prompts live two levels deep, grouped by area:

```text
prompts/<area>/<name>/
  prompt.md            # frontmatter + template body
  promptfooconfig.yaml # the eval (see ../evals/README.md)
  rubric.txt           # grading criteria for good output
  schema.json          # the JSON output contract, when output: json
```

Areas are yours to define — group by domain (e.g. `writing/`, `code/`, `research/`). Keep them stable once callers depend on a name.

The frontmatter **`name` is the folder path joined with `-`**. For example, `prompts/writing/summarize/` must declare `name: writing-summarize`. That name is the stable ID callers invoke, and `npm run check` enforces the match.

[`writing/summarize/`](writing/summarize/prompt.md) is a complete working example — copy its shape.

## Frontmatter

| Field | Meaning |
| --- | --- |
| `name` | Stable invoke ID: the folder path joined with `-` |
| `description` | What the prompt does, one line |
| `class` | `completion` or `agentic` (below) |
| `status` | `proposed` / `active` / `deprecated` |
| `consumers` | Which runtimes serve it: `mcp` (prompt picker). Drives [ASSETS.md](../ASSETS.md) |
| `audience` | Who experiences the output |
| `surfaces` | Where it is invoked; this is the blast radius of a change |
| `output` | `text`, `json` (pair with `schema.json`), or `image-prompt` |
| `arguments` | The call signature; every `{{placeholder}}` must be declared |
| `requires` | Model capabilities needed (`image-generation`, `tool-use`, `vision`) |

## Prompt classes

- **`completion`**: the caller supplies every input as an argument. The runtime makes one model call and expects one output. Most prompts are completion prompts.
- **`agentic`**: the prompt needs live resources or tools. Its body must include a fallback ladder: use context first, fetch with tools if available, then ask the user to paste the missing data. Never proceed from an ID alone.

Completion prompts may still pull in a **skill** (a `skill://<name>` resource), because a skill resolves to a repo file wherever the prompt runs. Use that to share criteria across prompts instead of repeating them.

## Model-agnostic by design

A prompt cannot assume one provider or one structured-output mechanism.

1. **Roles are explicit.** `## System` and `## User` headings split the body into channels. A body with no headings becomes a single user message, which is common for image and agentic prompts. Loaders map those sections to the provider's equivalent channels.
2. **JSON contracts travel in the prompt.** When a prompt has a `schema.json`, the built-in `{{schema}}` placeholder inlines it. Loaders with native structured output can also pass the file directly.
3. **Capabilities replace model names.** If a prompt needs a non-universal capability, declare it in `requires:` and let the router check the model.

## Loading contract

A consuming runtime loads a prompt the same way wherever it runs:

1. **Load by name.** Resolve to `prompts/<area>/<name>/prompt.md` by splitting the name on its first `-`, or by indexing the tree by frontmatter `name`. Reject unknown names.
2. **Honor `class`.** Single-shot paths must reject `agentic` prompts.
3. **Validate arguments.** Require every `required` argument, substitute `{{placeholders}}`, and fill `{{schema}}` from `schema.json`.
4. **Map roles.** Map `## System` to the provider's system channel and `## User` to the user message.
5. **Resolve resources.** A `skill://<name>` resource is a repo file read; data resources are owned by the surface.
6. **Enforce `output`.** Parse and validate `json`; return `text` verbatim.

The `name` and `arguments` are a **contract**: renaming a prompt or adding a required argument breaks callers. Add arguments as optional. For renames, ship the new name, migrate callers, then remove the old name in a major release.

## Add a prompt

1. Create `prompts/<area>/<name>/prompt.md` with the frontmatter above and a body that ends in its output contract, such as "Return only the corrected text" or "Return only JSON conforming to the schema."
2. Write `rubric.txt` at the same time. If the grading criteria are unclear, the prompt is not ready. Add `schema.json` for `json` output.
3. Add a `promptfooconfig.yaml` (copy a sibling) — see [../evals/README.md](../evals/README.md).
4. Run `npm run index`, then `npm run check`, then the prompt's eval.
