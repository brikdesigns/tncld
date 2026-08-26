#!/usr/bin/env bash
# new-task.sh — Create an isolated git worktree for a single BDS task.
#
# Branches from origin/staging. Enforces task/{scope}-{name} naming.
# Installs dependencies in the new worktree.
#
# Usage:
#   ./scripts/new-task.sh {scope}-{name}
#   ./scripts/new-task.sh --issue 102 marketing-section-rhythm  # gate on the ticket
#   ./scripts/new-task.sh --base main launch-promotion          # promotion PR
#   ./scripts/new-task.sh content-pricing-copy
#
# Creates:
#   ../tncld-worktrees/{scope}-{name}/   on branch  task/{scope}-{name}
#
# Requirements:
#   - Must be run from the repo root.
#   - Requires a clean working tree (no uncommitted changes).
#
# Why this exists: the shared main-repo `.git/HEAD` drifts silently when a
# second session checks out a task/* branch, and every edit afterward lands
# on the wrong branch. Worktrees are the fix — each session gets its own
# HEAD. See the Git Release Workflow Notion doc (Per-Repo Playbook table
# flagged BDS worktrees "Critical" after the 2026-04-19 incident).

set -euo pipefail

# Prevent shells that sourced ~/.secrets/brik-packages.env from inheriting
# PACKAGES_READ_TOKEN as GITHUB_TOKEN — gh CLI auths to that instead of the
# user's PAT, using a wrong-scope (read:packages) token for arbitrary gh calls.
unset GITHUB_TOKEN

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ── Config ──
# staging, not main: this site is on Netlify's two-site model, so task branches
# PR into `staging` and promoting `staging` → `main` publishes. The old default
# here was `main` with a comment claiming no `staging` branch existed — it has
# existed since #88, so a worktree cut from `main` started behind and PR'd into
# the wrong base unless the author noticed (#100).
BASE_BRANCH="staging"
ISSUE_REF=""

# ── Resolve repo root ──
# Derive the worktree dir from the repo name so a copy of this script into
# another repo lands worktrees beside *that* repo, not a hardcoded one (#53).
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
WORKTREE_BASE="$(dirname "$PROJECT_ROOT")/$(basename "$PROJECT_ROOT")-worktrees"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ticket-overlap gate (brik-llm#1533). Sourced, not executed, so it can prompt.
# shellcheck source=scripts/lib/issue-overlap.sh
source "${SCRIPT_DIR}/lib/issue-overlap.sh"

# ── Must run from the primary worktree on main ──
# Running new-task.sh from inside another task worktree creates nested state
# that breaks the one-worktree-per-task contract. The primary worktree is
# also the one place main is meant to live — if it's on a task branch,
# something else already broke.
PRIMARY_PATH="$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')"
if [ "$PROJECT_ROOT" != "$PRIMARY_PATH" ]; then
  echo -e "${RED}Error: new-task.sh must be run from the primary worktree.${NC}"
  echo ""
  echo "  Here:    $PROJECT_ROOT"
  echo "  Primary: $PRIMARY_PATH"
  echo ""
  echo "  cd into the primary worktree first:"
  echo "    cd $PRIMARY_PATH && ./scripts/new-task.sh $*"
  exit 1
fi

PRIMARY_BRANCH="$(git -C "$PRIMARY_PATH" branch --show-current || echo '(detached)')"
case "$PRIMARY_BRANCH" in
  main|staging) ;;
  *)
    echo -e "${RED}Error: primary worktree is on '${PRIMARY_BRANCH}', not a base branch.${NC}"
    echo ""
    echo "  The primary worktree at $PRIMARY_PATH must stay on ${BASE_BRANCH} (or staging)."
    echo "  Task work lives in ../brikdesigns-worktrees/{slug} — never in the primary."
    echo ""
    echo "  To fix:"
    echo "    cd $PRIMARY_PATH"
    echo "    git status                  # inspect any uncommitted work"
    echo "    git switch ${BASE_BRANCH}   # return to the base branch"
    exit 1
    ;;
esac

# ── Parse flags ──
# Collect positionals instead of breaking on the first one, so `--base` works
# after the slug (`new-task.sh slug --base main`) instead of being silently
# dropped (#53).
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      BASE_BRANCH="$2"
      shift 2
      ;;
    --issue)
      ISSUE_REF="$2"
      shift 2
      ;;
    -*)
      echo -e "${RED}Unknown flag: $1${NC}"
      exit 1
      ;;
    *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done
