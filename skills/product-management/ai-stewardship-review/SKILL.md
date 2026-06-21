---
name: ai-stewardship-review
description: Govern an AI change at the release gate — classify the risk tier, weigh broader harms (power concentration, access and exclusion, dependency, manipulation), and decide proceed / proceed with changes / do not proceed against the project's stewardship docs. Use when the user asks whether an AI change is safe to ship, for an AI stewardship or governance review, a risk-tier classification, or a release-gate decision.
status: proposed
---

# AI Stewardship Review

This is the governance and release-gate lens. Classify the project risk tier first.

## Related Skills

This is one of three complementary product-management lenses. Reach for the others when the question shifts:

- `ai-design-review` — how to build the feature well: where AI belongs versus deterministic logic, explainability, evaluation, and failure recovery.
- `ai-agency-review` — the user-agency and trust critique: control, proof, recourse, autonomy, and displacement.

Use this skill for the ship / do-not-ship decision and broader stewardship. Defer detailed build questions to `ai-design-review` and detailed user-agency questions to `ai-agency-review`.

## Read, when available

- ai-stewardship.md
- soul.md
- docs/risk-tier.md
- docs/intent.md
- docs/boundaries.md
- docs/data.md
- docs/evals.md
- docs/failure-modes.md
- docs/decisions.md
- docs/risks.md
- docs/recourse.md
- docs/release-review.md
- docs/incidents.md

## Review the change for

- human agency
- truth, provenance, and uncertainty
- work, skill, and judgment
- data minimization and purpose limits
- hidden autonomy
- dependency or manipulation
- concentration of power
- access and exclusion
- observable failure and recovery
- contestability and recourse
- release evidence

## Return

1. Risk tier
2. Decision: proceed, proceed with changes, or do not proceed
3. Main risks
4. Required changes
5. Missing evidence
6. Evals to add
7. Docs to update
8. Release gate recommendation

## Guardrails

Do not accept "human in the loop" as sufficient unless the human has context, authority, time, and a real ability to change the outcome.

Do not approve consequential AI behavior without evals, logging, recourse, and a rollback path.
