# Asset Distribution Map

> **Generated file — do not edit.** Regenerate with `npm run assets:index`
> after changing any asset's `consumers`. `npm run check` fails when this
> file is stale.

Each asset declares a `consumers` list in its frontmatter — the closed set of
runtimes that package or serve it. This map groups every asset by consumer so
you can see what each runtime ships. The list is authoritative: the Claude Code
plugin loads exactly the `skills/` tree, the Desktop packager and MCP loaders
filter on `consumers`.

### Cursor / AGENTS rules — `cursor`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
| [code-comments](rules/code-comments.mdc) | rule | active | cursor |

### Claude Code plugin — `cc-plugin`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
| [commit-message](skills/commit-message/SKILL.md) | skill | active | cc-plugin, desktop-zip |

### Claude Desktop / claude.ai zip — `desktop-zip`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
| [commit-message](skills/commit-message/SKILL.md) | skill | active | cc-plugin, desktop-zip |

### MCP server / agent — `mcp`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
| [writing-summarize](prompts/writing/summarize/prompt.md) | prompt (completion) | active | mcp |

### Reference context — `context-injection`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
| [semver](reference/semver.md) | reference | active | context-injection |