if [ ${#POSITIONAL[@]} -gt 0 ]; then
  set -- "${POSITIONAL[@]}"
else
  set --
fi

# ── Validate input ──
if [ $# -lt 1 ]; then
  echo -e "${RED}Usage: $0 [--base branch] [--issue N] {scope}-{name}${NC}"
  echo ""
  echo "  scope = area of the site (marketing, content, seo, site, infra, docs, intel)"
  echo "  name  = what the task delivers (hero-rework, pricing-copy, analytics-4-setup)"
  echo ""
  echo "  Example: $0 --issue 102 marketing-section-rhythm"
  echo "  Example: $0 content-pricing-copy"
  echo ""
  echo "  Base branch: ${BASE_BRANCH} (override with --base)"
  echo ""
  echo "  --issue takes 102 or owner/repo#102 and warns if a branch or PR already"
  echo "  references that ticket in any repo — a parallel session on the same work."
  exit 1
fi

TASK_NAME="$1"
BRANCH_NAME="task/${TASK_NAME}"

# ── Validate naming convention ──
if [[ ! "$TASK_NAME" =~ ^[a-z]+-[a-z0-9]+ ]]; then
  echo -e "${RED}Error: Task name must follow {scope}-{name} pattern.${NC}"
  echo ""
  echo "  Got:      $TASK_NAME"
  echo "  Expected: {scope}-{name}  (e.g., marketing-hero-rework, infra-worktree-guard)"
  echo ""
  echo "  Valid scopes: marketing, content, seo, site, infra, docs, intel"
  exit 1
fi

# ── Check for clean working tree ──
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Error: Working tree is dirty. Commit or stash changes first.${NC}"
  echo ""
  git status --short
  exit 1
fi

# ── Check branch doesn't already exist ──
if git show-ref --verify --quiet "refs/heads/${BRANCH_NAME}"; then
  echo -e "${RED}Error: Branch '${BRANCH_NAME}' already exists.${NC}"
  echo ""
  echo "  To resume:  cd ${WORKTREE_BASE}/${TASK_NAME}"
  echo "  To delete:  git branch -d ${BRANCH_NAME}"
  exit 1
fi

# ── Check for branch name reuse (previous PRs) ──
if command -v gh &>/dev/null; then
  PRIOR_PRS=$(gh pr list --state all --head "${BRANCH_NAME}" --json number,state --jq '.[] | "#\(.number) (\(.state))"' 2>/dev/null || true)
  if [ -n "$PRIOR_PRS" ]; then
    echo -e "${YELLOW}⚠  Branch name '${BRANCH_NAME}' was used in previous PRs:${NC}"
    echo "$PRIOR_PRS" | sed 's/^/    /'
    echo ""
    echo -e "${YELLOW}   Reusing names makes PR history confusing.${NC}"
    echo -e "${YELLOW}   Consider: task/${TASK_NAME}-v2 or a more specific name.${NC}"
    echo -e "${YELLOW}   Press Enter to continue anyway, Ctrl+C to abort.${NC}"
    read -r
  fi
fi

# ── Check for overlapping scope (local branches) ──
SCOPE_KEYWORD="${TASK_NAME%%-*}"
SIMILAR_BRANCHES=$(git branch -r 2>/dev/null | grep -i "origin/task/.*${SCOPE_KEYWORD}" | grep -v HEAD || true)
if [ -n "$SIMILAR_BRANCHES" ]; then
  echo -e "${YELLOW}⚠  Branches with similar scope already exist:${NC}"
  echo "$SIMILAR_BRANCHES" | sed 's/^/    /'
  echo ""
  echo -e "${YELLOW}   Verify these don't overlap before proceeding.${NC}"
  echo -e "${YELLOW}   Press Enter to continue, Ctrl+C to abort.${NC}"
  read -r
fi

# ── Check open PRs for file-level overlap ──
# Parallel PRs that touch the same files cause cascading rebase conflicts
# (see the 2026-04-19 portal #257 ↔ #258 incident captured in the Notion
# Git Release Workflow doc). Warn when open PRs touch files whose path
# fragment matches the task scope.
if command -v gh &>/dev/null; then
  OPEN_PR_FILES=$(gh pr list --state open --json number,title,files --jq \
    '.[] | "\(.number)\t\(.title)\t\(.files | map(.path) | join(","))"' 2>/dev/null || true)
  if [ -n "$OPEN_PR_FILES" ]; then
    # Heuristic: tasks with the same descriptor likely touch the same directory.
    # e.g. "bds-button-variants" → check PRs touching any "*button*" file.
    DESC_KEYWORD=$(echo "$TASK_NAME" | cut -d'-' -f2)
    OVERLAPPING=$(echo "$OPEN_PR_FILES" | grep -i "${DESC_KEYWORD}" || true)
    if [ -n "$OVERLAPPING" ]; then
      echo -e "${YELLOW}⚠  Open PR(s) may touch the same area as '${TASK_NAME}':${NC}"
      echo "$OVERLAPPING" | awk -F'\t' '{ printf "    PR #%s — %s\n", $1, $2 }'
      echo ""
      echo -e "${YELLOW}   Parallel work on overlapping files = cascading rebase conflicts.${NC}"
      echo -e "${YELLOW}   Options:${NC}"
      echo -e "${YELLOW}     1) Wait for the open PR(s) to merge, then start this task${NC}"
      echo -e "${YELLOW}     2) Chain this branch off the open PR instead of ${BASE_BRANCH}${NC}"
      echo -e "${YELLOW}     3) Proceed (accept the rebase cost)${NC}"
      echo ""
      echo -e "${YELLOW}   Press Enter to proceed, Ctrl+C to abort.${NC}"
      read -r
    fi
  fi
fi

# ── Assert the base branch exists on origin ──
# Fails clearly naming what does exist, instead of git's bare
# "couldn't find remote ref staging" (#53).
if ! git ls-remote --exit-code --heads origin "${BASE_BRANCH}" >/dev/null 2>&1; then
  echo -e "${RED}Error: base branch '${BASE_BRANCH}' does not exist on origin.${NC}"
  echo ""
  echo "  Branches that do exist:"
  git ls-remote --heads origin | sed 's#.*refs/heads/#    #'
  echo ""
  echo "  Pass an existing branch with --base, e.g. --base main."
  exit 1
fi

# ── Fetch and branch from base ──
# ── Ticket-overlap gate ──
if [ -n "$ISSUE_REF" ]; then
  # Guarded, and the guard is load-bearing in BOTH directions (brik-llm#2422,
  # ported here by #100).
  #
  # Findings return 0 — an overlap warns and proceeds, which is brik-llm#1692 and
  # must not regress. But rc 4 (no such issue) and rc 5 (unreadable) mean the
  # gate DID NOT RUN, and creating the worktree on that is the fail-open. A bare
  # call reads an unanswered lookup as an all-clear, so a dead network or an
  # expired token creates the branch with no check at all — the brik-llm#1485
  # duplicate-work class the gate exists to stop.
  overlap_rc=0
  check_issue_overlap "$ISSUE_REF" || overlap_rc=$?
  if [ "$overlap_rc" -ne 0 ]; then
    echo ""
    echo -e "${RED}✗ Refusing to create a worktree — the overlap gate could not run.${NC}"
    echo ""
    echo -e "${RED}  Worktrees isolate files, not intent. Without this check nothing${NC}"
    echo -e "${RED}  catches a parallel session on the same ticket (brik-llm#1485,${NC}"
    echo -e "${RED}  where #1525 was built twice).${NC}"
    echo ""
    case "$overlap_rc" in
      2) echo -e "${YELLOW}  The reference could not be parsed. Use 102 or owner/repo#102.${NC}" ;;
      4) echo -e "${YELLOW}  That issue does not exist in the repo the number resolved against.${NC}"
         echo -e "${YELLOW}  Check the number, or pass the cross-repo form owner/repo#N.${NC}" ;;
      5) echo -e "${YELLOW}  The read failed rather than came back empty — usually transient.${NC}"
         echo -e "${YELLOW}  Re-run the same command; it retries once on its own first.${NC}" ;;
      *) echo -e "${YELLOW}  Unexpected gate status ${overlap_rc}.${NC}" ;;
    esac
    echo ""
    echo -e "${YELLOW}  Deliberately proceeding without the gate: omit --issue to skip it.${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠  No --issue given — skipping the ticket-overlap gate.${NC}"
  echo -e "${YELLOW}   Pass --issue N so a parallel track on the same ticket is caught.${NC}"
