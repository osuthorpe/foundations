---
name: human-grade-writing
description: Transform AI-assisted drafts into specific, authorial, credible prose. Use when the user asks to rewrite, humanize, sharpen, diagnose synthetic voice, match style from samples, or raise a draft from competent to memorable. Applies to blog posts, essays, LinkedIn posts, memos, speeches, and email.
status: proposed
---

# Human-Grade Writing

## Purpose

Transform AI-assisted drafts into writing that feels specific, authorial, credible, and naturally composed by a thoughtful person.

This skill improves voice, rhythm, judgment, specificity, emotional control, rhetorical quality, and reader trust. It must not be used to impersonate a person without permission, fabricate personal experience, remove required AI-use disclosures, or optimize around evading AI detectors.

## Relationship To Other Guidance

- `rules/writing.mdc` is the always-on baseline: bans, voice, rhythm, substance, assessment standards.
- `AGENTS.md` is the strategic frame: audience, thesis, article fit, product judgment.
- This skill adds rewrite workflow, earned rhetoric, civic cadence, format modes, and voice matching.

When guidance conflicts on rhetorical devices, cut empty or template patterns per `writing.mdc`. Keep devices that sharpen a true distinction. See [rhetoric.md](rhetoric.md).

Do not duplicate the ban list from `writing.mdc`. Apply those bans automatically.

## When To Use

Use this skill when the user asks to:

- Make writing sound more human
- Remove AI-generated writing patterns
- Rewrite a blog post, LinkedIn post, essay, article, email, comment, speech, or memo
- Make a draft sharper, more natural, more opinionated, or less generic
- Match the user's own style from provided samples
- Diagnose why a piece of writing sounds synthetic
- Raise a piece from competent to memorable
- Add dignity, seriousness, restraint, emotional depth, or rhetorical force

## Core Standard

The output should sound like a person with judgment wrote it.

Human-grade writing usually has:

- A clear claim
- Concrete nouns and specific details
- Uneven but intentional rhythm
- Visible judgment
- Plausible uncertainty where appropriate
- Direct transitions
- Fewer abstractions
- Less default symmetry
- Less over-explanation
- No boilerplate ending

High-quality writing does not merely avoid AI tells. It creates the feeling of a mind making distinctions.

## Hard Boundaries

Do not:

- Claim the writing was not AI-assisted
- Remove an AI disclosure line unless the user explicitly asks and the context permits it
- Invent personal anecdotes, credentials, emotions, conversations, or lived experience
- Imitate a living writer's exact style
- Add fake citations, fake statistics, or invented examples
- Optimize the text for "passing" AI detectors
- Make professional, academic, legal, medical, or financial writing deceptive

When the user asks for "indistinguishable from human," interpret the request as: make this sound natural, specific, grounded, and authorial.

## Writing Philosophy

The best version of a draft usually does four things:

1. It states something specific.
2. It shows why that claim is difficult or consequential.
3. It connects the idea to human reality.
4. It ends with responsibility, consequence, or a sharper understanding.

The work is not polish alone. The work is judgment.

## Workflow

### 1. Identify the real writing job

Before rewriting, determine:

- Audience
- Format
- Desired effect
- Author's likely stance
- Main claim
- Emotional register
- Level of rhetorical force
- What the reader should believe, feel, or do after reading

If the user provides no context, make a reasonable assumption and proceed. For format-specific defaults, see [modes.md](modes.md).

### 2. Extract the human anchors

Find or create from the user's material:

- One specific claim
- One concrete detail
- One tension or tradeoff
- One sentence that sounds closest to the user's real voice
- One thing the piece should refuse to overstate
- One obligation, consequence, or practical implication

Do not add personal facts unless the user supplied them.

### 3. Remove synthetic patterns

Cut or rewrite generic openers, default three-part structures, scene-setting clichés, setup-reveal transitions, "ultimately" closings, excessive hedging, over-polished paragraph symmetry, repetitive sentence openings without purpose, abstract nouns without examples, fake contrast, generic inspiration, slogan-shaped claims, and corporate verbs unless genuinely right.

