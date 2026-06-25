#!/usr/bin/env bash
#
# bootstrap.sh - one-time setup for a new project cloned from this boilerplate.
#
# It asks you a few questions, wipes the boilerplate's git history, starts a
# fresh repo, fills in package.json / README.md / AGENTS.md, installs
# dependencies, and stages everything ready for your first commit. When it
# finishes successfully it deletes itself.

# Stop immediately if any command fails (-e), if an unset variable is used
# (-u), or if any command in a pipeline fails (pipefail). Because of -e the
# script only reaches the final self-delete step when every step succeeded.
set -euo pipefail

# Always work from the directory the script lives in, no matter where it is
# called from.
cd "$(dirname "$0")"

# ---------------------------------------------------------------------------
# Step 1: Ask the user for project details.
# ---------------------------------------------------------------------------

# Project name is required. Keep asking until we get a non-empty answer.
# (read -r stops backslashes being treated specially; -p prints the prompt.)
PROJECT_NAME=""
while [ -z "$PROJECT_NAME" ]; do
  read -r -p "Project name: " PROJECT_NAME
  if [ -z "$PROJECT_NAME" ]; then
    echo "  Project name cannot be empty."
  fi
done

# Version is optional; if the user just presses Enter we default to 0.1.0.
read -r -p "Initial version [0.1.0]: " VERSION
VERSION="${VERSION:-0.1.0}"

# Description is optional and may be left blank.
read -r -p "Description (optional): " DESCRIPTION

# ---------------------------------------------------------------------------
# Step 2: Remove the boilerplate's git history.
# ---------------------------------------------------------------------------
# This is the clone's .git directory; deleting it discards the boilerplate's
# commit history so the new project starts clean.
echo "Removing boilerplate git history..."
rm -rf .git

# ---------------------------------------------------------------------------
# Step 3: Start a fresh git repository on the 'main' branch.
# ---------------------------------------------------------------------------
echo "Initializing new git repository on 'main'..."
# git init -b main needs Git 2.28+. If that fails (older Git), fall back to
# initializing first and then renaming the branch to main.
git init -b main >/dev/null 2>&1 || {
  git init >/dev/null
  git branch -M main
}

# ---------------------------------------------------------------------------
# Step 4: Write the project details into package.json.
# ---------------------------------------------------------------------------
# We use "pnpm pkg set" rather than hand-editing JSON: it updates the file
# safely without us having to parse JSON in shell.
echo "Updating package.json..."
pnpm pkg set "name=$PROJECT_NAME" "version=$VERSION"
# Only set the description if the user actually entered one.
if [ -n "$DESCRIPTION" ]; then
  pnpm pkg set "description=$DESCRIPTION"
fi

# ---------------------------------------------------------------------------
# Step 5: Install dependencies (creates node_modules).
# ---------------------------------------------------------------------------
echo "Installing dependencies (this can take a minute)..."
pnpm install

# ---------------------------------------------------------------------------
# Step 6: Replace README.md with a simple header.
# ---------------------------------------------------------------------------
# A here-document (<<EOF ... EOF) lets us write several lines into the file.
# Quotes are NOT used around EOF so that $PROJECT_NAME is expanded.
echo "Rewriting README.md..."
{
  echo "# $PROJECT_NAME"
  # Add a blank line and the description only if a description was given.
  if [ -n "$DESCRIPTION" ]; then
    echo ""
    echo "$DESCRIPTION"
  fi
} > README.md

# ---------------------------------------------------------------------------
# Step 7: Replace the "Project Overview" paragraph in AGENTS.md.
# ---------------------------------------------------------------------------
# AGENTS.md has a section like:
#
#   ## Project Overview
#
#   <one or more lines describing the project>
#
#   ## Development Commands
#
# We replace the text between "## Project Overview" and the next "## " heading
# with the description (or remove it entirely if no description was given).
# awk reads the file line by line; we use a flag to skip the old paragraph and
# print our replacement once.
echo "Updating AGENTS.md Project Overview..."
awk -v desc="$DESCRIPTION" '
  # When we reach the Project Overview heading, print it, then print the new
  # paragraph (if any), and start skipping the old paragraph lines.
  /^## Project Overview/ {
    print               # keep the heading itself
    print ""            # blank line after the heading
    if (desc != "") {
      print desc        # the new description paragraph
      print ""          # blank line after it
    }
    skip = 1            # turn on skipping of the old paragraph
    next
  }
  # Stop skipping as soon as we hit the next "## " heading, and print it.
  skip && /^## / {
    skip = 0
    print
    next
  }
  # While skipping, drop the old paragraph lines.
  skip { next }
  # Everything else is printed unchanged.
  { print }
' AGENTS.md > AGENTS.md.tmp && mv AGENTS.md.tmp AGENTS.md

# ---------------------------------------------------------------------------
# Step 8: Stage all files except this script.
# ---------------------------------------------------------------------------
# git add -A stages everything not ignored by .gitignore (node_modules, etc.
# are already ignored). We then unstage this script so it is not committed.
echo "Staging files..."
git add -A
git reset -q -- bootstrap.sh

# ---------------------------------------------------------------------------
# Step 9: Reminders for the user.
# ---------------------------------------------------------------------------
echo ""
echo "Project initialized!"
echo "Don't forget to check and/or revise the following files:"
echo "  - package.json"
echo "  - README.md"
echo "  - AGENTS.md"
echo "  - .github/dependabot.yml"
echo "  - .node-version"
echo ""
echo "When ready, make the initial commit:"
echo "    git commit -m \"initial commit\""

# ---------------------------------------------------------------------------
# Step 10: Delete this script.
# ---------------------------------------------------------------------------
# Reaching this line means every step above succeeded (thanks to set -e).
# "$0" is the path to this script; remove it so it is not left in the new
# project.
rm -- "$0"
