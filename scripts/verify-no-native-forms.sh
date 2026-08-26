#!/bin/bash
# =============================================
#  TNCLD - Verify the live form pages carry NO native Webflow form
# =============================================
#  Usage: bash scripts/verify-no-native-forms.sh
#
#  Reads the live contact + request-appointment pages and fails if either
#  still serves a NATIVE Webflow form. TNCLD is a HIPAA covered entity; its
#  intake forms collect patient PHI and must post ONLY to the BAA-covered
#  GoHighLevel embed, never to Webflow's own form store (which is not BAA
#  covered and which emailed every submission in the clear).
#
#  Why this gate exists (tncld#98):
#
#  A GoHighLevel rollout added embed forms but left the original native
#  Webflow forms in place. Both captured in parallel for weeks; a real
#  patient's "reason for visit" landed in non-BAA Webflow storage and inbox
#  as recently as the day this was found. Removing the native forms is a
#  Webflow Designer edit with no code artifact, so nothing in the repo
#  guards against them being re-added or a Webflow republish restoring them.
#  This is that guard.
#
#  What it checks, per page:
#    1. NO native-form markers (wf-form-*, w-form wrapper/done/fail classes).
#       Their presence means Webflow is capturing again -> RED.
#    2. The GoHighLevel embed IS present (/widget/form/). Its absence means
#       the page has no working intake at all -> RED. A page that captures
#       nothing is as much a defect as one that captures to the wrong place.
#
#  Testing without live egress:
#    Set NATIVE_FORM_FIXTURES=<dir> to read <slug>.html from that dir instead
#    of fetching. scripts/fixtures/*.native-form.html and *.ghl-embed.html
#    exercise both branches. CI runs it live (GitHub Actions has no egress
#    guard); locally the ADR-036 egress guard blocks curl to tncld.com, so
#    use the fixture mode to exercise the detection logic.
# =============================================

set -uo pipefail

# slug -> live URL. Keep in sync with the pages that render an intake form.
PAGES=("contact" "request-appointment")
BASE_URL="${BASE_URL:-https://tncld.com}"

# The live page is a third-party surface (Webflow behind Cloudflare); one
# refused connection should not read as a broken deploy.
PAGE_ATTEMPTS="${PAGE_ATTEMPTS:-3}"
PAGE_RETRY_SECONDS="${PAGE_RETRY_SECONDS:-5}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

# Native Webflow form fingerprints. The GHL embed is an <iframe> and matches
# none of these; a native Webflow form matches at least the w-form wrapper.
NATIVE_MARKERS='wf-form-|class="[^"]*\bw-form\b|w-form-done|w-form-fail'
# The BAA-covered GoHighLevel intake embed. Domain-agnostic on purpose: the
# white-label host can change, the widget path does not.
EMBED_MARKER='/widget/form/'

# Fetch a page's HTML into $1 (a file). Honors NATIVE_FORM_FIXTURES for tests.
# Returns non-zero if the page could not be read.
fetch_page() {
  local slug="$1" out="$2"
  if [ -n "${NATIVE_FORM_FIXTURES:-}" ]; then
    local fx="${NATIVE_FORM_FIXTURES}/${slug}.html"
    [ -f "$fx" ] || { echo "  fixture missing: $fx"; return 1; }
    cp "$fx" "$out"
    return 0
  fi
  local attempt=1
  while [ "$attempt" -le "$PAGE_ATTEMPTS" ]; do
    if curl -fsSL --max-time 30 -o "$out" "${BASE_URL}/${slug}" 2>/dev/null && [ -s "$out" ]; then
      return 0
    fi
    echo -e "  ${YELLOW}…${NC} could not read ${BASE_URL}/${slug} (attempt ${attempt}/${PAGE_ATTEMPTS})"
    sleep "$PAGE_RETRY_SECONDS"
    attempt=$((attempt + 1))
  done
  return 1
}

fail=0
for slug in "${PAGES[@]}"; do
  echo ""
  page=$(mktemp) || exit 1

  if ! fetch_page "$slug" "$page"; then
    echo -e "  ${RED}✗${NC} ${slug} — could not read the page"
    echo "     This gate cannot tell a broken deploy from an unreachable site,"
    echo "     so it fails rather than guessing."
    fail=1; rm -f "$page"; continue
  fi

  hits=$(grep -oiE "$NATIVE_MARKERS" "$page" | sort -u | tr '\n' ' ')
  if [ -n "$hits" ]; then
    echo -e "  ${RED}✗${NC} ${slug} — NATIVE Webflow form present: ${hits}"
    echo "     Webflow is capturing patient PHI again. Delete the Form Block in"
    echo "     the Designer (keep the GoHighLevel embed) and republish. See #98."
    fail=1; rm -f "$page"; continue
  fi

  if ! grep -qiE "$EMBED_MARKER" "$page"; then
    echo -e "  ${RED}✗${NC} ${slug} — no GoHighLevel embed (${EMBED_MARKER}) found"
    echo "     The page has no working intake form. A page that captures nothing"
    echo "     is as much a defect as one that captures to non-BAA Webflow."
    fail=1; rm -f "$page"; continue
  fi

  echo -e "  ${GREEN}✓${NC} ${slug} — no native Webflow form; GoHighLevel embed present"
  rm -f "$page"
done

echo ""
if [ "$fail" -ne 0 ]; then
  echo -e "${RED}Native-form verification FAILED.${NC}"
  echo "  A TNCLD intake page is capturing to non-BAA Webflow, or lost its embed."
  echo "  This is a HIPAA exposure — see tncld#98 for the remediation record."
  exit 1
fi
echo -e "${GREEN}No native Webflow forms${NC} on: ${PAGES[*]} — intake is GoHighLevel-only."
