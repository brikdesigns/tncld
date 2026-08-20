#!/bin/bash
# =============================================
#  TNCLD - Verify the assets the LIVE SITE loads
# =============================================
#  Usage: bash scripts/verify-live-assets.sh [file ...]
#         (defaults to header.css footer.js)
#
#  Reads the live page, extracts the URL it actually requests for each asset,
#  and fails if those bytes differ from this working tree. Replaces
#  scripts/purge-cdn.sh, which purged and verified `@main` — a URL the site
#  stopped loading when #33 pinned the Webflow custom code to a commit SHA.
#
#  Why this shape (tncld#37):
#
#  Three versions of this gate have now reported green while the site was
#  broken, each for a different reason:
#
#    head -20 hash (pre-#30)        stale bytes below line 20 went unseen
#    whole file, identity (#32)     browsers received a stale gzip variant
#    whole file, all encodings(#35) the site loads a different URL entirely
#
#  The common defect is that each version verified a URL chosen by the
#  script rather than the URL chosen by the site. This one derives the URL
#  from the live HTML, so there is no URL for the gate and the site to
#  disagree about. If the pin is never bumped, this goes red.
#
#  What it deliberately does NOT check:
#
#  - That the pinned ref equals HEAD. A docs-only commit moves HEAD without
#    changing either asset, and the pin is still correct. Content is the
#    thing that matters, so content is what is compared.
#
#  Known limits, both inherited from the previous gate and both still real:
#
#  - A fetch only observes the ONE jsDelivr edge this runner is routed to.
#    A pass means that edge is clean, not that every edge is. Pinned URLs
#    are immutable, so this is far weaker a concern than it was under @main.
#  - If curl has no brotli support (macOS system curl does not), the br
#    variant goes unchecked and the script says so.
# =============================================

set -uo pipefail

REPO="brikdesigns/tncld"
# Any page works — Webflow head/footer code is site-wide. The homepage is the
# least likely to be renamed or unpublished out from under this check.
LIVE_PAGE_URL="${LIVE_PAGE_URL:-https://tncld.com/}"

# The live page is a third-party surface (Webflow behind Cloudflare); one
# refused connection should not read as a broken deploy.
PAGE_ATTEMPTS="${PAGE_ATTEMPTS:-3}"
PAGE_RETRY_SECONDS="${PAGE_RETRY_SECONDS:-5}"

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

# Which Accept-Encoding variants to check. jsDelivr caches each separately
# (tncld#33). A pinned URL is immutable so the variants cannot drift apart
# the way @main's did, but checking all of them is what caught that bug and
# costs one request each.
ENCODINGS=("gzip" "identity")
if curl -V | grep -q brotli; then
  ENCODINGS+=("br")
else
  echo "note: this curl has no brotli support, so the br variant is unchecked."
fi

hash_url() {
  # $1 = url, $2 = Accept-Encoding value.
  # Download to a file rather than a variable: $(curl ...) strips trailing
  # newlines, so a body-vs-file comparison would never match. --compressed
  # makes curl decode the response, so the hash is of the decoded bytes the
  # browser would see. An empty body or a non-200 must not hash equal to
  # anything real.
  local tmp
  tmp=$(mktemp) || return 1
  if ! curl -fsS --compressed --max-time 30 -H "Accept-Encoding: $2" \
       -o "$tmp" "$1" 2>/dev/null || [ ! -s "$tmp" ]; then
    rm -f "$tmp"
    return 1
  fi
  hash_stdin < "$tmp"
  rm -f "$tmp"
}

# Every configured encoding must match, else report the first that does not.
all_encodings_match() {
  local url="$1" want="$2" enc got
  for enc in "${ENCODINGS[@]}"; do
    got=$(hash_url "$url" "$enc") || got="unreadable"
    if [ "$got" != "$want" ]; then
      printf '%s:%s' "$enc" "${got:0:12}"
      return 1
    fi
  done
  return 0
}

# ---- Fetch the live page once; every file is extracted from this copy ----
PAGE=$(mktemp) || exit 1
trap 'rm -f "$PAGE"' EXIT