fi

# ── Fetch and branch from base ──
echo -e "${YELLOW}▸ Fetching latest ${BASE_BRANCH}...${NC}"
git fetch origin "${BASE_BRANCH}" --quiet

echo -e "${YELLOW}▸ Creating worktree at ${WORKTREE_BASE}/${TASK_NAME}...${NC}"
mkdir -p "$WORKTREE_BASE"
git worktree add "${WORKTREE_BASE}/${TASK_NAME}" -b "${BRANCH_NAME}" "origin/${BASE_BRANCH}"

cd "${WORKTREE_BASE}/${TASK_NAME}"

# ── Symlink shared resources from primary ──
# brikdesigns has runtime secrets (.env / .env.local) and gitignored CSV
# fixtures (content/csv/) that the reconciliation pipeline reads. Symlink
# (don't copy) so the worktree always sees primary's canonical state.
echo -e "${YELLOW}▸ Symlinking shared resources from primary...${NC}"
for f in .env .env.local; do
  if [ -f "${PRIMARY_PATH}/${f}" ]; then
    ln -sf "${PRIMARY_PATH}/${f}" "./${f}"
    echo "    ${f} → primary"
  fi
done
if [ -d "${PRIMARY_PATH}/content/csv" ]; then
  mkdir -p ./content
  ln -sf "${PRIMARY_PATH}/content/csv" ./content/csv
  echo "    content/csv/ → primary"
