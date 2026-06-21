---
name: ai-design-review
description: Apply human-centered design principles to an AI feature during design and architecture — where AI belongs versus deterministic logic, explainability, bounded scope, evaluation levels, failure recovery, and decision records. Use when designing, architecting, or critiquing how an AI feature, LLM workflow, agent, RAG system, classifier, ranking system, or automation should be built.
status: proposed
---

# AI Design Review

## Purpose

Use this skill to help build AI products that people can understand, predict, correct, and trust.

This is a product-development skill, not an ethics manifesto. It translates human-centered AI principles into concrete product decisions: what the system should do, what it should never do, how users should experience it, how teams should evaluate it, and how decisions should be documented.

Apply this skill when the work involves LLM features, AI agents, RAG systems, classifiers, ranking systems, summarization, scoring, recommendations, automated routing, data extraction, or any workflow where AI output affects user decisions or downstream action.

## Related Skills

This is one of three complementary product-management lenses. Reach for the others when the question shifts:

- `ai-agency-review` — pressure-test the design from the user's point of view: control, proof, recourse, autonomy, and displacement.
- `ai-stewardship-review` — the ship / do-not-ship governance call at the release gate, including broader harms and project stewardship docs.

Use this skill to decide how the feature should be built. It is the build guide, not the user-trust critique or the governance gate.

## Core stance

A good AI product reduces surprise. It makes the system’s role clear, defines boundaries, exposes relevant reasoning signals, gives users meaningful control, evaluates behavior continuously, and treats failures as discoverable product defects.

Favor systems that are understandable, bounded, recoverable, and maintainable over systems that are more capable but opaque, brittle, or hard for users to reason about.

## Activation triggers

Use this skill when the user asks to:

- Create or review an AI product spec, PRD, strategy, UX flow, launch plan, or roadmap.
- Decide where to use deterministic logic versus model-driven behavior.
- Design an AI agent, copilot, assistant, evaluator, classifier, recommender, RAG workflow, or automation.
- Improve trust, transparency, explainability, safety, governance, reliability, or adoption of an AI feature.
- Diagnose why users dislike, distrust, ignore, or resist an AI product.
- Build an evaluation, monitoring, rollout, or failure-recovery plan for AI behavior.
- Write product guidance for AI PMs, engineers, designers, researchers, or executives.

Do not force a long principles audit for small writing or phrasing tasks. Apply the lens silently unless the user is asking for product critique, system design, or structured evaluation.

## Working method

Before answering, identify the system being discussed:

1. The user or persona affected.
2. The AI capability being proposed.
3. The input, output, and downstream action.
4. The boundary between deterministic behavior and probabilistic behavior.
5. The main trust, safety, accuracy, or adoption risk.
6. The failure mode that would most damage user confidence.

Then apply the principles below as a review lens.

## The ten principles

### 1. Make systems explainable

Users need a usable mental model of why the system produced an output. Expose the key factors, constraints, sources, assumptions, confidence signals, or limitations that shaped the result. Do not confuse explainability with exposing raw model internals. The goal is practical intelligibility.

Ask:

- What should the user know about why this happened?
- Which inputs, rules, sources, or constraints shaped the output?
- What limitation would change how the user interprets the result?

### 2. Reduce the surface area for surprise

AI behavior should feel stable and expected. Avoid unnecessary randomness, hidden state, unexplained changes, or behavior that varies without a clear reason. Users should be able to predict what the system is likely to do next.

Ask:

- What could surprise the user?
- Does the system behave consistently across similar cases?
- Does the product explain meaningful changes in behavior?

### 3. Favor clarity over capability

A narrower, clearer workflow often beats a broader, more capable one that users cannot understand or teams cannot maintain. Avoid adding model autonomy only because it is technically possible.

Ask:

- Can a simpler workflow solve the user problem?
- Is the more capable version harder to explain, test, or recover from?
- Would users prefer a reliable partial capability over an impressive but inconsistent one?

### 4. Constrain systems to well-defined boundaries

Define what the system should do and what it must not do. Boundaries can include tool permissions, retrieval scope, output schemas, allowed actions, escalation rules, rate limits, domain limits, or approval gates.

Ask:

- What is explicitly in scope?
- What is explicitly out of scope?
- Which actions require deterministic checks, human approval, or rollback?

### 5. Evaluate continuously, not only at launch

AI behavior changes over time as prompts, models, data, tools, retrieval content, workflows, and user behavior change. Evaluation must continue after release. Include regression tests, adversarial cases, real-user feedback, drift checks, and performance checks across important user groups or contexts.

Ask:

- What must remain true after every model, prompt, retrieval, or tool change?
- Which failures should block release?
- How will the team detect bias, uneven performance, regression, or drift?

### 6. Design features around real human expectations

Technical correctness is insufficient when the behavior conflicts with what users expect. The product must make its role, limits, confidence, and consequences clear enough that users know how to use it appropriately.

Ask:

- What does the user think the system is doing?
- Does the UI match the actual capability and risk?
- Where could users overtrust or undertrust the output?

### 7. Make failures observable, recoverable, and safe

Assume failures will happen. Make errors visible, explain them in usable language, support recovery, and avoid silent damage. Treat biased, uneven, or unsafe behavior as a system failure that teams can detect, debug, and correct.

Ask:

- How will the user know something went wrong?
- Can the user undo, retry, inspect, or escalate?
- What failure would be harmful if it stayed hidden?

