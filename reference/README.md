# reference

Reference docs hold stable **facts**, not advice. Runtimes inject them into AI context when the facts are relevant.

- [semver.md](semver.md): Semantic Versioning 2.0.0 — the example reference doc.

Each doc starts with frontmatter — `name` (the file name), `description`, `consumers: [context-injection]`, and `status` — so it appears in the generated [ASSETS.md](../ASSETS.md) map and passes `npm run check`. Everything below the frontmatter is the facts themselves.

Add a reference doc when the AI needs a stable fact set it keeps missing or misstating. Keep it factual. If you are writing "when X, do Y", write a [skill](../skills/README.md) (on-demand judgment) or a [rule](../rules/README.md) (standing editor guidance) instead.
