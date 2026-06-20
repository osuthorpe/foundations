---
name: blog-editing-pass
description: Perform a editorial pass on writing. Use when the user asks for an editing pass, revision, publish pass, line edit, structural edit, polish, sharpen, tighten, or final review of files under alexthorpe.com/drafts or other blog prose in this repository.
status: proposed
---

# Blog Editing Pass

## Purpose

Turn a draft into stronger AI product leadership writing without sanding down the authors voice.

Use this skill for repo-local editing passes on blog drafts, outlines, essays, LinkedIn-style posts, and publication candidates. The default is a direct edit to the file unless the user asks for notes only.

## Required Context

Before editing, read the target draft.

Apply these repo standards:

- `rules/writing.mdc` is the voice and prose baseline.
- `AGENTS.md` is the strategic bar for audience, portfolio fit, AI product judgment, and the OpenAI standard.
- `skills/writing/human-grade-writing/SKILL.md` governs substantive rewrites. Read it if it is not already loaded.

If the draft uses citations, statistics, legal claims, research claims, or named company examples, preserve source discipline. Do not invent facts, citations, quotes, metrics, anecdotes, or examples.

## Default Pass

When the user says "editing pass" without more detail, perform an integrated publication pass:

1. Strengthen the main claim and opening.
2. Improve section order and paragraph logic where needed.
3. Push generic ideas toward product decisions, product behavior, operating standards, metrics, permissions, evals, controls, recourse, or tradeoffs.
4. Cut throat-clearing, hype language, newsletter cadence, filler transitions, generic AI setup, and sentences that only sound polished.
5. Tighten sentence rhythm while preserving direct, plainspoken voice.
6. Check evidence, links, footnotes, frontmatter, headings, Markdown formatting, and ending.

## Pass Types

Infer the pass from the user's wording:

- "line edit", "tighten", "polish": preserve structure and argument; edit sentences, paragraphs, rhythm, and redundancy.
- "structural edit", "make this work", "fix the essay": change section order, framing, argument flow, title, and conclusion as needed.
- "publication pass", "final pass", "ready to publish": edit directly, then check metadata, links, footnotes, headings, title, description, and residual evidence gaps.
- "review", "diagnose", "feedback": do not edit unless asked. Lead with problems, ordered by importance, then give concrete fixes.
- "make it more human", "remove AI voice", "make it sound like me": use `human-grade-writing` as the primary rewrite layer.

## Editing Workflow

### 1. Orient

Identify:

- The central claim.
- The intended senior reader.
- The strongest existing sentence or section.
- The weakest assumption.
- The main evidence burden.
- The role this piece plays in the portfolio.

For drafts in a numbered sequence, check for existing `AGENTS.md` to avoid repeating the job of nearby articles. If `AGENTS.md` is missing, scan the folder for other drafts or files with related titles or sequence numbers, and use those to prevent redundancy and overlap.

### 2. Decide Edit Depth

Use the least invasive edit that makes the draft materially stronger.

Replace paragraphs outright when they are generic, structurally misplaced, or built around weak logic. Preserve passages that carry real voice, specificity, or product judgment.

Ask before changing the central thesis, deleting a major section, or adding a new research burden that would require external verification.

### 3. Edit The Argument

Every major section should do at least one useful job:

- Name a product problem.
- Make a claim a strong AI builder could dispute.
- Translate a value into product behavior.
- Define a decision rule, release standard, metric, boundary, or operating practice.
- Connect evidence to what a PM should decide, build, measure, launch, or refuse.

Cut sections that mostly summarize the discourse.

### 4. Edit The Prose

Edit for substance, clarity, and rhythm:

- Prefer concrete nouns and verbs.
- Use specific companies, products, benchmarks, incidents, and mechanisms when substantiated.
- Favor short declarative sentences for direct claims.
- Write longer sentences only when needed to clarify the relationship between ideas.
- Use plain transitions—avoid filler or decorative linking language.
- Land endings on consequence, decision, responsibility, or the operating standard.

Avoid over-smoothing the style at the cost of honest friction, asymmetry, or directness.

#### Banned Phrases

Do not use any banned phrases or constructions listed in `rules/writing.mdc`:

- Validation preambles: "Great question," "Excellent point," "You’re absolutely right," "Good thinking."
- Setup-reveal transitions: "Here’s the thing," "Here’s the kicker," "The catch?", "Plot twist."
- Generic scene-setting: "In today’s world," "In an era of," "As we navigate," "More than ever."
- Throat-clearing qualifiers: "It’s worth noting," "Importantly," "Notably," "Significantly."
- Contrast-as-reveal: "It’s not X, it’s Y," "less about X, more about Y," "rather than X."
- Negation lead-ins that delay the point. Open with the claim.
- Count-plus-payoff preambles: "Three things fix this," "The five things that matter."
- Listicle priority openers: "If you read one thing," "If you only do X this quarter."
- Help-offer closers: "Want me to," "Let me know if," "Happy to dig deeper."
- Compliment closers: "Great instinct," "You’re asking the right questions."
- Emphatic metaphor closers: "moves the needle," "the real unlock," "the wedge," "the crux," "the biggest lever," "load-bearing," "that’s where it gets interesting."
- Corporate verbs when plain verbs work: use "use" not "utilize" or "leverage"; "do" or "run" not "execute"; "help" not "facilitate." Never use "operationalize" or "ideate."
- Padding verbs: "highlighting," "emphasizing," "underscoring," "showcasing," "demonstrating," "reflecting," "illustrating." Rewrite with finite verbs.
- "Quiet [noun]" constructions.
- Representational filler: "X represents Y," "X reflects Y," "X symbolizes Y" (unless literally about representation).
- Vague collective claims.
- Costless minimizers: "basically free," "essentially free," "no real downside," "costs nothing."
- Decorative emojis.

If in doubt, check `rules/writing.mdc` for the canonical list and guidance on voice and style.
Prefer:

- Concrete nouns.
- Specific companies, products, benchmarks, incidents, and mechanisms when the draft supports them.
- Short declarative sentences for claims.
- Longer sentences only when the relationship between ideas needs the room.
- Plain transitions.
- Endings that land on consequence, responsibility, decision quality, or the operating standard.

Avoid over-polishing. Keep useful asymmetry, friction, and directness.

### 5. Preserve Format

Protect:

- YAML frontmatter keys and valid syntax.
- Markdown heading hierarchy unless structure changes require otherwise.
- Footnote syntax and footnote definitions.
- Links and source attributions.
- Code fences, blockquotes, lists, and tables.

If a citation or fact looks unsupported, do not invent a fix. Either preserve it and flag the concern in the final note, or mark a concise `[TK: verify ...]` only when the user has asked for publish-readiness and the gap blocks publication.

### 6. Final Check

Before finishing, scan for:

- Banned phrases from `writing.mdc`.
- Unsupported statistics or source claims.
- Generic AI commentary with no product decision.
- Repeated section shapes.
- Overlong paragraphs.
- Broken Markdown.
- Missing or mismatched footnotes.
- A weak title, description, opening, or ending.

Apply the OpenAI bar from `AGENTS.md`: the piece should show judgment about capability, safety, trust, evals, agency, deployment, and user outcomes.

## Reporting Back

After direct edits, keep the final response brief:

- Name the edited file.
- State the type of pass performed.
- Mention the highest-signal changes, not a file-by-file changelog.
- Flag unresolved evidence gaps, assumptions, or tests/checks not run.

For review-only requests, lead with the problems. Avoid praise unless it adds information.
