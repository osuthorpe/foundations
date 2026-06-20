# Adding a test — a plain-language guide

You don't need to be a programmer to make these AI assets better. If you know what a *good answer* looks like, you can write tests. This guide assumes zero technical background and walks you through everything.

## What is all this, in plain English?

- A **skill** is a cheat sheet we give the AI — a document that teaches it how to do something well (how to write a commit message, how to review an AI product for trust, …).
- An **eval** is a quiz that proves the cheat sheet actually helps. Each quiz question asks the AI the same thing two ways — *without* the skill and *with* it — and a second AI (the "judge") checks that the with-skill answer is meaningfully better. If it isn't, the test fails, and that's the point: it tells us the skill needs work.

We run these quizzes with a standard tool called **promptfoo**. The quiz questions live in a file named `promptfooconfig.yaml` inside each skill folder.

Your superpower: **you know what a good answer looks like.** Writing those examples down is the most valuable contribution anyone can make here.

## One-time setup (about 10 minutes)

You'll use **Terminal** — the app where you type commands. On a Mac, press `Cmd + Space`, type `Terminal`, press Enter.

1. **Get the tools.** Install **GitHub Desktop** (desktop.github.com) and **Node.js** (nodejs.org — click the big green "LTS" button and run the installer).
2. **Get the project.** Open GitHub Desktop → File → Clone Repository → pick `osuthorpe/foundations`. Remember the folder it saves to (usually `Documents/GitHub/foundations`).
3. **Open the project in Terminal.** Copy-paste this and press Enter:

   ```bash
   cd ~/Documents/GitHub/foundations
   ```

4. **Install once.** Copy-paste this and press Enter (it downloads promptfoo):

   ```bash
   npm install
   ```

> Any time this guide says "run" something, it means: paste it into Terminal and press Enter, from inside the foundations folder (step 3).

## What a quiz file looks like

Open a file like `skills/commit-message/promptfooconfig.yaml` in any text editor (TextEdit works; VS Code is nicer). Near the bottom you'll find a `tests:` section — that's the list of quiz questions. Each one looks like this:

```yaml
tests:
  # Bug fix with a clear cause — treatment should pick `fix` and explain the why.
  - description: "commit-message-bugfix-001"
    vars: {"question":"Write a commit message for this change: ..."}
```

Three parts, all just text:

| Part | What it is | Rules |
| --- | --- | --- |
| the `#` line | A note on why this question is a good test | Plain English, one line — what should our version add to the answer? |
| `description` | A unique name for this question | In quotes. Lowercase with dashes, ending in a number nobody used: `commit-message-revert-003` |
| `vars` | The actual question (and any inputs) | The text inside the quotes is what a real user would type |

**A note on YAML:** keep each entry lined up under the one above it — the indentation is what groups it.

## Add your own question

1. Find the `tests:` section in the file for the skill you care about.
2. Copy the last `- description:` block (the `#` note line and the two lines under it) and paste it below, keeping the same indentation.
3. Change the `description` to a new unique name, and change the question inside `vars` to the new thing you'd ask the AI.
4. Save the file.
5. Check you didn't break the format — run (swap in your file's path):

   ```bash
   npx promptfoo validate config -c skills/commit-message/promptfooconfig.yaml
   ```

   `Configuration is valid.` means you're good. If it complains, it usually points at a missing quote or a line that's indented wrong. Fix and re-run.

**What makes a great question:** something where generic AI knowledge isn't enough — a case where the skill should clearly change the answer.

## Saving and sharing your work

Open GitHub Desktop. It will show the file you changed. Write a one-line summary (e.g. "Add eval question for revert commits"), click **Commit**, then **Push origin**, then **Create Pull Request**.

## Things to leave alone (for now)

- Files ending in `.cjs` — that's the machinery that builds the quizzes.
- The `providers:`, `prompts:`, and `defaultTest:` sections at the top of a config — they wire up which models run and how answers are graded (the `prompts:` block here just names the two comparison columns, no/with skill). The `tests:` section is the part you edit.
- Actually *running* the full quiz (`npm run eval`) calls the AI and needs an access key. Then `npm run eval:view` opens a web page where you can read every answer side by side with a ✓ or ✗ and the judge's reasoning.

## Mini-glossary

| Word | Means |
| --- | --- |
| Eval | A quiz that proves a cheat sheet or prompt actually helps the AI |
| Case / test | One question in the quiz (a `- description:` entry) |
| Skill | A cheat sheet teaching the AI how to do something |
| Variant | One column of the comparison — no-skill vs with-skill |
| Judge | A second AI that scores the answers against the rubric |
| Rubric | The point-by-point definition of a good answer (in the config's `llm-rubric`) |
| promptfoo | The standard tool that runs the quizzes |
| YAML | The indent-based file format the quizzes are written in |

## Stuck?

Run `npx promptfoo validate config -c <your file>` first — it explains most problems in plain language.
