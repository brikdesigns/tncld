#!/bin/bash
# =============================================
#  TNCLD - Deploy Custom Code to jsDelivr CDN
# =============================================
#  Usage: bash deploy.sh
#  Or:    npm run deploy:cdn
#
#  What it does:
#  1. Detects uncommitted changes to header.css / footer.js
#  2. Commits and pushes to main
#  3. Purges jsDelivr CDN cache
#  4. Verifies CDN is serving the new version
#  5. Optionally publishes Webflow site
# =============================================

set -e

REPO="brikdesigns/tncld"
BRANCH="main"
FILES=("header.css" "footer.js")
# Pinned to the pushed commit, NOT @main — the site loads a SHA-pinned URL and
# @main is unsafe to serve from (tncld#33). Set after the push, once HEAD is
# the commit being shipped. Verify lives in scripts/verify-live-assets.sh
# (shared with CI).
CDN_BASE=""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}TNCLD Deploy${NC}"
echo "================================"

# ---- Step 1: Check for uncommitted changes ----
CHANGED_FILES=()
for file in "${FILES[@]}"; do
  if ! git diff --quiet "$file" 2>/dev/null || ! git diff --cached --quiet "$file" 2>/dev/null; then
    CHANGED_FILES+=("$file")
  fi
done

if [ ${#CHANGED_FILES[@]} -gt 0 ]; then
  echo -e "${YELLOW}Uncommitted changes:${NC} ${CHANGED_FILES[*]}"
  read -p "Commit and push? (y/n): " confirm
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    read -p "Commit message: " msg
    git add "${CHANGED_FILES[@]}"
    git commit -m "$msg"
  else
    echo "Aborting."
    exit 1
  fi
else
  echo -e "${GREEN}✓${NC} No uncommitted changes"
fi

# ---- Step 2: Push to remote ----
echo ""
echo "Pushing to origin/${BRANCH}..."
git push origin ${BRANCH} 2>&1 | tail -1
COMMIT=$(git rev-parse --short HEAD)
# Full 40-char SHA: short hashes resolve on jsDelivr but are not what the
# Webflow tags should carry.
CDN_BASE="https://cdn.jsdelivr.net/gh/${REPO}@$(git rev-parse HEAD)"
echo -e "${GREEN}✓${NC} Pushed (commit: ${COMMIT})"

# ---- Steps 3 + 4: Verify the live site serves these assets ----
# Shared with .github/workflows/verify-live-assets.yml so the check lives in
# one place. There is no purge step any more: the Webflow URLs are pinned to a
# commit SHA, which jsDelivr caches immutably (tncld#33/#34).
#
# This is EXPECTED to fail here on an asset change — the pin has not been
# bumped yet, and the paste is a human step that cannot happen before this
# script ends. An `if` condition is exempt from set -e, so the run continues
# to print the paste instructions instead of dying here.
echo ""
if bash "$(dirname "$0")/scripts/verify-live-assets.sh" "${FILES[@]}"; then
  LIVE_VERIFIED=true
else
  LIVE_VERIFIED=false
fi

# ---- Step 5: Optional Webflow publish ----
echo ""
read -p "Publish Webflow site? (y/n): " publish
if [ "$publish" = "y" ] || [ "$publish" = "Y" ]; then
  if [ -f .env ]; then
    source .env
  fi
  if [ -n "$WEBFLOW_API_TOKEN" ] && [ -n "$WEBFLOW_SITE_ID" ]; then
    echo "Publishing Webflow site..."
    pub_result=$(curl -s -X POST "https://api.webflow.com/v2/sites/${WEBFLOW_SITE_ID}/publish" \
      -H "Authorization: Bearer ${WEBFLOW_API_TOKEN}" \
      -H "Content-Type: application/json")
    echo -e "${GREEN}✓${NC} Webflow publish triggered"
  else
    echo -e "${YELLOW}⚠${NC} Missing WEBFLOW_API_TOKEN or WEBFLOW_SITE_ID in .env"
    echo "  Publish manually from Webflow dashboard."
  fi
else
  echo "Skipping Webflow publish."
fi

# ---- Summary ----
echo ""
echo "================================"
if [ "$LIVE_VERIFIED" = true ]; then
  echo -e "${GREEN}${BOLD}Deploy complete.${NC} The live site serves this commit."
  echo "  Commit: ${COMMIT}"
else
  echo -e "${YELLOW}${BOLD}Pushed — but NOT live yet.${NC}"
  echo "  Commit: ${COMMIT}"
  echo ""
  echo "  The Webflow URLs are pinned to a commit SHA, so pushing to main does"
  echo "  not reach the site. Paste these into Site settings > Custom Code,"
  echo "  then Publish:"
  echo ""
  echo "    <link rel=\"stylesheet\" href=\"${CDN_BASE}/header.css\">"
  echo "    <script src=\"${CDN_BASE}/footer.js\"></script>"
  echo ""
  echo "  Then confirm it actually shipped:"
  echo "    bash scripts/verify-live-assets.sh"
fi
echo "================================"
echo ""

# "Pushed but not live" is not success. Exiting 0 here would be the same lie
# the old @main gate told — green while the site served something else.
[ "$LIVE_VERIFIED" = true ] || exit 1
