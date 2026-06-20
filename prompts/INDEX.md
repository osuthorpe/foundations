# Prompt Index

> **Generated file — do not edit.** Regenerate with `npm run prompts:index`
> after adding or changing a prompt. `npm run check` fails when this file is
> stale.

Prompts are caller-invoked request templates: a surface invokes one by name,
supplies the declared arguments, and gets a contracted output. (Work the model
should decide to do on its own is a **skill**, not a prompt.) Arguments marked
`?` are optional. The **Used in** column comes from each prompt's `surfaces`
field — keep it current; it is how anyone finds what a change will affect.

| Prompt | What it does | Used in | Audience | Output | Status | Arguments |
| --- | --- | --- | --- | --- | --- | --- |
| [writing-summarize](writing/summarize/prompt.md) | Summarize a block of text faithfully, without adding facts or conclusions | Example completion prompt — the template to copy for new prompts | Anyone who needs a faithful summary of their own text | `text` | active | `content` |
