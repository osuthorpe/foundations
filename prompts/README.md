# prompts

Prompts are reusable request templates. A caller invokes a prompt **by name**, passes declared arguments, and receives a consistent result with a known output contract.

> **Prompt or skill?** Create a prompt only when *a non-conversational caller (a feature, an MCP client, a batch job) invokes it by name, with arguments, and depends on its output shape.* If instead you want the model to *decide on its own* to apply some judgment or procedure, that's a [skill](../skills/), not a prompt. Prompts are typed functions; skills are the assistant's instincts.

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
| `class` | `completion` (the only class — see below) |
| `status` | `proposed` / `active` / `deprecated` |
| `consumers` | Which runtimes serve it: `mcp` (prompt picker). Drives [ASSETS.md](../ASSETS.md) |
| `audience` | Who experiences the output |
| `surfaces` | Where it is invoked; this is the blast radius of a change |
| `output` | `text`, `json` (pair with `schema.json`), or `image-prompt` |
| `arguments` | The call signature; every `{{placeholder}}` must be declared |
| `requires` | Model capabilities needed (`image-generation`, `tool-use`, `vision`) |

## Prompt class

- **`completion`** is the only class: the caller supplies every input as an argument, the runtime makes one model call, and expects one output. This is what makes a prompt a stable, testable contract.

Anything that needs live resources, tools, or the model's own judgment about *when* to act is a **skill**, not a prompt — skills self-activate and can carry that procedure. (A completion prompt may still pull in a skill via a `skill://<name>` resource to share criteria, since a skill resolves to a repo file wherever the prompt runs.)

## Model-agnostic by design

A prompt cannot assume one provider or one structured-output mechanism.

1. **Roles are explicit.** `## System` and `## User` headings split the body into channels. A body with no headings becomes a single user message (common for image prompts). Loaders map those sections to the provider's equivalent channels.
2. **JSON contracts travel in the prompt.** When a prompt has a `schema.json`, the built-in `{{schema}}` placeholder inlines it. Loaders with native structured output can also pass the file directly.
3. **Capabilities replace model names.** If a prompt needs a non-universal capability, declare it in `requires:` and let the router check the model.

## Loading contract

A consuming runtime loads a prompt the same way wherever it runs:

1. **Load by name.** Resolve to `prompts/<area>/<name>/prompt.md` by splitting the name on its first `-`, or by indexing the tree by frontmatter `name`. Reject unknown names.
2. **Validate arguments.** Require every `required` argument, substitute `{{placeholders}}`, and fill `{{schema}}` from `schema.json`.
3. **Map roles.** Map `## System` to the provider's system channel and `## User` to the user message.
4. **Resolve resources.** A `skill://<name>` resource is a repo file read; data resources are owned by the surface.
5. **Enforce `output`.** Parse and validate `json`; return `text` verbatim.

The `name` and `arguments` are a **contract**: renaming a prompt or adding a required argument breaks callers. Add arguments as optional. For renames, ship the new name, migrate callers, then remove the old name in a major release.

## Add a prompt

1. Create `prompts/<area>/<name>/prompt.md` with the frontmatter above and a body that ends in its output contract, such as "Return only the corrected text" or "Return only JSON conforming to the schema."
2. Write `rubric.txt` at the same time. If the grading criteria are unclear, the prompt is not ready. Add `schema.json` for `json` output.
3. Add a `promptfooconfig.yaml` (copy a sibling) — see [../evals/README.md](../evals/README.md).
4. Run `npm run index`, then `npm run check`, then the prompt's eval.
