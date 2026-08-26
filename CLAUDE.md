# TNCLD - Claude Code Project Instructions

This file provides project-specific context for Claude Code.

> **Platform status (2026-08-25).** The Next.js rebuild is **live on Netlify**
> in the two-site model (staging + prod, both `noindex` pre-launch) — see
> [rag:static-site-deploy-model]. The **off-hours DNS cutover is still pending**
> ([#44](https://github.com/brikdesigns/tncld/issues/44)), so `tncld.com` continues
> to serve the **legacy Webflow site via SHA-pinned jsDelivr custom code**. The
> "Custom Code Deployment (jsDelivr)" and Webflow sections below therefore still
> describe the **currently-live** surface and are retired **with** the cutover,
> not before.

---

## Branch & worktree model

| Branch | Role |
|---|---|
| `staging` | **The base branch.** Task branches cut from it, PRs target it. |
| `main` | The **published** state. Promoting `staging` → `main` deploys. Lags `staging` by design. |

**The primary worktree tracks `staging`, not `main`** — the same as
[treehouse-pediatric-dentistry](https://github.com/brikdesigns/treehouse-pediatric-dentistry),
the other client site on this model. The cross-repo rule "never switch the
primary worktree off the base branch" means `staging` here.

This is load-bearing, not a preference. `scripts/new-task.sh` must run from the
primary worktree, so the primary's checkout **is** the copy of that script that
every session executes. With the primary on `main`, any fix to repo tooling sits
unreachable on `staging` until a publish promotes it:

```
$ ./scripts/new-task.sh --issue 89 marketing-omitted-ctas
Unknown flag: --issue          # main's old copy, ~4h after #105 fixed it on staging
```

That was [#111](https://github.com/brikdesigns/tncld/issues/111): [#105](https://github.com/brikdesigns/tncld/issues/105)
flipped the base branch to `staging` and added the ticket-overlap gate, and
neither took effect where the script is actually invoked. Two worktrees had to be
created by hand that session. A tooling fix is only live once the primary can see
it — so the primary follows `staging`.

Promotion PRs are the exception and target `main`: `./scripts/new-task.sh --base main {slug}`.

---

## Compliance Profile

TNCLD is a dental practice in Franklin, TN. Regulatory regimes that apply:

| Regime | Applies? | Why |
|---|---|---|
| **HIPAA Privacy + Security Rules** | Yes | Covered entity (dental provider handling PHI) |
| **ADA Title III** (28 CFR § 36) | Yes | Public accommodation — professional office of a health care provider |
| **Tennessee Human Rights Act** (T.C.A. § 4-21-501) | Yes | State-level disability non-discrimination in public accommodations |
| **Section 1557 of ACA** | No | Confirmed 2026-04-20 — TNCLD does not accept Medicare/Medicaid |
| **Section 504 Rehab Act** | No | Same rationale as 1557 — no federal financial assistance received |

**Accessibility target:** WCAG 2.1 Level AA (the standard DOJ applies under Title III). No AAA bump.

**Canonical accessibility + compliance standard:** [`@brikdesigns/bds/content-system/compliance/healthcare-ada.md`](https://design.brikdesigns.com/docs/content-system/compliance/Healthcare-ADA) — promoted to BDS 2026-04-21. The TNCLD remediation work seeded this canonical doc; the original draft at [markdown/legal-drafts/BRIK-HEALTHCARE-ADA-STANDARDS.md](markdown/legal-drafts/BRIK-HEALTHCARE-ADA-STANDARDS.md) is retained only as historical reference. Every content or design change to this site must honor the canonical BDS doc. Companion: [`brik-llm/websites/shared/CLIENT-ACCESSIBILITY-STANDARDS.md`](https://github.com/brikdesigns/brik-llm/blob/main/websites/shared/CLIENT-ACCESSIBILITY-STANDARDS.md) — universal Brik a11y baseline.

**Required roles at TNCLD:**
- **HIPAA Privacy Officer** (45 CFR § 164.530) — must be a named individual; appears in Privacy Policy + NPP
- **Accessibility Coordinator** — responds to auxiliary-aids requests and accessibility grievances; appears in Accessibility Statement

Legal page drafts for TNCLD live in [markdown/legal-drafts/](markdown/legal-drafts/). Current state + next steps in [NEXT-STEPS.md](markdown/legal-drafts/NEXT-STEPS.md).

---

## Project References

> **Renamed 2026-05-05.** This section was previously titled "Project Credentials" — that was a misnomer. The values below are project IDs (Webflow Site ID, Notion DB ID) which are public per the canonical token registry. None of these are secrets. Actual credential discipline is in § Security below.

| Item | Value |
|------|-------|
| **Client** | Tennessee Center for Laser Dentistry (TNCLD) |
| **Stack** | Webflow (legacy — see cross-repo CLAUDE.md § "Stack by surface") |
| **Webflow Site ID** | `694f1891a016a6340049f761` (public Webflow site ref, not a secret) |
| **Notion content DB** | `1f797d34ed288002a614e70707e88ba4` — "TNCLD Website" (public Notion DB ref, not a secret) |

## Security — read the canonical 5 before any credential work

> **TNCLD-specific:** the only Brik-managed runtime credential for this site is the per-client `WEBFLOW_API_TOKEN`, stored in 1Password (Development vault, item id `v7yjeqrzuqolnt7boicclvheb4` — title `Webflow - TNCLD (tncld-claude-20260122)`, field `credential`). Read it with `op read "op://Development/v7yjeqrzuqolnt7boicclvheb4/credential"`. Used by build automation in `brik-llm/scripts/webflow/`, and callable directly for Data API operations (page DOM read/text + html-embed edits, site publish) — verified working headless 2026-07-09.
>
> Read the canonical 5 doctrine docs before doing anything credential-related:
>
> 1. **Human entry point:** [Notion — Security Best Practices](https://www.notion.so/Security-Best-Practices-35797d34ed2880b49446e2d93497a487)
> 2. **Per-repo lookup:** [`brik-llm/operations/security/repo-token-map.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/security/repo-token-map.md) — see § "Marketing sites — Webflow (legacy)"
> 3. **Per-secret destinations:** [`brik-llm/operations/security/auth-surfaces.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/security/auth-surfaces.md)
> 4. **Rotation doctrine:** [`brik-llm/operations/security/when-to-rotate.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/security/when-to-rotate.md) — **HARD RULE: agents never initiate rotation.**
> 5. **Manual procedure:** [`brik-llm/operations/macos/openclaw/runbooks/token-rotation.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/macos/openclaw/runbooks/token-rotation.md)
>
> **Source-of-truth for all credentials: 1Password Development vault** (NOT the legacy "Notion API Keys" Notion page that was previously linked here). Never paste secrets into chat or commits. Reference 1P items by ID, not title.

---

## API Access Strategy

### Direct API > MCP OAuth

**Always prefer direct API calls using tokens from `.env` over MCP OAuth connections.**

Why:
- Webflow MCP OAuth tokens expire and require browser re-authentication
- Direct API with stored tokens is more reliable and reduces session friction
- `.env` tokens are documented and instantly accessible

### Before Starting Work

1. Check `.env` exists: `cat .env | grep WEBFLOW`
2. If missing/empty, tokens are in Notion API Keys page
3. Use direct `curl` for Webflow when MCP shows "Failed to connect"

### Webflow API Quick Reference

```bash
# Load env vars
source .env

# List collections
curl -s "https://api.webflow.com/v2/sites/$WEBFLOW_SITE_ID/collections" \
  -H "Authorization: Bearer $WEBFLOW_API_TOKEN" | jq '.collections[] | {id, displayName, slug}'

# Get collection items
curl -s "https://api.webflow.com/v2/collections/{collection_id}/items" \
  -H "Authorization: Bearer $WEBFLOW_API_TOKEN"
```

---

## Custom Code Deployment (jsDelivr, SHA-pinned)

> **The URLs are pinned to a commit. Pushing to `main` does NOT reach the live site.**
> Changed `header.css` or `footer.js`? You must paste the new SHA into Webflow
> or nothing ships. This is no longer silent: `scripts/verify-live-assets.sh`
> reads the live page and fails if the pin was not bumped ([#37](https://github.com/brikdesigns/tncld/issues/37)).
> Pinning is the decided model, not a stopgap — [#34](https://github.com/brikdesigns/tncld/issues/34)
> closed on option A because [#13](https://github.com/brikdesigns/tncld/issues/13)'s
> Next.js rebuild retires this surface at [#44](https://github.com/brikdesigns/tncld/issues/44).

**DO NOT paste code bodies into Webflow.** `header.css` and `footer.js` are served from this repo via jsDelivr; only the two `<link>` / `<script>` tags live in Webflow.

### Why pinned and not `@main` (2026-08-19, tncld#33)

`@main` was unusable. jsDelivr caches each `Accept-Encoding` variant as a separate object and **a purge does not clear them together**. Four purges returning `{"status":"finished"}` left the gzip object stale for ~40 minutes while a bare `curl` — which asks for `identity` — served the correct file the whole time. Browsers negotiate gzip/br, so the site served CSS that was two commits old.

```
same @main URL:  [identity] 22089 bytes, rule present   <-- what curl sees
                 [gzip]     21138 bytes, rule ABSENT    <-- what browsers see
```

`@<sha>` is cached immutably, is correct on every encoding on first fetch, and never needs purging. That is the whole reason for the pin.

### Webflow Custom Code Setup

Replace `<SHA>` with the full 40-char commit hash — short hashes work but are not what the deploy step prints.

**Head Code** (Site settings > Custom Code > Head Code):
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/brikdesigns/tncld@<SHA>/header.css">
```

**Footer Code** (Site settings > Custom Code > Footer Code):
```html
<script src="https://cdn.jsdelivr.net/gh/brikdesigns/tncld@<SHA>/footer.js"></script>
```

This is an **App-only** edit, so in practice a dashboard one. The site token cannot do it — re-verified 2026-08-20 against site `694f1891a016a6340049f761`:

| Attempt | Result |
|---|---|
| `GET /v2/sites/{id}/custom_code` | `403 invalid_auth_version` |
| `GET /v2/sites/{id}/registered_scripts` | `403 invalid_auth_version` |
| `GET /v2/sites/{id}/custom_code/hosted` | `404` |

The reason is the token type, not the endpoint's absence. Per [Webflow's docs](https://developers.webflow.com/data/docs/working-with-custom-code): *"Only Webflow Apps with OAuth tokens can call the custom code API endpoints, not clients with site or Workspace tokens."* An OAuth App with `custom_code:read`/`custom_code:write` could script the bump; TNCLD has no such App, and building one was judged not worth it for a surface #44 retires (see the #34 decision record).

### Deploying a change

```bash
# 1. Land the change on main as normal (worktree + PR).
# 2. Get the SHA to pin:
git rev-parse origin/main
# 3. Confirm jsDelivr serves it on the encoding browsers use:
curl -s --compressed -H 'Accept-Encoding: gzip' \
  "https://cdn.jsdelivr.net/gh/brikdesigns/tncld@$(git rev-parse origin/main)/header.css" | shasum -a 256
shasum -a 256 header.css     # must match
# 4. Paste both URLs into Webflow, Publish, then Cmd+Shift+R.
# 5. Verify the live site actually loads this commit's bytes:
bash scripts/verify-live-assets.sh
# 6. Assert the rendered result in a real browser:
npm test
```

> `npm test` briefly did not exist: the Next.js scaffold ([#40](https://github.com/brikdesigns/tncld/pull/46))
> replaced a `package.json` symlink with a regular file and dropped the `test`,
> `test:a11y`, `test:widget-width` and `deploy:cdn` scripts along with the
> `playwright` and `husky` devDeps. Restored in [#50](https://github.com/brikdesigns/tncld/issues/50) —
> the two Playwright checks and the gitleaks pre-commit hook are armed again.

### The gate

`scripts/verify-live-assets.sh` reads `tncld.com`, extracts the jsDelivr URL the page **actually requests** for each asset, and fails if those bytes differ from the working tree. `deploy.sh` and `.github/workflows/verify-live-assets.yml` both call it, so the check lives in one place.

It goes **red on the push that changes an asset** — the pin has not been bumped at that moment — and prints the exact tags to paste. Re-run after publishing. A weekly scheduled run catches drift the push trigger cannot see, such as a Webflow republish that drops the custom code.

Three earlier versions of this gate each reported green while the site was broken, which is why it is shaped this way:

| Gate version | Reported green while… |
|---|---|
| `head -20` hash (pre-[#30](https://github.com/brikdesigns/tncld/issues/30)) | the CDN served stale bytes below line 20 |
| whole file, identity only ([#32](https://github.com/brikdesigns/tncld/pull/32)) | browsers received a stale gzip variant |
| whole file, all encodings ([#35](https://github.com/brikdesigns/tncld/pull/35)) | the site loaded a different URL entirely |

Each verified a URL the *script* chose. This one derives the URL from the live HTML, so there is no URL for the gate and the site to disagree about ([#37](https://github.com/brikdesigns/tncld/issues/37)).

### Caching

| Layer | Behaviour |
|-------|-----------|
| **jsDelivr `@<sha>`** | immutable — no purge needed, no staleness possible |
| **jsDelivr `@main`** | per-encoding caching, `s-maxage=43200`, purge unreliable — **not used** |
| **Browser** | `max-age=604800` (7 days) — **hard refresh (Cmd+Shift+R)** after any pin bump |

### Troubleshooting: Changes Not Appearing

1. **Check the pin first** — `bash scripts/verify-live-assets.sh` answers this directly, comparing the live site's bytes to your tree. Raw look: `curl -sL https://tncld.com/ | grep -o 'tncld@[a-z0-9]*'`. If those bytes differ, the pin was never bumped. This is the most likely cause.
2. **Hard-refresh**: Cmd+Shift+R. The browser holds its own 7-day copy.
3. **Check the encoding browsers get, not the one curl defaults to.** A bare `curl` asks for `identity` and can be correct while gzip is stale:
   ```bash
   curl -s --compressed -H 'Accept-Encoding: gzip' <url> | grep <something-you-just-added>
   ```
4. **Bypass all caching** to confirm the file itself is right:
   ```
   https://raw.githubusercontent.com/brikdesigns/tncld/main/header.css
   ```
5. **Verify in a real browser, not curl.** `npm test` drives Chromium against the live pages and asserts the actual rendered result.

---

## Website Build Workflow

**Scripts Location:** `/Users/nickstanerson/Documents/GitHub/brik/brik-llm/scripts/`

Full workflow documentation: [brik-llm/CLAUDE.md](../../brik/brik-llm/CLAUDE.md)

### Phase Scripts

| Phase | Script | Trigger |
| ----- | ------ | ------- |
| 01 Discovery | `audit-inspiration-site.py` | "Cache discovery data for TNCLD" |
| 02 Content | `website-scraper.py` | "Scrape content from tncld.com" |
| 03 Design | `page-generator.py` | "Generate HTML mockups for TNCLD" |
| 04 Development | `webflow/wf-content-push.py` | "Build TNCLD website in Webflow" |

### Quick Commands

```bash
# Scrape existing site content
python /Users/nickstanerson/Documents/GitHub/brik/brik-llm/scripts/02-content-strategy/website-scraper.py --url "https://tncld.com"

# Compress photos before upload
python /Users/nickstanerson/Documents/GitHub/brik/brik-llm/scripts/03-design/compress-photos.py --input ./assets/photos

# Sync Notion → Webflow (uses Direct API)
python /Users/nickstanerson/Documents/GitHub/brik/brik-llm/scripts/webflow/wf-content-push.py
```

### Fallback Scripts (when MCP fails)

| Service | Script | Usage |
| ------- | ------ | ----- |
| Webflow | `brik-llm/scripts/webflow/wf` | `../../brik/brik-llm/scripts/webflow/wf pages` |
| Notion | `brik-llm/scripts/notion/notion-query.py` | Direct API queries |

---

## Content source (rebuild)

> **The Next.js rebuild does not read Webflow CMS.** Content is a checked-in
> file: [`json/cms-data.json`](json/cms-data.json), read through the typed
> reader [`src/lib/content.ts`](src/lib/content.ts). TNCLD is the `dental`
> industry key. The eventual swap to Supabase is [#55](https://github.com/brikdesigns/tncld/issues/55).

`cms-data.json` is industry-scoped; `dental` holds: `slug`, `name`, `home`,
`about`, `services`, `contact`, `audience`, `pages`, `serviceDetails`,
`technologyDetails`. Templates render whatever the source holds and never
hardcode copy.

### Legacy Webflow collection (not read by the rebuild)

Retained only for the still-live Webflow site. The live collection is slug
**`services`** (not `services-new`), id `696d6c32c61b66c34cbd65ff` — the #41
extract is the source of truth for its ~58 flat fields.

---

## Notion Databases

| Database | ID | Purpose |
|----------|----|---------|
| **TNCLD Website** | `1f797d34ed288002a614e70707e88ba4` | **The content source of record** — 36 pages, section-structured, for every route on the site |

Data source (for the Notion MCP / SQL queries): `collection://1f797d34-ed28-8162-9c60-000bcae32c74`.

> **Corrected 2026-08-25.** This table previously named `2ca97d34-ed28-8040-80eb-000b9234418f`
> ("TNCLD Services"). That ID **does not exist** — the Notion API returns
> `404 object_not_found` for it, while the ID above returns `200`:
>
> ```bash
> TOK=$(op read "op://Development/qc4jca2wmakrglct6oxaz3iu2y/credential")
> curl -s -o /dev/null -w '%{http_code}\n' -X POST \
>   "https://api.notion.com/v1/databases/1f797d34ed288002a614e70707e88ba4/query" \
>   -H "Authorization: Bearer $TOK" -H 'Notion-Version: 2022-06-28' \
>   -H 'Content-Type: application/json' -d '{"page_size":1}'   # 200
> ```
>
> `scripts/migrate-from-notion.ts:49` always had the correct ID — only this file
> was wrong. The cost of that: an agent reads CLAUDE.md first (as instructed),
> queries a dead ID, finds nothing, and concludes the content does not exist.
> Six pages were filed in [#56](https://github.com/brikdesigns/tncld/issues/56)
> as "no source at all" when five of them are authored in the DB above.

### What the DB holds, and why it is the fidelity source

`Status` per page is the authoring state — `Ready for Review` means the copy is
written. Four properties carry the **original Webflow site's** content, which is
what a faithful rebuild ([#13](https://github.com/brikdesigns/tncld/issues/13)'s
corrected charter) has to match:

| Property | Holds |
|---|---|
| `Original Web Copy` | the live page's body copy |
| `Original Page Title` | the live `<title>` |
| `Original Meta Description` | the live meta description |
| `Original URL` | the live page it was captured from |

Read it with the Notion MCP (`notion-fetch` on a page URL, or
`notion-query-data-sources` against the `collection://` URL above) — **not**
`WebFetch`, which has no credentials. Per-page bodies come back as
section-delimited markdown with layout hints (`Section-01: Hero`, `Layout:`,
`Display:`).

---

## Common Tasks

### Refresh Services content from Notion
The rebuild's content pipeline is Notion → `json/cms-data.json`, **not** Notion
→ Webflow. The ETL reads the **TNCLD Website** DB
(`1f797d34ed288002a614e70707e88ba4`, see § Notion Databases) and is re-runnable
and non-destructive
— STAGE 1 writes derived maps to a gitignored `--out` **dir** and does *not*
overwrite `json/cms-data.json` itself:

```bash
npx --yes tsx scripts/migrate-from-notion.ts --out <dir>   # extract (gitignored)
npx --yes tsx scripts/migrate-from-notion.ts --check       # drift gate
```

Promoting the extract over the hand-edited baseline into `json/cms-data.json`
is [#78](https://github.com/brikdesigns/tncld/issues/78); `--check` is red
until then by design.

> The old Notion→Webflow `services-new` field mapping was removed here — it
> described a CMS surface the rebuild no longer uses ([#48](https://github.com/brikdesigns/tncld/issues/48)).

---

## Global Standards

For standards that apply to all client projects, reference these authoritative sources:

| Standard | Location |
|----------|----------|
| **Naming Conventions** | [brik-bds/CLAUDE.md](../../brik/brik-bds/CLAUDE.md) + [design.brikdesigns.com](https://design.brikdesigns.com) |
| **Webflow Workflows** | [brik-llm/scripts/webflow/](../../brik/brik-llm/scripts/webflow/) |

**Do not duplicate global standards in this repo.** Reference the authoritative sources above.

---

## Related Documentation

- **Global CLAUDE.md:** [../CLAUDE.md](../CLAUDE.md) - MCP setup, troubleshooting
- **Notion SOPs:** [Notion SOPs](https://www.notion.so/1d697d34ed2880e18a07dc060e66787f)
- **Manage Marketing Website:** [Notion](https://www.notion.so/Manage-Marketing-Website-2f697d34ed2880308836dd4c977bc0c8)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
