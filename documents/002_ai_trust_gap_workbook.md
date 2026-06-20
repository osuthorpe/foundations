# AI Trust and Agency Workbook

Use this workbook before an AI feature moves from idea to build. It makes the team's trust claims concrete enough to test.

An AI feature earns trust when users keep meaningful control, can see enough evidence to understand important outputs, and have a practical recovery path when the system gets something wrong.

## 1. Trust Threat Model

Before writing the PRD, name what the user is likely to fear. Do not write, "users may have privacy concerns." Be specific.

Use this inventory:

```txt
Feature:
User:
Affected non-user:
Workflow:

What might the user reasonably fear?
- The product is watching them.
- Their work will be judged or replaced.
- Private data will train a model.
- The AI will make a decision they cannot appeal.
- The answer will be wrong but authoritative.
- A human will disappear from a moment that requires judgment.
- The company will blame the AI when something goes wrong.

Which fears apply here?

What response does each fear require?
- Design control:
- Technical control:
- Operating control:
- Decision not to ship:
```

The output should become product scope. A fear with no response is not a communications problem. It is an unhandled product risk.

## 2. Displacement Review

For every AI feature, write down whose work changes if the feature succeeds. Name the roles and personas.

```txt
Roles affected:

What work disappears?

What work gets faster?

What work gets worse?

What new work appears?

Is this feature augmenting, replacing, managing, or extracting from the user?
```

Use plain labels:

- An augmenting product helps the user do more of what they already value.
- A replacing product removes the user from the workflow.
- A managing product watches, scores, routes, or pressures the user.
- An extracting product captures the user's knowledge so someone else can use it later without them.

Those are different products. Do not hide them under the same "AI-powered" label.

## 3. Agency Map

For each workflow, mark who controls the goal, the inputs, the judgment, the action, and final accountability.

| Workflow step | AI role | Human role | What the user may fear | Control required | Proof required | Recourse required |
| --- | --- | --- | --- | --- | --- | --- |
| Summarize customer feedback | Draft summary | Review and edit | Missed nuance or biased framing | Edit before sharing | Source comments and counts | Correct summary and regenerate |
| Recommend support response | Suggest reply | Approve or rewrite | Wrong promise to customer | Human approval before send | Source policy and ticket history | Undo, apologize, escalate |
| Rank applicants | Score candidates | Make hiring decision | Unappealable bias | Narrow scope or do not ship | Feature explanation and audit | Appeal path and human review |
| Monitor employee work | Detect patterns | Manager review | Surveillance and performance punishment | Explicit consent and admin policy | Logs and thresholds | Challenge record and remove bad signal |

Then answer five agency questions:

1. Does the user choose when AI enters the workflow?
2. Can the user see what the AI used?
3. Can the user change the AI's answer before it matters?
4. Can the user reject the AI without penalty?
5. Can the user recover if the AI causes harm?

If the answer to any of these is no, the feature may still be useful, but it should be treated as higher risk.

## 4. One-Page Agency Brief

Complete this before the feature moves into build.

```txt
Feature:
What the AI does:
Autonomy level:
Who uses it:
Who is affected by it:

User fear:
What might the user reasonably worry about?

Human authority:
Who sets the goal?
Who approves the action?
Who is accountable if it fails?

Control:
Can the user opt in, pause, narrow scope, reject, undo, or turn it off?

Proof:
What evidence does the system show?
What sources, records, confidence signals, or limitations are visible?

Recourse:
How can the user correct, appeal, escalate, recover, or reach a human?

Release condition:
What must be true before this ships?
```

A strong brief reads like this:

```txt
Feature:
AI drafts customer refund replies.

Autonomy level:
Level 2. It drafts for human review and prepares an action. It does not send or refund without approval.

User fear:
The customer may fear a wrong denial. The support rep may fear being blamed for an AI-generated promise. The manager may fear inconsistent policy application.

Control:
The rep can edit, reject, regenerate, or escalate. The customer can ask for a human review. Admins can disable AI drafting for high-value accounts or disputed cases.

Proof:
The draft cites the policy section, order status, prior ticket history, and missing facts. Unsupported claims are blocked.

Recourse:
Every AI-assisted refund decision leaves a case note, can be reopened, and routes disputed cases to a human queue.

Release condition:
Representative tests show correct eligibility classification, no unauthorized promises, safe escalation on ambiguous cases, and no increase in repeat contacts during rollout.
```

This artifact is small on purpose. A product team should be able to fill it out during discovery, revise it during design, attach it to the launch review, and update it after incidents.

## 5. Purpose-Preserving Task Map

Separate which tasks are automatable from which tasks users actually want to delegate. They are not the same set.

Obvious candidates often include formatting, transcription, deduplication, first-pass summarization, routing, translation, search, reconciliation, and repetitive status updates.

Tasks that require more care include giving feedback, making a diagnosis, ranking employees, judging creative work, writing a condolence message, making a credit decision, evaluating performance, rejecting an applicant, or answering a scared customer.

```txt
Task:
Is it automatable?
Do users want to delegate it?
Does it carry judgment, relationship, craft, identity, or accountability?
What must remain human?
What should AI assist?
What should AI never do by default?
```

