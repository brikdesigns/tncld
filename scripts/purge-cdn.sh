#!/bin/bash
# =============================================
#  TNCLD - Purge + verify the jsDelivr CDN
# =============================================
#  Usage: bash scripts/purge-cdn.sh [file ...]
#         (defaults to header.css footer.js)
#
#  Exits non-zero if the CDN is not serving the local content by the
#  deadline. Both deploy.sh and .github/workflows/purge-cdn.yml call this,
#  so the check exists in exactly one place.
#
#  Why this is more than a curl to the purge endpoint (tncld#30):
#
#  1. It hashes the WHOLE file. The previous check hashed `head -20`, which
#     on header.css is a static comment banner — byte-identical across
#     almost every change. It printed "CDN matches" while serving stale CSS.
#
#  2. It waits for the GitHub origin to serve the new bytes BEFORE purging.
#     Purging while raw.githubusercontent.com still has the old file just
#     re-caches the old file. On the run that prompted this, the purge fired
#     6s after the merge commit landed.
#
#  3. It fails the build instead of printing a warning.
#
#  Known limit: a purge is global but a verify only observes the ONE edge
#  this runner is routed to. A pass means that edge is clean, not that every
#  edge is. Browsers on other continents may lag; that is why the retry loop
#  re-purges rather than only re-reading.
# =============================================

set -uo pipefail

REPO="brikdesigns/tncld"
BRANCH="main"
CDN_BASE="https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}"
PURGE_BASE="https://purge.jsdelivr.net/gh/${REPO}@${BRANCH}"
RAW_BASE="https://raw.githubusercontent.com/${REPO}/${BRANCH}"

# Total seconds to keep trying before failing, and the gap between attempts.
DEADLINE_SECONDS="${PURGE_DEADLINE_SECONDS:-180}"
ORIGIN_DEADLINE_SECONDS="${ORIGIN_DEADLINE_SECONDS:-90}"
SLEEP_SECONDS=15

FILES=("$@")
if [ ${#FILES[@]} -eq 0 ]; then
  FILES=("header.css" "footer.js")
fi

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

# Portable: macOS has shasum, Ubuntu has both.
hash_stdin() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 | cut -d' ' -f1
  else
    sha256sum | cut -d' ' -f1
  fi
}

hash_url() {
  # Download to a file rather than a variable: $(curl ...) strips trailing
  # newlines, so a body-vs-file comparison would never match. An empty body
  # or a non-200 must not hash equal to anything real.
  local tmp
  tmp=$(mktemp) || return 1
  if ! curl -fsS --max-time 30 -o "$tmp" "$1" 2>/dev/null || [ ! -s "$tmp" ]; then
    rm -f "$tmp"
    return 1
  fi
  hash_stdin < "$tmp"
  rm -f "$tmp"
}

fail=0

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "  ${RED}✗${NC} ${file} — not found in the working tree"
    fail=1
    continue
  fi

  want=$(hash_stdin < "$file")
  echo ""
  echo "${file} — want sha256 ${want:0:12}"

  # ---- 1. Wait for the GitHub origin, so the purge cannot re-cache stale ----
  origin_ok=false
  origin_elapsed=0
  while [ "$origin_elapsed" -lt "$ORIGIN_DEADLINE_SECONDS" ]; do
    got=$(hash_url "${RAW_BASE}/${file}") || got="unreadable"
    if [ "$got" = "$want" ]; then
      origin_ok=true
      echo -e "  ${GREEN}✓${NC} origin serving the new bytes (${origin_elapsed}s)"
      break
    fi
    sleep "$SLEEP_SECONDS"
    origin_elapsed=$((origin_elapsed + SLEEP_SECONDS))
  done

  if [ "$origin_ok" = false ]; then
    echo -e "  ${RED}✗${NC} origin never served this content within ${ORIGIN_DEADLINE_SECONDS}s"
    echo "     Local file differs from ${RAW_BASE}/${file} — is the commit pushed?"
    fail=1
    continue
  fi

  # ---- 2. Purge, then verify. Re-purge each round: one purge is not a promise ----
  cdn_ok=false
  elapsed=0
  while [ "$elapsed" -lt "$DEADLINE_SECONDS" ]; do
    status=$(curl -fsS --max-time 30 "${PURGE_BASE}/${file}" 2>/dev/null \
             | python3 -c 'import sys,json; print(json.load(sys.stdin).get("status","unknown"))' 2>/dev/null \
             || echo "unreachable")
    got=$(hash_url "${CDN_BASE}/${file}") || got="unreadable"

    if [ "$got" = "$want" ]; then
      cdn_ok=true
      echo -e "  ${GREEN}✓${NC} CDN matches after ${elapsed}s (purge: ${status})"
      break
    fi

    echo -e "  ${YELLOW}…${NC} ${elapsed}s — CDN has ${got:0:12}, purge: ${status}"
    sleep "$SLEEP_SECONDS"
    elapsed=$((elapsed + SLEEP_SECONDS))
  done

  if [ "$cdn_ok" = false ]; then
    echo -e "  ${RED}✗${NC} CDN still stale after ${DEADLINE_SECONDS}s"
    fail=1
  fi
done

echo ""
if [ "$fail" -ne 0 ]; then
  echo -e "${RED}CDN verification FAILED.${NC} The site is serving old assets."
  echo "  Re-run this script; if it keeps failing, purge by hand and check:"
  echo "    curl -s ${PURGE_BASE}/header.css"
  echo "    curl -s ${CDN_BASE}/header.css | shasum -a 256"
  echo "  Do NOT pin the Webflow @main URLs to a commit hash as a workaround —"
  echo "  that trades a transient stale cache for a permanent one."
  exit 1
fi

echo -e "${GREEN}CDN verified${NC} for: ${FILES[*]}"
echo "  Browsers still hold their own 7-day copy — hard-refresh (Cmd+Shift+R)."
