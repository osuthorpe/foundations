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

`consumers: [cc-plugin, desktop-zip]` is what routes it into both runtimes; the
directory (`skills/`) is what the Claude Code CLI actually scans. See
[../README.md](../README.md) for the full convention.
