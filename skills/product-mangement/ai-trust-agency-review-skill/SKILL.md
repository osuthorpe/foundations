---
name: ai-trust-agency-review
description: Review AI product ideas, PRDs, feature specs, launch plans, agent workflows, trust claims, or blog drafts for user agency, control, proof, recourse, displacement risk, autonomy level, failure handling, and trust release readiness. Use when the user asks for an AI trust review, agency review, release gate, product critique, PRD critique, or whether an AI feature should ship.
---

# AI Trust Agency Review

## Purpose

Use this skill to review AI product work through the trust and agency framework from "People Don't Fear AI. They Fear Losing Agency."

## Core Standard

An AI feature earns trust when users keep meaningful control, can see enough evidence to understand important outputs, and have a practical recovery path when the system gets something wrong.

The goal is appropriate trust, not maximum trust. Users should rely on AI when it is strong, question it when evidence is weak, and remain in control when the stakes are high.

## Review Workflow

When applying this skill:

1. Identify the AI feature, user, affected non-user, workflow, and stakes.
2. Name the user's likely fear directly. Do not reduce it to "privacy concerns" or "trust issues."
3. Classify the feature as augmenting, replacing, managing, extracting, or a mix.
4. Map the autonomy level:
   - Level 1: AI retrieves or summarizes information.
   - Level 2: AI drafts something for human review.
   - Level 3: AI recommends a decision.
   - Level 4: AI executes an approved action.
   - Level 5: AI acts without prior human approval.
   - Then apply the reversibility test: scale the required control, proof, and recourse to how hard a wrong action is to undo and how wide its blast radius, not to how impressive the feature looks.
5. Check whether the user keeps control over entry, scope, memory, approval, rejection, undo, escalation, and shutdown.
6. Check whether the product provides proof: sources, evidence, confidence, limitations, logs, or visible reasoning appropriate to the risk.
7. Check whether recourse exists: correction, appeal, escalation, recovery, reopening, or human review.
8. Identify hidden work created by the AI: review burden, cleanup, exception handling, audit work, prompt management, support load, or loss of tacit knowledge.
9. Decide whether the feature deserves the reliance the interface invites.
10. Recommend the smallest product change that would materially improve agency or trust.

## Output Format

Lead with the product judgment. Avoid generic praise.

```markdown
## Trust Judgment
[One direct paragraph. State whether the feature is ready, risky but fixable, or not ready to ship.]

## Main Risks
- [Risk grounded in user agency, control, proof, recourse, displacement, autonomy, or accountability.]
- [Risk grounded in specific product behavior.]

## Required Changes
- [Concrete product, design, technical, or operating change.]
- [Concrete release gate or measurement requirement.]

## Agency Brief
Feature:
Autonomy level:
Who uses it:
Who is affected by it:
Likely user fear:
Human authority:
Control:
Proof:
Recourse:
Release condition:
```

## Review Standards

Treat these as blockers for high-stakes AI features:

- The AI can affect money, access, employment, healthcare, education, legal rights, customer commitments, reputation, or safety without explicit human authority.
- The product hides a move up the autonomy ladder.
- Users cannot inspect or correct important outputs before they matter.
- Users cannot reject, disable, or escalate without penalty.
- The system gives factual, financial, medical, legal, or customer-impacting answers without grounded evidence or a recovery path.
- A wrong action is irreversible and the user has no undo, recovery, or human appeal.
- The company captures productivity benefits while pushing verification, cleanup, and blame onto the user.
- Marketing claims imply reliability, autonomy, or safety that product behavior does not support.

## Writing And Blog Use

When reviewing AI product writing, use this framework to sharpen the argument toward product behavior: consent, permissions, controls, evals, release gates, ownership, metrics, recourse, and tradeoffs.

Do not turn every review into a full workbook. Use the smallest version that helps the user decide what to build, cut, measure, launch, or refuse.