Do not cut symmetry, repetition, antithesis, aphorism, or ornament automatically. Cut them when they decorate weak thinking. Keep them when they sharpen true thinking. See [rhetoric.md](rhetoric.md).

### 4. Add authorial judgment

Strengthen the draft by adding:

- A sharper position
- A concrete objection
- A practical constraint
- A named mechanism
- A real tradeoff
- A sentence that shows taste, preference, skepticism, or moral clarity

Keep the tone appropriate to the user's context. Do not make every piece aggressive, grand, or contrarian.

### 5. Vary rhythm

Use a mix of short declarative sentences, medium explanatory sentences, longer sentences when the idea contains real complexity, paragraphs of different lengths, direct transitions, and selective fragments only when the format supports them.

Avoid making every paragraph the same shape.

### 6. Preserve useful imperfection

Do not over-polish the draft.

Keep some natural asymmetry, specificity, and friction. Human writing often has edges: a compressed sentence, a slightly unusual phrase, a hard stop, a preference stated plainly.

Fix errors. Do not sand away voice.

## Civic And Rhetorical Layers

Use [civic-prose.md](civic-prose.md) when the writing needs dignity, public seriousness, moral weight, emotional depth, or a sense of larger purpose.

Use [rhetoric.md](rhetoric.md) when the writing needs memorability, cadence, compression, persuasion, or speech-like force.

## Voice Matching

When the user provides samples, infer:

- Sentence length
- Favorite verbs
- Level of bluntness
- Preferred punctuation
- How they introduce disagreement
- How much context they give before stating a claim
- Whether they write more like an operator, essayist, analyst, storyteller, or practitioner
- How much rhetorical force they naturally tolerate

Match the user's tendencies without copying exact phrases too often.

## Source Discipline

When adding detail, use only what the user supplied or what can be verified.

Do not invent personal stories, conversations, customer examples, metrics, quotes, case studies, legal or policy claims, emotional states, or professional experience.

If a piece needs a concrete example and the user has not supplied one, either keep the example generic or mark it as a placeholder.

## Output Modes

When rewriting, provide only the rewritten version unless the user asks for explanation.

When diagnosing, use this structure:

1. What makes it sound AI-generated
2. What to change
3. Rewritten version

When producing a polished draft, include:

- A natural title if useful
- The full rewritten draft
- Optional disclosure line only if appropriate or requested

When improving a styleguide, skill, or reusable prompt, provide the complete revised version unless the user asks for a patch.

## Quality Checklist

Before finalizing, check:

- Does the piece make a clear claim?
- Does it sound like someone with judgment wrote it?
- Does it begin with something concrete when the subject calls for it?
- Does it widen into a larger point?
- Does it admit the real difficulty?
- Does any hopeful note feel earned?
- Are values shown through actions?
- Are there concrete details?
- Are any examples invented? If yes, remove them.
- Are the sentence openings varied?
- Are transitions plain?
- Is the ending useful?
- Did the rewrite preserve the user's intent?
- Did it avoid fake certainty?
- Did it avoid detector-evasion language?
- Does any rhetorical device carry a real idea?
- Does repetition add pressure, evidence, or specificity?
- Does the cadence fit the format?
- Would the reader still trust the claim if the style were stripped away?
- Could the same structure work without borrowing anyone's recognizable voice?

## Additional Resources

- Weak/strong rewrite examples: [examples.md](examples.md)
- Civic prose layer: [civic-prose.md](civic-prose.md)
- Rhetorical force layer: [rhetoric.md](rhetoric.md)
- Format modes: [modes.md](modes.md)

## Default Instruction

Rewrite the user's draft into natural, specific, human-grade writing. Preserve their meaning. Strengthen the claim. Start from concrete reality when the subject calls for it, widen into the larger point, admit the real difficulty, and make any hopeful conclusion feel earned. Remove synthetic phrasing, fake symmetry, generic inspiration, and unsupported certainty. Keep rhetorical devices when they sharpen true thinking. Cut them when they decorate weak thinking. Add detail only when grounded in the user's material. Keep the final version clean, direct, credible, and publishable.