fi
# .netlify/state.json carries the linked siteId. Symlink only that file —
# never the whole .netlify/ dir, which netlify dev writes runtime artifacts
# into (blobs-serve/, functions-internal/, v1/). Per-worktree runtime state,
# shared siteId is the right split. Symlinking the whole dir also creates
# ELOOP traps when netlify dev rewrites it. See #86.
if [ -f "${PRIMARY_PATH}/.netlify/state.json" ]; then
  mkdir -p .netlify
  ln -sf "${PRIMARY_PATH}/.netlify/state.json" .netlify/state.json
  echo "    .netlify/state.json → primary"
fi

# ── Install dependencies ──
echo -e "${YELLOW}▸ Installing dependencies (npm ci --prefer-offline)...${NC}"
# .npmrc authenticates to GitHub Packages for @brikdesigns/* via
# PACKAGES_READ_TOKEN. tncld has no .env.op / op-run SA flow — source the
# token into THIS process only from ~/.secrets/brik-packages.env, the same
# path that works by hand. Skip if the file is absent so a machine that
# already exports the token still installs.
if [ -r "$HOME/.secrets/brik-packages.env" ]; then
  set -a
  # shellcheck source=/dev/null  # local secrets file, resolved at runtime
  source "$HOME/.secrets/brik-packages.env"
  set +a
fi
# Run without aborting so the assertion below can report *why* it failed. The
# `| tail -1` pipe would otherwise mask the exit code under pipefail and leave
# the worktree looking fine with an empty node_modules.
set +e
npm ci --prefer-offline 2>&1 | tail -1
set -e

# ── Assert the install actually populated node_modules ──
# A worktree with no deps must not look like success: the next command would
# die on `tsc: command not found` with nothing pointing back to here.
if [ ! -x node_modules/.bin/tsc ]; then
  echo ""
  echo -e "${RED}Error: dependency install did not complete.${NC}"
  echo ""
  echo "  The worktree exists but node_modules is empty or incomplete"
  echo "  (node_modules/.bin/tsc is missing)."
  echo ""
  if [ -z "${PACKAGES_READ_TOKEN:-}" ]; then
    echo "  PACKAGES_READ_TOKEN is not set and could not be loaded from"
    echo "  ~/.secrets/brik-packages.env. .npmrc needs it to read @brikdesigns/*"
    echo "  from GitHub Packages — without it npm ci returns 401. Check the file"
    echo "  exists and is readable, then re-run."
  else
    echo "  The token WAS loaded, so auth is not the cause — inspect the npm"
    echo "  output above (network, registry, or a stale lockfile)."
  fi
  echo ""
  echo "  Finish setup from the worktree, then you're ready:"
  echo "    cd ${WORKTREE_BASE}/${TASK_NAME}"
  echo "    set -a; source ~/.secrets/brik-packages.env; set +a"
  echo "    npm ci --prefer-offline"
  echo "    test -x node_modules/.bin/tsc && echo 'deps OK'"
  echo ""
  echo -e "${RED}  NOT printing the 'ready' summary — the worktree is not usable yet.${NC}"
  exit 1
fi

# ── Summary ──
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Task worktree ready (tncld)${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "  Branch:    ${BRANCH_NAME}"
echo "  Worktree:  ${WORKTREE_BASE}/${TASK_NAME}"
echo "  Based on:  origin/${BASE_BRANCH}"
echo ""
echo "  Next steps:"
echo "    cd ${WORKTREE_BASE}/${TASK_NAME}"
echo "    claude -p \"Task: ... Follow CLAUDE.md rules.\""
echo ""
echo "  When done (REQUIRED — branches without PRs rot):"
echo "    git diff ${BASE_BRANCH}..${BRANCH_NAME}   # review changes"
echo "    ./scripts/pr-task.sh             # push + create PR (mandatory)"
echo ""
