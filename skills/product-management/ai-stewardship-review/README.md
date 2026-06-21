# AI Stewardship Review Skill

A downloadable Cursor skill that governs an AI change at the release gate: it classifies the risk tier, weighs broader harms (power concentration, access and exclusion, dependency, manipulation), and returns a proceed / proceed-with-changes / do-not-proceed decision.

It reads the host project's stewardship docs when present (`ai-stewardship.md`, `soul.md`, and the `docs/` set) and names the concrete evidence, evals, and release gate the change still needs.

This is one of three complementary product-management skills:

- **`ai-design-review`** — how to build the feature well (design and architecture craft).
- **`ai-agency-review`** — whether users keep agency and will trust it.
- **`ai-stewardship-review`** (this skill) — whether it should ship (governance and the release gate).

## Install

Copy this folder into a Cursor skills directory:

```txt
~/.cursor/skills/ai-stewardship-review/
```

For a project-specific install, copy it into:

```txt
.cursor/skills/ai-stewardship-review/
```

## Use

Ask Cursor to apply the `ai-stewardship-review` skill to a change before it ships.

Example prompts:

```txt
Run an AI stewardship review on this change.
```

```txt
What risk tier is this AI feature, and is it safe to ship?
```

```txt
Review this prompt and data change against our stewardship docs and recommend a release gate.
```
