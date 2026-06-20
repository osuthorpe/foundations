# foundations — asset catalog tasks.
# Run `make` (or `make help`) to list targets. Thin wrappers over the npm
# scripts and the Desktop packager so everything is one command.

# promptfoo needs Node ^20.20.0 || >=22.22.0 (see .nvmrc / package.json engines).
# Recipes run in bash so the eval targets can source nvm and `nvm use` the
# .nvmrc version automatically — no manual `nvm use` needed. No-ops if nvm is
# absent, leaving the current Node in place.
SHELL := /bin/bash
NVM_USE := export NVM_DIR="$${NVM_DIR:-$$HOME/.nvm}"; [ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh" && nvm use >/dev/null || true

.DEFAULT_GOAL := help
.PHONY: help install index check fix eval eval-one eval-view eval-trend leaderboard package clean ci all

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "} {printf "  \033[36m%-13s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies (run once)
	npm install

index: ## Regenerate prompts/INDEX.md and ASSETS.md from frontmatter
	npm run index

check: ## Lint all asset frontmatter + verify the generated files are fresh (offline, no key)
	npm run check

fix: index check ## Regenerate the generated files, then validate

eval: ## Run promptfoo evals (auto-selects Node via nvm; needs provider keys in .env)
	@$(NVM_USE); npm run eval

eval-one: ## Re-run ONE asset + plain-English per-model before/after (CONFIG=prompts/writing/summarize)
	@test -n "$(CONFIG)" || { echo "Usage: make eval-one CONFIG=prompts/<area>/<name>"; exit 1; }
	@$(NVM_USE); node scripts/eval-one.js "$(CONFIG)"

eval-view: ## Open the promptfoo results UI (auto-selects Node via nvm)
	@$(NVM_USE); npm run eval:view

eval-trend: ## Render the score trend across runs (writes reports/eval/TREND.md)
	@$(NVM_USE); npm run eval:trend

leaderboard: ## Re-render leaderboard + REPORT.md from saved reports/eval/runs/ (no re-run)
	@$(NVM_USE); node scripts/eval.js --report

package: ## Build the Claude Desktop / claude.ai skill zips into dist/
	bash package-claude-desktop.sh

clean: ## Remove build artifacts (dist/)
	rm -rf dist

ci: install check ## What CI runs: install, then strict check (fails on stale index or bad frontmatter)

all: install index check ## Set up, regenerate, and validate everything
