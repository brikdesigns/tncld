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
PURGE_BASE="https://purge.jsdelivr.net/gh/${REPO}@${BRANCH}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# ---- Step 3: Purge CDN cache ----
echo ""
echo "Purging jsDelivr cache..."
for file in "${FILES[@]}"; do
  result=$(curl -s "${PURGE_BASE}/${file}")
  status=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "unknown")
  if [ "$status" = "finished" ]; then
    echo -e "  ${GREEN}✓${NC} ${file}"
  else
    echo -e "  ${YELLOW}⚠${NC} ${file} (status: ${status})"
  fi
done

# ---- Step 4: Verify CDN content ----
echo ""
echo "Waiting for CDN propagation..."
sleep 5

echo "Verifying CDN content..."
ALL_VERIFIED=true
for file in "${FILES[@]}"; do
  # Compare first 5 non-empty lines of local vs CDN
  local_hash=$(head -20 "$file" | md5 2>/dev/null || head -20 "$file" | md5sum | cut -d' ' -f1)
  cdn_hash=$(curl -s "${CDN_BASE}/${file}" | head -20 | md5 2>/dev/null || curl -s "${CDN_BASE}/${file}" | head -20 | md5sum | cut -d' ' -f1)

  if [ "$local_hash" = "$cdn_hash" ]; then
    echo -e "  ${GREEN}✓${NC} ${file} — CDN matches local"
  else
    echo -e "  ${RED}✗${NC} ${file} — CDN may be stale"
    ALL_VERIFIED=false
  fi
done

if [ "$ALL_VERIFIED" = false ]; then
  echo ""
  echo -e "${YELLOW}Some files may still be cached. Options:${NC}"
  echo "  1. Wait 30s and re-run: bash deploy.sh"
  echo "  2. Test with raw GitHub URL (no caching):"
  echo "     https://raw.githubusercontent.com/${REPO}/${BRANCH}/header.css"
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
echo -e "${GREEN}${BOLD}Deploy complete!${NC}"
echo "  Commit: ${COMMIT}"
echo "  CDN:    ${CDN_BASE}/header.css"
echo ""
echo -e "${YELLOW}${BOLD}Remember: Hard-refresh your browser (Cmd+Shift+R)${NC}"
echo "  Browser caches jsDelivr files for up to 7 days."
echo "  Cmd+Shift+R forces a fresh download."
echo "================================"
echo ""
