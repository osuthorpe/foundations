# Asset Distribution Map

> **Generated file — do not edit.** Regenerate with `npm run assets:index`
> after changing any asset's `consumers`. `npm run check` fails when this
> file is stale.

Each asset declares a `consumers` list in its frontmatter — the closed set of
runtimes that package or serve it. This map groups every asset by consumer so
you can see what each runtime ships. The list is authoritative: the Desktop
packager and MCP loaders filter on `consumers`.

### Cursor / AGENTS rules — `cursor`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
| [code-comments](rules/code-comments.mdc) | rule | active | cursor |

### Claude Desktop / claude.ai zip — `desktop-zip`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
| [ai-trust-agency-review](skills/product-management/ai-trust-agency-review/SKILL.md) | skill | proposed | desktop-zip |
| [commit-message](skills/commit-message/SKILL.md) | skill | active | desktop-zip |

### MCP server / agent — `mcp`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
| [writing-summarize](prompts/writing/summarize/prompt.md) | prompt (completion) | active | mcp |

### Reference context — `context-injection`

| Asset | Type | Status | All consumers |
| --- | --- | --- | --- |
| [semver](reference/semver.md) | reference | active | context-injection |