page_ok=false
attempt=1
while [ "$attempt" -le "$PAGE_ATTEMPTS" ]; do
  if curl -fsSL --max-time 30 -o "$PAGE" "$LIVE_PAGE_URL" 2>/dev/null && [ -s "$PAGE" ]; then
    page_ok=true
    break
  fi
  echo -e "  ${YELLOW}…${NC} could not read ${LIVE_PAGE_URL} (attempt ${attempt}/${PAGE_ATTEMPTS})"
  sleep "$PAGE_RETRY_SECONDS"
  attempt=$((attempt + 1))
done

if [ "$page_ok" = false ]; then
  echo -e "${RED}✗ Could not read the live page${NC} at ${LIVE_PAGE_URL}"
  echo "  This gate cannot tell a broken deploy from an unreachable site, so it"
  echo "  fails rather than guessing. Check the site is published and reachable."
  exit 1
fi

echo "Live page: ${LIVE_PAGE_URL}"

fail=0

for file in "${FILES[@]}"; do
  echo ""

  if [ ! -f "$file" ]; then
    echo -e "  ${RED}✗${NC} ${file} — not found in the working tree"
    fail=1
    continue
  fi

  # ---- 1. What URL does the live site request for this asset? ----
  # Anchored on the repo path so an unrelated jsdelivr reference cannot match.
  live_url=$(grep -oE "https://cdn\.jsdelivr\.net/gh/${REPO}@[^\"'[:space:]]+/${file}" "$PAGE" \
             | head -1)

  if [ -z "$live_url" ]; then
    echo -e "  ${RED}✗${NC} ${file} — the live page requests no jsDelivr URL for it"
    echo "     Searched ${LIVE_PAGE_URL} for cdn.jsdelivr.net/gh/${REPO}@<ref>/${file}"
    echo "     Either the Webflow custom code was removed, or it now points"
    echo "     somewhere this gate does not know about. Both are worth knowing."
    fail=1
    continue
  fi

  ref=$(printf '%s' "$live_url" | sed -E "s|.*/gh/${REPO}@([^/]+)/.*|\1|")
  echo "${file} — live site loads @${ref}"

  # ---- 2. A mutable ref is the bug this gate exists to catch ----
  if ! printf '%s' "$ref" | grep -qE '^[a-f0-9]{40}$'; then
    echo -e "  ${RED}✗${NC} not pinned to a 40-char commit SHA"
    echo "     A mutable ref (@main, a tag, a short SHA) reintroduces tncld#33:"
    echo "     jsDelivr caches each Accept-Encoding variant separately and a"
    echo "     purge does not clear them together, so browsers can be served"
    echo "     stale bytes while every curl-based check passes."
    fail=1
    continue
  fi

  # ---- 3. Do those exact bytes match this working tree? ----
  want=$(hash_stdin < "$file")
  if mismatch=$(all_encodings_match "$live_url" "$want"); then
    echo -e "  ${GREEN}✓${NC} matches this tree on ${ENCODINGS[*]} (sha256 ${want:0:12})"
  else
    echo -e "  ${RED}✗${NC} live site serves different bytes — ${mismatch}, want ${want:0:12}"
    echo "     ${live_url}"
    fail=1
  fi
done

echo ""
if [ "$fail" -ne 0 ]; then
  head_sha=$(git rev-parse HEAD 2>/dev/null || echo '<sha>')
  echo -e "${RED}Live-asset verification FAILED.${NC}"
  echo "  The site is not serving what is on this branch."
  echo ""
  echo "  Most likely cause: the pin was never bumped after the last asset"
  echo "  change. Paste these into Webflow > Site settings > Custom Code,"
  echo "  then Publish:"
  echo ""
  echo "    <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/gh/${REPO}@${head_sha}/header.css\">"
  echo "    <script src=\"https://cdn.jsdelivr.net/gh/${REPO}@${head_sha}/footer.js\"></script>"
  echo ""
  echo "  This is an operator step. GET /v2/sites/{id}/custom_code returns"
  echo "  403 invalid_auth_version on the site token — per Webflow's docs the"
  echo "  endpoint is App-only, so scripting it needs an OAuth App with"
  echo "  custom_code:write, which TNCLD does not have."
  echo "  https://developers.webflow.com/data/docs/working-with-custom-code"
  echo ""
  echo "  Then re-run:  bash scripts/verify-live-assets.sh"
  exit 1
fi

echo -e "${GREEN}Live assets verified${NC} for: ${FILES[*]}"
echo "  The URLs above are what tncld.com actually requests, pinned and immutable."