A purpose-preserving product removes work users experience as meaningless while protecting work they experience as skilled, relational, creative, or identity-forming.

## 6. Autonomy Ladder

Map the feature to the level of autonomy the product grants the AI.

```txt
Level 1: AI retrieves or summarizes information.
Level 2: AI drafts something for human review.
Level 3: AI recommends a decision.
Level 4: AI executes an approved action.
Level 5: AI acts without prior human approval.
```

Most product risk comes from moving up this ladder without telling the user. A summarizer becomes a recommender. A recommender becomes a decision engine. A decision engine becomes an actor. Each step requires a higher standard for consent, testing, monitoring, and rollback.

If the AI can affect money, access, employment, healthcare, education, legal rights, customer commitments, or reputation, the human authority line needs to be explicit.

Pair the ladder with the reversibility test. The higher the level and the harder a wrong action is to undo, the more control, proof, and recourse the feature must earn before it ships. A Level 2 draft the user can ignore needs little. A Level 4 action that moves money or sends a customer commitment needs the full stack, because the user cannot take it back.

## 7. AI Contract

Every AI feature should have a short contract the team can explain internally and externally.

For users, answer:

- What does this AI do?
- What does it never do?
- What can it see?
- What does it remember?
- Can I turn it off?
- Can I correct it?
- Can I appeal it?
- Can a human review this?
- Will this be used to evaluate me?
- Will this be used to train a model?
- Who is responsible if it is wrong?

For employees, add:

- Will this change my role?
- Will this monitor my performance?
- Will this reduce headcount?
- Will I share in the productivity gains?
- Will I be trained for the new version of the work?
- Will I still own the judgment that defines my profession?

If the company cannot answer those questions, employees will answer them themselves, usually pessimistically.

## 8. Grounded Output

For factual, financial, medical, legal, enterprise, or customer-impacting use cases, the product should show what the answer is based on.

Choose the evidence pattern:

```txt
Source documents:
Quoted passages:
Record IDs:
Timestamps:
Confidence bands:
Conflicting evidence:
"Not enough information" state:
Hard refusal when evidence is weak:
Human approval step:
```

Do not turn users into forensic auditors for every answer. Verification should be proportional to risk.

## 9. Control Surface

Trusted AI needs controls that persist beyond onboarding. The user should be able to find them later, understand them quickly, and use them without penalty.

Minimum controls usually include:

- Opt in for sensitive data access.
- Pause for observation or memory features.
- Delete for stored inputs, outputs, and derived artifacts.
- Undo for AI-assisted actions.
- History for what the AI saw, generated, changed, or sent.
- Scope controls for which files, folders, accounts, channels, fields, or records the AI can access.
- Human escalation for high-stakes or ambiguous cases.
- Admin controls for enterprise deployment.
- Audit logs for regulated or multi-user environments.

A control that technically exists but is buried, unclear, or irreversible does not create trust.

## 10. Failure and Recourse

Write the failure playbook before the feature ships.

```txt
What happens if the AI gives a wrong answer?

What happens if it exposes data it should not have seen?

What happens if it takes an action the user did not intend?

What happens if a customer relies on a bad output?

What happens if a worker believes the system is being used to evaluate or replace them?

What happens if the model provider changes behavior?

What happens if the feature works in demo data and fails in messy customer data?

Who owns each failure mode?

How does the user recover?
```

A trustworthy product prevents failure and makes failure recoverable.

## 11. Trust Release Gate

A normal release checklist asks whether the feature works. An AI trust checklist asks whether the system deserves the degree of reliance the interface invites.

Before launch, confirm:

- The AI's role is clear in the UI.
- The feature has an owner for accuracy, safety, privacy, and support.
- The model cannot access data outside the intended scope.
- The system has been tested against representative bad cases and happy paths.
- Known failure modes are documented.
- High-risk outputs have review or escalation paths.
- Users can inspect and correct important outputs.
- Users can reject or disable the feature without punishment.
- Admins can disable the feature or narrow its scope.
- Logs support debugging without exposing unnecessary sensitive data.
- Support has a playbook for user complaints and corrections.
- Marketing claims match actual system behavior.
- The team has reviewed whether the feature removes valued work and whether it saves time.

This should not live in a policy document no one reads. It should be part of product readiness.

## 12. Trust Metrics

Treat adoption as an incomplete signal. AI adoption can rise because users feel forced, because the feature is defaulted on, or because there is no alternative. Usage is not trust.

Measure whether users retain control:

- Opt-out rate.
- Override rate.
- Undo rate.
- Escalation rate.
- Correction rate.
- Human review rate.
- Appeal rate.
- Time to recovery after AI error.
- Percentage of AI actions with visible provenance.
- Percentage of high-stakes AI outputs reviewed before action.
- User-reported sense of control.
- User-reported confidence that AI helps them and preserves their role.

Also measure hidden work:

- How much time do users spend checking AI output?
- How much cleanup does AI create?
- Which tasks did users stop doing themselves?
- Which skills are atrophying?
- Which parts of the job became more meaningful?
- Which parts became more mechanical?

The goal is appropriate trust: users rely on the AI when it is strong, question it when evidence is weak, and remain in control when the stakes are high.
