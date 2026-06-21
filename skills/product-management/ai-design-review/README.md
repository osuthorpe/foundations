# AI Design Review Skill

A downloadable Cursor skill that turns human-centered AI principles into concrete design and architecture decisions for AI features, LLM workflows, agents, RAG systems, classifiers, ranking, and automation.

It applies ten design principles as a build lens — explainability, predictability, clarity over capability, bounded scope, continuous evaluation, real user expectations, observable and recoverable failure, meaningful control, careful iteration, and documented decisions — and maps which steps belong to deterministic logic, AI, or human judgment.

This is one of three complementary product-management skills:

- **`ai-design-review`** (this skill) — how to build the feature well (design and architecture craft).
- **`ai-agency-review`** — whether users keep agency and will trust it.
- **`ai-stewardship-review`** — whether it should ship (governance and the release gate).

## Install

Copy this folder into a Cursor skills directory:

```txt
~/.cursor/skills/ai-design-review/
```

For a project-specific install, copy it into:

```txt
.cursor/skills/ai-design-review/
```

## Use

Ask Cursor to apply the `ai-design-review` skill when designing or reviewing how an AI feature should be built.

Example prompts:

```txt
Review this AI feature spec with the AI design review skill.
```

```txt
Where should this workflow use deterministic logic versus the model?
```

```txt
Diagnose why users distrust this AI feature and recommend product changes.
```
