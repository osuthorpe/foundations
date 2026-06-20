# Local LiteLLM gateway

The promptfoo evals route every model call through a LiteLLM gateway (one key, one
spend log — see [../evals/README.md](../evals/README.md)). This folder runs that
gateway locally with Docker so `npm run eval` has something to talk to at
`http://localhost:4000`.

Config (provider keys, master key, dashboard login) lives in the **repo-root**
`.env` — the same file promptfoo reads. There is no separate env file here;
`make gateway` passes it to compose with `--env-file ../.env`.

## One-time setup

From the repo root:

```bash
cp .env.example .env          # then fill in (see the gateway section of .env):
                              #   LITELLM_MASTER_KEY  (any "sk-..." string you choose)
                              #   ANTHROPIC_API_KEY   (runner + primary judge)
                              #   OPENAI_API_KEY      (secondary judge)
                              #   GEMINI_API_KEY      (only for the optional runner)
make gateway                  # gateway + Postgres; first pull takes a minute
```

Check it's up: `curl http://localhost:4000/health/liveliness` (should return `"I'm alive!"`).

## Issue a virtual key

1. Open `http://localhost:4000/ui` and log in (UI_USERNAME / UI_PASSWORD from `.env`, default `admin` / `admin`, or the master key).
2. **Virtual Keys → Create New Key**. Grant it the models the suite uses:
   `claude-sonnet-4-6`, `claude-opus-4-8`, `gpt-5.5` (+ `gemini/gemini-2.5-pro`
   or any `bedrock-*` model you enabled).
3. Copy the `sk-...` key (shown once).

## Point the evals at it

Set `LITELLM_API_KEY` in the repo-root `.env` to the virtual key from step 3
(`LITELLM_BASE_URL` is already `http://localhost:4000`). Then from the repo root:
`make eval` (or `npm run eval`).

## Models

The model map lives in [litellm-config.yaml](litellm-config.yaml). The `model_name`
values match what the eval configs request via `litellm:chat:<name>`. To test
another model, add a row here and a matching row in
[../evals/promptfoo.base.yaml](../evals/promptfoo.base.yaml).

**Add models here, not in the dashboard.** The `/ui` can register models too, but
those live only in Postgres — they aren't version-controlled and vanish if the
volume is wiped. Keeping the map in `litellm-config.yaml` is the canonical path;
the dashboard's only required job is issuing the virtual key.

### AWS Bedrock

Bedrock lets you serve additional models from your own AWS account. It's wired
the same way as the other providers, plus AWS credentials:

1. **Enable model access** — Bedrock console → *Model access* → request/enable
   each model you want, in the region you'll use. (Bedrock denies models you
   haven't explicitly enabled, per region.)
2. **Set credentials in the repo-root `.env`** — either static keys
   (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, optional `AWS_SESSION_TOKEN`)
   and `AWS_REGION_NAME`, or leave the keys blank and run under an IAM role /
   instance profile (boto3's default credential chain). `docker-compose.yml`
   passes all of these into the gateway.
3. **Add the model** to [litellm-config.yaml](litellm-config.yaml) as
   `model: bedrock/<modelId-or-inference-profile-id>`. Use the exact id for your
   region — list them with:
   ```sh
   aws bedrock list-foundation-models --region <region> --query 'modelSummaries[].modelId'
   ```
   A `bedrock-claude-sonnet` example (commented siblings for others) is already
   in the config; swap in your real id.
4. **Put it in the matrix** — uncomment the matching `litellm:chat:bedrock-...`
   line in [../evals/promptfoo.base.yaml](../evals/promptfoo.base.yaml), and grant
   the new `model_name` to your virtual key (next section).

No AWS keys = no problem if you don't add a `bedrock/*` model; the vars are
optional and unused otherwise.

## Manage

`make gateway-stop` stops it. For anything else, run compose from this folder
with the root env file (compose evaluates `.env` even for `down`/`logs`):

```bash
cd gateway
docker compose --env-file ../.env logs -f litellm   # tail logs
docker compose --env-file ../.env down              # stop (keeps the Postgres volume + issued keys)
docker compose --env-file ../.env down -v           # stop and wipe the database
```
