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
CDN_BASE="https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}"
# Purge + verify now live in scripts/purge-cdn.sh (shared with CI).

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
echo -e "${GREEN}✓${NC} Pushed (commit: ${COMMIT})"

# ---- Steps 3 + 4: Purge and verify the CDN ----
# Shared with .github/workflows/purge-cdn.yml so the check lives in one place.
# Exits non-zero if the CDN never serves the local content (set -e stops here).
echo ""
bash "$(dirname "$0")/scripts/purge-cdn.sh" "${FILES[@]}"

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
echo -e "${GREEN}${BOLD}Deploy complete!${NC}"
echo "  Commit: ${COMMIT}"
echo "  CDN:    ${CDN_BASE}/header.css"
echo ""
echo -e "${YELLOW}${BOLD}Remember: Hard-refresh your browser (Cmd+Shift+R)${NC}"
echo "  Browser caches jsDelivr files for up to 7 days."
echo "  Cmd+Shift+R forces a fresh download."
echo "================================"
echo ""
