# Prompt Index

> **Generated file — do not edit.** Regenerate with `npm run prompts:index`
> after adding or changing a prompt. `npm run check` fails when this file is
> stale.

Arguments marked `?` are optional. The **Used in** column comes from each
prompt's `surfaces` field — keep it current; it is how anyone finds what a
change will affect.

## Completion prompts — caller supplies every input

One interpolated model call; used by features and safe to copy-paste.

| Prompt | What it does | Used in | Audience | Output | Status | Arguments |
| --- | --- | --- | --- | --- | --- | --- |
| [writing-summarize](writing/summarize/prompt.md) | Summarize a block of text faithfully, without adding facts or conclusions | Example completion prompt — the template to copy for new prompts | Anyone who needs a faithful summary of their own text | `text` | active | `content` |

## Agentic prompts — live data + tools, with a fallback ladder

Invoked from an MCP prompt picker; resolve their declared resources.

| Prompt | What it does | Used in | Audience | Output | Status | Arguments |
| --- | --- | --- | --- | --- | --- | --- |

