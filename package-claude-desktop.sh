#!/usr/bin/env bash
# Package skills installable in Claude Desktop / claude.ai (Settings →
# Capabilities → Skills → Upload skill) into dist/<name>.zip.
#
# WHICH skills get packaged is not hardcoded: the script asks the frontmatter.
# Every skill whose `consumers` list includes `desktop-zip` is built. Each is
# staged generically (its SKILL.md plus any data subdirectories); README.md and
# promptfooconfig.yaml are repo-only and not shipped.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

rm -rf "$REPO_ROOT/dist"

# Discover desktop-zip skills from their `consumers` frontmatter.
# (while-read rather than mapfile, for macOS's bundled bash 3.2.)
FOLDERS=()
while IFS= read -r line; do
  [ -n "$line" ] && FOLDERS+=("$line")
done < <(node "$REPO_ROOT/scripts/list-skills.js" desktop-zip)
if [ "${#FOLDERS[@]}" -eq 0 ]; then
  echo "No skills declare consumer 'desktop-zip' — nothing to package."
  exit 0
fi

# Stage one skill generically: its SKILL.md plus any data subdirectories.
# README.md and promptfooconfig.yaml are repo-only and not shipped.
stage_generic() {
  local src="$1" stage="$2"
  mkdir -p "$stage"
  cp "$src/SKILL.md" "$stage/SKILL.md"
  for entry in "$src"/*/; do
    # strip the trailing slash so cp -R copies the dir itself (stage/<name>),
    # not just its contents
    [ -d "$entry" ] && cp -R "${entry%/}" "$stage/"
  done
  find "$stage" -name ".DS_Store" -delete
}

for folder in "${FOLDERS[@]}"; do
  name="$(basename "$folder")"
  src="$REPO_ROOT/$folder"
  stage="$REPO_ROOT/dist/$name"

  stage_generic "$src" "$stage"

  (cd "$REPO_ROOT/dist" && zip -rq "$name.zip" "$name")
  zip="$REPO_ROOT/dist/$name.zip"
  echo "Built: $zip ($(unzip -l "$zip" | tail -1 | awk '{print $2}') files)"
done

echo "Install: claude.ai / Claude Desktop → Settings → Capabilities → Skills → Upload skill"