### 8. Prioritize meaningful user control

Users should be able to steer, pause, override, refine, approve, or reject AI behavior. Autonomy without control erodes trust, especially when the system affects important records, workflows, money, health, access, employment, reputation, or customer communication.

Ask:

- Where should the user retain final authority?
- Which controls are real versus decorative?
- Can the user correct the system in a way that improves the next interaction?

### 9. Build with careful iteration, not leaps of faith

Start narrow, test assumptions early, expand after evidence, and monitor behavior as the system grows. Prefer staged rollout, restricted permissions, review queues, and capability expansion based on measured reliability.

Ask:

- What is the smallest trustworthy version?
- What capability should wait until evidence supports it?
- What release gate proves the system is ready to expand?

### 10. Document decisions, not just code or models

Human-centered AI systems require a record of why choices were made. Document rationale, tradeoffs, constraints, evaluation results, model or prompt changes, known limitations, and unresolved risks.

Ask:

- What decision would a future maintainer need to understand?
- What tradeoff did the team accept?
- What evidence justified the current boundary, control, or evaluation threshold?

## Default response pattern

When reviewing or designing an AI product, answer in this shape unless the user asks for a different format:

1. State the product judgment directly.
2. Describe the AI responsibility boundary: what the AI does, what deterministic logic does, and what humans control.
3. Identify the main trust risks and failure modes.
4. Recommend concrete product changes.
5. Define the evaluation and monitoring plan.
6. Define the rollout path.
7. List decisions that should be documented.

For short requests, compress this into a concise answer. Do not create unnecessary ceremony.

## Design review checklist

Use this checklist when reviewing a PRD, AI workflow, agent design, or production feature:

- Explainability: Does the user get enough context to understand the output?
- Predictability: Does similar input produce similar behavior?
- Scope: Are allowed and prohibited behaviors explicit?
- Determinism: Are brittle or high-risk steps handled by rules, validation, schemas, or approval gates?
- User expectations: Does the interface accurately describe what the AI can and cannot do?
- Control: Can users steer, approve, reject, undo, or escalate?
- Failure handling: Are errors visible, recoverable, and safe?
- Evaluation: Are there offline tests, online metrics, regression cases, adversarial cases, and user feedback loops?
- Fairness and uneven performance: Are high-risk contexts or user groups tested for inconsistent behavior?
- Iteration: Is the rollout staged with clear expansion criteria?
- Documentation: Are rationale, tradeoffs, constraints, and evaluation results recorded?

## Deterministic versus AI behavior map

When asked where AI belongs in a system, classify each step:

- Deterministic: identity, permissions, quotas, schema validation, policy checks, routing rules, required fields, source filters, audit logs, irreversible writes, financial calculations, contractual language, data retention, deletion, and compliance controls.
- AI-assisted: summarization, clustering, drafting, classification, extraction, recommendations, semantic search, synthesis, triage, anomaly surfacing, explanation generation, and natural-language interaction.
- Human-controlled: approvals, external communication, irreversible workflow changes, customer-visible claims, sensitive decisions, exception handling, and final judgment in high-consequence cases.

A durable AI product usually combines all three. Do not frame determinism and AI as mutually exclusive choices. Map the boundary deliberately.

## Trust contract for user-facing AI

When writing UX copy, feature descriptions, or product requirements, make the trust contract explicit:

- What the AI is doing.
- What data it used.
- What it did not use.
- What confidence or uncertainty exists.
- What the user can change.
- What happens when the user accepts the output.
- How the user can recover from a mistake.

Avoid vague claims such as “AI-powered,” “smart,” or “intelligent” when the user needs to know the actual behavior.

## Evaluation guidance

For AI features, define evaluation at four levels:

- Unit behavior: Does the prompt, parser, classifier, retrieval step, or tool call work on known cases?
- Workflow behavior: Does the full feature produce useful outcomes across realistic user paths?
- Regression behavior: Does the feature preserve required behavior after model, prompt, data, or system changes?
- Production behavior: Do logs, user feedback, quality reviews, and metrics show drift, uneven performance, or new failure modes?

Prefer concrete pass/fail criteria over vague quality goals. Include test cases for ambiguous input, adversarial input, missing data, stale data, permission boundaries, and edge cases that affect trust.

## Failure-mode review

For each AI feature, identify failures across this map:

- Wrong answer.
- Unsupported claim.
- Missing context.
- Overconfident answer.
- Biased or uneven performance.
- Privacy or permission leakage.
- Prompt injection or tool misuse.
- Irreversible action without approval.
- Silent failure.
- User cannot correct or recover.

For each failure, define detection, user experience, recovery, and owner.

## Documentation standard

A complete AI decision record should include:

- Decision summary.
- User problem.
- Capability boundary.
- Deterministic controls.
- Model-driven behavior.
- Human control points.
- Data sources and excluded sources.
- Known risks.
- Alternatives rejected.
- Evaluation method.
- Launch criteria.
- Monitoring plan.
- Rollback plan.
- Open questions.

Use this when the user asks for PRDs, architecture notes, product strategy, executive explanations, or launch plans.

## Output quality bar

When using this skill, produce advice that is concrete enough for a PM and engineering team to act on. Prefer specific product mechanisms over abstract values.

Strong outputs name the boundary, the control, the failure mode, the evaluation method, and the documentation artifact.

Weak outputs use general language about trust, transparency, safety, or ethics without saying what should change in the product.
