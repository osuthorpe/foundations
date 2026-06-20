---
name: commit-message
description: Apply when writing a git commit message, drafting a PR title, or asked to "write a commit" — covers the conventional-commits format, subject-line rules, and writing a body that explains why over what.
consumers:
  - desktop-zip
status: active
---

# Writing a Commit Message

Apply these rules whenever you author a commit message or PR title.

## Subject line

- Format: `<type>(<scope>): <summary>`. The `(<scope>)` is optional.
- **type** is one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Use the imperative mood: "add", not "added" or "adds".
- Keep it ≤ 50 characters. Don't end with a period. Lowercase the summary.
- The summary names the change, not the file: `fix: stop retrying on 4xx`, not `fix: update client.ts`.

## Body (when the change is non-trivial)

- Separate the body from the subject with one blank line.
- Wrap at ~72 columns.
- Explain **why** the change was made and what it affects — the diff already shows *what* changed.
- Note user-visible effects, trade-offs, and anything a reviewer or future reader would otherwise have to reverse-engineer.

## Footer

- Reference issues: `Closes #123`, `Refs #456`.
- Breaking changes: start a footer line with `BREAKING CHANGE:` and describe the migration.

## Choosing the type

| If the change… | use |
| --- | --- |
| adds a new capability a user can see | `feat` |
| corrects broken behavior | `fix` |
| only touches docs | `docs` |
| restructures code without changing behavior | `refactor` |
| adds or fixes tests only | `test` |
| touches build, deps, or tooling | `build` / `chore` / `ci` |

## Never do these

- Never bundle unrelated changes under one vague subject ("misc fixes", "updates").
- Never describe the file touched instead of the behavior changed.
- Never use a `feat`/`fix` type for a pure refactor — it misleads changelog tooling.
- Never write a body that just restates the subject in more words.
