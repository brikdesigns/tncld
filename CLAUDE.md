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
| **Notion Services DB** | `2ca97d34-ed28-8040-80eb-000b9234418f` (public Notion DB ref, not a secret) |

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

## Custom Code Deployment (jsDelivr CDN)

**DO NOT manually copy/paste code to Webflow.** Custom code is served via jsDelivr CDN directly from this GitHub repo.

### Webflow Custom Code Setup

**Head Code** (in Webflow Settings > Custom Code > Head Code):
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/brikdesigns/tncld@main/header.css">
```

**Footer Code** (in Webflow Settings > Custom Code > Footer Code):
```html
<script src="https://cdn.jsdelivr.net/gh/brikdesigns/tncld@main/footer.js"></script>
```

### Deploy Command

Use the deploy script for the full cycle (push, purge, verify):

```bash
bash deploy.sh
# or
npm run deploy:cdn
```

The script will:
1. Detect uncommitted changes to `header.css` / `footer.js`
2. Commit and push to `main`
3. Purge jsDelivr CDN cache
4. Verify the CDN is serving the new version
5. Optionally publish the Webflow site via API

### Caching: Two Layers to Know About

| Layer | TTL | Cleared by |
|-------|-----|------------|
| **jsDelivr CDN** | 12 hours | `deploy.sh` purge + GitHub Actions auto-purge on push |
| **Browser cache** | 7 days | **Hard refresh (Cmd+Shift+R)** — always do this after deploying |

The deploy script handles CDN purging automatically. But your **browser** will still serve its cached copy unless you hard-refresh.

### Troubleshooting: Changes Not Appearing

1. **Hard-refresh the browser**: Cmd+Shift+R (this fixes 90% of cases)
2. **Verify CDN content**: Run `bash deploy.sh` — it checks if CDN matches local
3. **Test with raw GitHub URL** (bypasses all caching):
   ```
   https://raw.githubusercontent.com/brikdesigns/tncld/main/header.css
   ```
   Temporarily swap this into Webflow head code to confirm the CSS is correct, then switch back to jsDelivr.
4. **Wait and retry**: jsDelivr edge propagation can take 30-60 seconds after purge

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

## CMS Collections

| Collection | ID | Slug |
|------------|----|------|
| Services New | `696d6c32c61b66c34cbd65ff` | `services-new` |

---

## Notion Databases

| Database | ID | Purpose |
|----------|----|---------|
| TNCLD Services | `2ca97d34-ed28-8040-80eb-000b9234418f` | Service page content |

---

## Common Tasks

### Sync Services from Notion to Webflow
1. Query Notion: `API-query-data-source` with Services DB ID
2. Extract fields: Name, About, Introduction, Process, Technology, etc.
3. Transform to HTML for Webflow RichText fields
4. POST to Webflow `services-new` collection

### Field Mapping (Notion → Webflow)

| Notion Field | Webflow Field | Type |
|--------------|---------------|------|
| Name | name | PlainText |
| About | about | RichText (HTML) |
| Introduction | introduction | RichText (HTML) |
| What You Get | what-you-get | RichText (HTML) |
| Benefits | benefits | RichText (HTML) |
| Process | process | RichText (HTML) |
| Technology | technology | RichText (HTML) |
| What to Expect | what-to-expect | RichText (HTML) |
| Payments | payments | RichText (HTML) |
| Promise | promise | RichText (HTML) |
| Testimonial | testimonial | RichText (HTML) |
| FAQs | faqs | RichText (HTML) |
| CTA | cta | RichText (HTML) |
| Types | types | RichText (HTML) |

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
