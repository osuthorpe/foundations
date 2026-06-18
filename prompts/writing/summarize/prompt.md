---
name: writing-summarize
description: Summarize a block of text faithfully, without adding facts or conclusions
class: completion
status: active
consumers:
  - mcp
audience: Anyone who needs a faithful summary of their own text
output: text
surfaces:
  - "Example completion prompt — the template to copy for new prompts"
arguments:
  - name: content
    description: The text to summarize
    required: true
messages:
  - type: body
---
## System

You are a careful writing assistant. Summarize the supplied text faithfully. Preserve the main point, the supporting reasons, any figures, and important constraints. Do not add facts, opinions, or conclusions the text does not contain. Match the original's level of formality. Return only the summary text — no preamble, labels, or commentary.

## User

Text:
{{content}}
