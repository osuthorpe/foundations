# evals

> **New here, or not an engineer?** Start with [GETTING-STARTED.md](GETTING-STARTED.md), a plain-language walkthrough for adding your first test.

This repo evaluates prompts and skills with [**promptfoo**](https://promptfoo.dev), an open-source LLM eval tool. Each asset keeps its `promptfooconfig.yaml` beside the asset, and every config compares the foundation version against weaker baselines:

- **Prompts** run three columns: **no prompt** (bare input), a **naive** prompt, and the **foundation** `prompt.md`.
- **Skills** run two columns: **without** the skill and **with** the skill injected.

The foundation column must be clearly better. If it is not, the asset is not ready.

Evals don't call live systems. Prompt evals use representative inputs. Tool-routing skills test the model's decision as JSON; they do not execute the tool.

## Run evals

```bash
npm install                 # once — installs promptfoo
npm run check               # offline lint of frontmatter + generated files (no key)
npm run eval                # run every asset's promptfooconfig.yaml
npm run eval:view           # open the local web UI: results, diffs, history

# a single asset, or pass any promptfoo flag through:
npx promptfoo eval -c prompts/writing/summarize/promptfooconfig.yaml
npx promptfoo eval -c skills/commit-message/promptfooconfig.yaml
```

`npm run eval` needs gateway access. `npm run check` and `npm run index` are fully offline. promptfoo stores results locally; use `npm run eval:view` to browse runs, compare outputs, and watch for drift.

## Models and gateway

All model calls go through a **LiteLLM gateway**. Runner and judge models can come from any provider the gateway serves, behind one key and one spend log. Configure it in `.env`:

```bash
cp .env.example .env
# LITELLM_BASE_URL=http://localhost:4000
# LITELLM_API_KEY=sk-...   # a virtual key from the gateway's dashboard (<base_url>/ui)
```

Two shared model roles are defined once and imported by every config via `file://`:

- **runners** — the models under test, in [`promptfoo.base.yaml`](promptfoo.base.yaml). Add a line to run the whole suite against another model (the BYOM matrix).
- **judges** — the two-model panel that grades `llm-rubric` assertions, in [`judge-primary.yaml`](judge-primary.yaml) and [`judge-secondary.yaml`](judge-secondary.yaml). They're different model families on purpose, so they don't share blind spots; judge with a family different from the runner under test to avoid self-preference bias.

## Config shape

Everything for an asset lives in that asset's folder. A prompt config lives at `prompts/<area>/<name>/`, so it references shared `evals/` files three levels up:

```yaml
providers: file://../../../evals/promptfoo.base.yaml   # runner models
prompts:                                               # the comparison columns
  - { id: "file://../../../evals/load-prompt.cjs:baseline", label: no-prompt }
  - { id: "file://../../../evals/load-prompt.cjs:legacy",   label: naive }
  - { id: "file://../../../evals/load-prompt.cjs:improved", label: foundation }
defaultTest:
  vars: { promptPath: prompts/<area>/<name>/prompt.md, baseline: "...", legacy: "..." }
  assert:
    - { type: is-json, value: file://schema.json }   # json prompts only
    - { type: llm-rubric, value: file://rubric.txt, provider: file://../../../evals/judge-primary.yaml }
    - { type: llm-rubric, value: file://rubric.txt, provider: file://../../../evals/judge-secondary.yaml }
tests:
  - description: <case-id>
    vars: { ...the inputs... }
```

- **`load-prompt.cjs`** is the glue between promptfoo and this repo. It reads the canonical `prompt.md`, strips frontmatter, maps `## System` and `## User` into chat messages, and fills `{{schema}}` from `schema.json`. Evals test the real prompt, never a copy.
- **Other loader exports** build baseline, naive, skill, and tool-routing variants. `promptPath` and `skillPath` resolve from the repo root; run evals from there. The npm scripts already do this.
- **`rubric.txt`** is the co-located grading criteria passed to both judges.
- **`schema.json`** is the co-located JSON contract checked by `is-json` when `output: json`.
- **Baseline and naive columns** are expected to fall short. The gap is the foundation prompt's value. In `npm run eval:view`, the **foundation** column is the one that must pass.

### Eval shapes

| Asset | Config exports used | What it proves |
| --- | --- | --- |
| prompt (`prompts/<area>/<name>/`) | `baseline`, `legacy`, `improved` + `llm-rubric` (+ `is-json`) | the prompt beats the bare/naive request on the rubric |
| knowledge skill (`commit-message`) | `skillBaseline`, `withSkill` + `llm-rubric` | the skill makes answers concrete and correct |
| tool-routing skill | `toolBaseline`, `toolSkill` + `is-json` + [`assert-tool.cjs`](assert-tool.cjs) | the skill routes the request to the right tool with the right args |

Skill configs live at `skills/<name>/`, one level shallower than prompts, so they reference the shared files as `file://../../evals/...`.

## Add an eval

Copy the `promptfooconfig.yaml` from a similar asset, point `promptPath` / `skillPath` at yours, and edit `tests:`. Then validate and run it:

```bash
npx promptfoo validate config -c <path>
npx promptfoo eval -c <path>
```

For a slower walkthrough, use [GETTING-STARTED.md](GETTING-STARTED.md).
