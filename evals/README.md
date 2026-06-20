# evals

> **New here, or not an engineer?** Start with [GETTING-STARTED.md](GETTING-STARTED.md), a plain-language walkthrough for adding your first test.

This repo evaluates skills with [**promptfoo**](https://promptfoo.dev), an open-source LLM eval tool. Each skill keeps its `promptfooconfig.yaml` beside its `SKILL.md`, and every config compares the model **with** the skill against the model **without** it:

- **Knowledge skills** run two columns: **no-skill** (the question alone) and **with-skill** (the same question with `SKILL.md` injected), graded by an LLM rubric.
- **Tool-routing skills** run **tool-baseline** vs **tool-skill** and check the model's tool choice as JSON (they don't execute the tool).

The with-skill column must be clearly better. If it isn't, the change isn't ready. Evals don't call live systems — they use representative inputs.

## Run evals

```bash
npm install                 # once — installs promptfoo
npm run check               # offline lint of frontmatter (no key)
npm run eval                # run every skill's promptfooconfig.yaml + the gate
npm run eval:view           # open the local web UI: results, diffs, history
npm run eval:trend          # score-over-time table across past runs

# a single skill, or pass any promptfoo flag through:
npx promptfoo eval -c skills/commit-message/promptfooconfig.yaml
```

