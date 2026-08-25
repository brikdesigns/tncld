# TNCLD - Claude Code Project Instructions

This file provides project-specific context for Claude Code.

---

## Compliance Profile

TNCLD is a dental practice in Franklin, TN. Regulatory regimes that apply:

| Regime | Applies? | Why |
|---|---|---|
| **HIPAA Privacy + Security Rules** | Yes | Covered entity (dental provider handling PHI) |
| **ADA Title III** (28 CFR § 36) | Yes | Public accommodation — professional office of a health care provider |
| **Tennessee Human Rights Act** (T.C.A. § 4-21-501) | Yes | State-level disability non-discrimination in public accommodations |
| **Section 1557 of ACA** | No | TNCLD does not accept Medicare/Medicaid |
| **Section 504 Rehab Act** | No | Same rationale as 1557 — no federal financial assistance received |

**Accessibility target:** WCAG 2.1 Level AA (the standard DOJ applies under Title III). No AAA bump.

**Canonical a11y + compliance standard:** [`healthcare-ada.md`](https://design.brikdesigns.com/docs/content-system/compliance/Healthcare-ADA) — every content or design change must honor it; companion universal baseline: [`CLIENT-ACCESSIBILITY-STANDARDS.md`](https://github.com/brikdesigns/brik-llm/blob/main/websites/shared/CLIENT-ACCESSIBILITY-STANDARDS.md).

**Required roles at TNCLD:**
- **HIPAA Privacy Officer** (45 CFR § 164.530) — must be a named individual; appears in Privacy Policy + NPP
- **Accessibility Coordinator** — responds to auxiliary-aids requests and accessibility grievances; appears in Accessibility Statement

Legal page drafts for TNCLD live in [markdown/legal-drafts/](markdown/legal-drafts/). Current state + next steps in [NEXT-STEPS.md](markdown/legal-drafts/NEXT-STEPS.md).

---

## Project References

> The values below are public project IDs (Webflow Site ID, Notion DB ID) per the canonical token registry — not secrets. Actual credential discipline is in § Security below.

| Item | Value |
|------|-------|
| **Client** | Tennessee Center for Laser Dentistry (TNCLD) |
| **Stack** | Webflow (legacy — see cross-repo CLAUDE.md § "Stack by surface") |
| **Webflow Site ID** | `694f1891a016a6340049f761` (public Webflow site ref, not a secret) |
| **Notion Services DB** | `2ca97d34-ed28-8040-80eb-000b9234418f` (public Notion DB ref, not a secret) |

## Security — read the canonical 5 before any credential work

> **TNCLD credential:** the only Brik-managed runtime secret is `WEBFLOW_API_TOKEN` in 1Password (Development vault, item `v7yjeqrzuqolnt7boicclvheb4`, field `credential`) — read with `op read "op://Development/v7yjeqrzuqolnt7boicclvheb4/credential"`; used by [`brik-llm/scripts/webflow/`](https://github.com/brikdesigns/brik-llm/tree/main/scripts/webflow) automation and for Data API ops (DOM/text + html-embed edits, publish).
>
> Read the canonical 5 doctrine docs before doing anything credential-related:
>
> 1. **Human entry point:** [Notion — Security Best Practices](https://www.notion.so/Security-Best-Practices-35797d34ed2880b49446e2d93497a487)
> 2. **Per-repo lookup:** [`brik-llm/operations/security/repo-token-map.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/security/repo-token-map.md) — see § "Marketing sites — Webflow (legacy)"
> 3. **Per-secret destinations:** [`brik-llm/operations/security/auth-surfaces.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/security/auth-surfaces.md)
> 4. **Rotation doctrine:** [`brik-llm/operations/security/when-to-rotate.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/security/when-to-rotate.md) — **HARD RULE: agents never initiate rotation.**
> 5. **Manual procedure:** [`brik-llm/operations/macos/openclaw/runbooks/token-rotation.md`](https://github.com/brikdesigns/brik-llm/blob/main/operations/macos/openclaw/runbooks/token-rotation.md)
>
> **Credential source-of-truth: 1Password Development vault** — NEVER paste secrets into chat or commits, and reference 1P items by ID, not title.

---

## API Access Strategy

### Direct API > MCP OAuth

**Always prefer direct API calls using tokens from `.env` over MCP OAuth connections.**

Rationale:
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

`@main` is unusable: jsDelivr caches each `Accept-Encoding` variant separately and a purge does not clear them together, so browsers can negotiate a stale gzip object while a plain `identity` curl still looks correct.

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

This is an **App-only** edit — in practice a dashboard one; the site token cannot do it:

| Attempt | Result |
|---|---|
| `GET /v2/sites/{id}/custom_code` | `403 invalid_auth_version` |
| `GET /v2/sites/{id}/registered_scripts` | `403 invalid_auth_version` |
| `GET /v2/sites/{id}/custom_code/hosted` | `404` |

Custom-code API endpoints need a Webflow OAuth App — site/Workspace tokens get `403 invalid_auth_version` ([Webflow docs](https://developers.webflow.com/data/docs/working-with-custom-code)); TNCLD has no such App and building one is not worth it for a surface #44 retires.

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

`scripts/verify-live-assets.sh` reads `tncld.com`, extracts the jsDelivr URL the page **actually requests** per asset, and fails if those bytes differ from the working tree — both `deploy.sh` and [`verify-live-assets.yml`](.github/workflows/verify-live-assets.yml) call it.

It goes **red on the asset-changing push** (pin not yet bumped) and prints the exact tags to paste — re-run after publishing; a weekly scheduled run catches drift the push trigger can't see, e.g. a Webflow republish that drops the custom code.

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

1. **Check the pin first** — `bash scripts/verify-live-assets.sh` compares live bytes to your tree; raw look `curl -sL https://tncld.com/ | grep -o 'tncld@[a-z0-9]*'`. Differing bytes = pin never bumped (the most likely cause).
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
| TNCLD Services | `2ca97d34-ed28-8040-80eb-000b9234418f` | Service page content |

---

## Common Tasks

### Refresh Services content from Notion
The rebuild's content pipeline is Notion → `json/cms-data.json`, **not** Notion
→ Webflow. The ETL reads the TNCLD Services DB
(`2ca97d34-ed28-8040-80eb-000b9234418f`) and is re-runnable and non-destructive
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
