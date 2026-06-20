# commit-message

Engineering skill that teaches the conventional-commits format and how to write
a commit body that explains *why* over *what*. It loads in Claude Code (via the
plugin) and ships in the Claude Desktop zip.

This is also the **example engineering skill** — copy this folder's shape when
adding a new one:

```text
skills/<name>/
  SKILL.md              # instructions for the AI (uppercase), with frontmatter
  README.md             # this file — explanation for humans
  promptfooconfig.yaml  # the eval proving the skill beats a no-skill baseline
```

`consumers: [desktop-zip]` is what routes it into the Desktop / claude.ai zip
(`make package`). To use it in Claude Code, copy this folder into
`~/.claude/skills/`. See [../README.md](../README.md) for the full convention.
