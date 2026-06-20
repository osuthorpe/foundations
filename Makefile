# foundations — skills workbench tasks.
# Run `make` (or `make help`) to list targets. Thin wrappers over the npm scripts.

# promptfoo needs Node ^20.20.0 || >=22.22.0 (see .nvmrc / package.json engines).
# Recipes run in bash so the eval targets can source nvm and `nvm use` the
# .nvmrc version automatically — no manual `nvm use` needed. No-ops if nvm is
# absent, leaving the current Node in place.
SHELL := /bin/bash
NVM_USE := export NVM_DIR="$${NVM_DIR:-$$HOME/.nvm}"; [ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh" && nvm use >/dev/null || true

.DEFAULT_GOAL := help
.PHONY: help install check eval eval-one eval-view eval-trend leaderboard ci all

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "} {printf "  \033[36m%-13s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies (run once)
	npm install

check: ## Lint all asset frontmatter (offline, no key)
	npm run check

eval: ## Run promptfoo evals (auto-selects Node via nvm; needs provider keys in .env)
	@$(NVM_USE); npm run eval

eval-one: ## Re-run ONE skill + plain-English per-model before/after (CONFIG=skills/<name>)
	@test -n "$(CONFIG)" || { echo "Usage: make eval-one CONFIG=skills/<name>"; exit 1; }
	@$(NVM_USE); node scripts/eval-one.js "$(CONFIG)"

eval-view: ## Open the promptfoo results UI (auto-selects Node via nvm)
	@$(NVM_USE); npm run eval:view

eval-trend: ## Render the score trend across runs (writes reports/eval/TREND.md)
	@$(NVM_USE); npm run eval:trend

leaderboard: ## Re-render leaderboard + REPORT.md from saved reports/eval/runs/ (no re-run)
	@$(NVM_USE); node scripts/eval.js --report

ci: install check ## Install, then strict frontmatter check

all: install check ## Set up and validate everything