`npm run eval` needs the provider API keys in `.env` (see [Models](#models)). `npm run check` is fully offline. Every run is stored and visualized several ways — see [Run history & reports](#run-history--reports).

## Sampling & the ship gate

A single LLM-judge score can't carry the promise that "a skill ships only when it clearly beats the baseline" — the judges are noisy. So the eval does two things ([`scripts/gate.js`](../scripts/gate.js)):

1. **Samples each cell `EVAL_SAMPLES` times** (default 3, via promptfoo `--repeat`) so every score is a distribution, reported as `mean±sd`. A large `±sd` means the cell is noisy — raise `EVAL_SAMPLES` before trusting it.
2. **Gates on the pooled distribution.** For each skill the **with-skill** column must, on the neutral (Opus) judge:
   - clear an absolute floor — mean ≥ `EVAL_MIN_QUALITY` (default 0.7), **and**
   - beat the **no-skill** baseline by ≥ `EVAL_MIN_MARGIN` (default 0.1).
   - If it clears both but the scores are too spread out (stdev > `EVAL_MAX_STDEV`, default 0.15) the verdict is **WARN** — sample more rather than believe the mean.
   - Tool-routing skills (no rubric) gate structurally instead: every with-skill check must pass.

`make eval` prints an **EVAL GATE** table and **exits non-zero on any FAIL**, so the gate blocks locally. For exploration, `node scripts/eval.js --no-gate` runs and reports without failing. All four knobs live in `.env` (see `.env.example`).

The promptfoo response cache (kept in the repo via `PROMPTFOO_CONFIG_DIR`) stays **on**, so reruns of unchanged cells are served from disk and don't re-pay for known-good/known-bad columns; only the `--repeat` samples are fresh calls.

## Run history & reports

Every run is captured several ways, from richest-but-local to committable-and-diffable. All of it is free and local — nothing leaves your machine.

| View | Command | What it's for | Tracked in git? |
| --- | --- | --- | --- |
| **Interactive web UI** | `npm run eval:view` | Browse every past run, diff columns side by side, read each judge's reasoning. | No — SQLite store in `.promptfoo/` (gitignored) |
| **Markdown snapshot** | written by `npm run eval` → `reports/eval/REPORT.md` | The latest run's gate + heatmap + leaderboard as GitHub-rendered tables, stamped with commit SHA. | **Yes** |
| **History ledger** | appended by `npm run eval` → `reports/eval/history.jsonl` | One summary line per run (gate counts, per-model scores). | **Yes** |
| **Trend table** | `npm run eval:trend` → `reports/eval/TREND.md` | Neutral-judge score per model across the last N runs — the drift view. | **Yes** |

How it fits together:

- **`npm run eval`** writes per-run JSON to `reports/eval/runs/` (gitignored, wiped each run), then regenerates `REPORT.md` and appends one line to `history.jsonl`. Commit those two to keep run history in git.
- **`npm run eval:trend`** reads `history.jsonl` and writes `TREND.md`. Pass a count to change the window: `node scripts/eval-trend.js 30`.
- **`make leaderboard`** (`node scripts/eval.js --report`) re-renders `REPORT.md` from the saved `runs/` JSON **without** re-running models — and does *not* append to the ledger.
- **`npm run eval:view`** reads promptfoo's own SQLite store. Set `PROMPTFOO_CONFIG_DIR=.promptfoo` in `.env` so the store lives in the repo and the UI shows the same runs `npm run eval` recorded.

## Models

promptfoo calls each model provider **directly**, reading that provider's API key from `.env`. Set only the keys your model list uses:

```bash
cp .env.example .env
# ANTHROPIC_API_KEY=...    # anthropic:messages:* runners + the primary judge
# OPENAI_API_KEY=...       # openai:chat:* runners + the secondary judge
# GOOGLE_API_KEY / AWS_*   # only if you add google:* / bedrock:* models
# PROMPTFOO_CONFIG_DIR=.promptfoo  # keep promptfoo's run store + cache in the repo
```

Two shared model roles are defined once and imported by every config via `file://`. Each entry is a **native promptfoo provider id** whose prefix selects the provider (and which key it reads): `anthropic:messages:…`, `openai:chat:…`, `google:…`, `bedrock:…`.

- **runners** — the models under test, in [`promptfoo.base.yaml`](promptfoo.base.yaml). Add a line to run the suite against another model (the BYOM matrix). For Bedrock, install the SDK once: `npm i -D @aws-sdk/client-bedrock-runtime`.
- **judges** — the two-model panel that grades `llm-rubric` assertions, in [`judge-primary.yaml`](judge-primary.yaml) and [`judge-secondary.yaml`](judge-secondary.yaml). Different model families on purpose, so they don't share blind spots; judge with a family different from the runner under test to avoid self-preference bias.

Each provider bills on its own dashboard — there is no combined spend log.

## Config shape

Everything for a skill lives in its folder. A flat skill at `skills/<name>/` references the shared `evals/` files two levels up (a grouped skill at `skills/<category>/<name>/` uses `../../../evals/`):

```yaml
providers: file://../../evals/promptfoo.base.yaml   # runner models
prompts:                                            # the two comparison columns
  - { id: "file://../../evals/load-prompt.cjs:skillBaseline", label: no-skill }
  - { id: "file://../../evals/load-prompt.cjs:withSkill",     label: with-skill }
defaultTest:
  vars: { skillPath: skills/<name>/SKILL.md }
  assert:
    - { type: llm-rubric, value: <rubric>, provider: file://../../evals/judge-primary.yaml }
    - { type: llm-rubric, value: <rubric>, provider: file://../../evals/judge-secondary.yaml }
tests:
  - description: <case-id>
    vars: { question: "..." }
```

- **`load-prompt.cjs`** is the glue between promptfoo and the repo: it reads the real `SKILL.md` off disk and builds the comparison columns, so the eval tests the actual skill, never a copy. `skillPath` resolves from the repo root (the npm scripts run from there).
- **The no-skill / tool-baseline columns are expected to fall short.** The gap is the skill's value; the with-skill column is the one that must pass the gate.

### Eval shapes

| Skill kind | Loader exports | What it proves |
| --- | --- | --- |
| knowledge skill (e.g. `commit-message`) | `skillBaseline`, `withSkill` + `llm-rubric` | the skill makes answers concrete and correct |
| tool-routing skill | `toolBaseline`, `toolSkill` + `is-json` + [`assert-tool.cjs`](assert-tool.cjs) | the skill routes the request to the right tool with the right args |

## Add an eval

Copy the `promptfooconfig.yaml` from a similar skill, point `skillPath` at yours, and edit `tests:`. Then run it:

```bash
npx promptfoo eval -c skills/<name>/promptfooconfig.yaml
```

For a slower walkthrough, use [GETTING-STARTED.md](GETTING-STARTED.md).
