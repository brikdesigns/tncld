# TNCLD - Claude Code Project Instructions

This file provides project-specific context for Claude Code.

---

## Project Credentials

| Item | Value |
|------|-------|
| **Client** | Tennessee Center for Laser Dentistry (TNCLD) |
| **Webflow Site ID** | `694f1891a016a6340049f761` |
| **Notion Services DB** | `2ca97d34-ed28-8040-80eb-000b9234418f` |

**Token Source:** [Notion API Keys](https://www.notion.so/API-Keys-2ec97d34ed2880e2a4b5d65f61a93208)

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

**Head Code:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/brikdesigns/tncld@main/header.css?v=2">
<script src="https://cdn.jsdelivr.net/gh/brikdesigns/tncld@main/footer.js?v=2"></script>
```

**Footer Code:**
```html
<script src="https://cdn.jsdelivr.net/gh/brikdesigns/tncld@main/footer.js?v=2"></script>
```

### Deployment Workflow

1. Edit `header.css` or `footer.js` locally
2. Commit and push to `main` branch
3. Purge jsDelivr cache (required for immediate updates):
   ```bash
   curl -s "https://purge.jsdelivr.net/gh/brikdesigns/tncld@main/header.css"
   curl -s "https://purge.jsdelivr.net/gh/brikdesigns/tncld@main/footer.js"
   ```
4. Publish Webflow site (if needed)

**Note:** jsDelivr caches aggressively. Always purge after pushing to see changes immediately.

---

## Website Build Workflow

**Scripts Location:** `/Users/nickstanerson/Documents/GitHub/brik-llm/websites/`

Full workflow documentation: [brik-llm/websites/README.md](../brik-llm/websites/README.md)

### Phase Scripts

| Phase | Script | Trigger |
| ----- | ------ | ------- |
| 01 Discovery | `discovery_cache.py` | "Cache discovery data for TNCLD" |
| 02 Content | `website_scraper.py` | "Scrape content from tncld.com" |
| 03 Design | `page_generator.py` | "Generate HTML mockups for TNCLD" |
| 04 Development | `webflow_builder.py` | "Build TNCLD website in Webflow" |

### Quick Commands

```bash
# Scrape existing site content
python /Users/nickstanerson/Documents/GitHub/brik-llm/websites/02-content-strategy/website_scraper.py --url "https://tncld.com"

# Compress photos before upload
python /Users/nickstanerson/Documents/GitHub/brik-llm/websites/03-design/compress_photos.py --input ./assets/photos

# Sync Notion → Webflow (uses Direct API)
python /Users/nickstanerson/Documents/GitHub/brik-llm/websites/04-development/webflow_builder.py
```

### Fallback Scripts (when MCP fails)

| Service | Script | Usage |
| ------- | ------ | ----- |
| Webflow | `brik-llm/scripts/wf` | `../brik-llm/scripts/wf pages` |
| Notion | `brik-llm/websites/shared/notion_cli.py` | Direct API queries |

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
| **Naming Conventions** | [brik-bds/BDS-CROSS-PLATFORM-REFERENCE.md](../brik-llm/foundations/brik-bds/BDS-CROSS-PLATFORM-REFERENCE.md) |
| **Webflow Workflows** | [brik-llm/scripts/webflow/](../brik-llm/scripts/webflow/) |
| **Content Style Guide** | [brik-llm/websites/02-content-strategy/CONTENT-STYLE-GUIDE.md](../brik-llm/websites/02-content-strategy/CONTENT-STYLE-GUIDE.md) |
| **QA Checklist** | [_newclient/markdown/quality-assurance/qa-checklist.md](../_newclient/markdown/quality-assurance/qa-checklist.md) |

**Do not duplicate global standards in this repo.** Reference the authoritative sources above.

---

## Related Documentation

- **Global CLAUDE.md:** [../CLAUDE.md](../CLAUDE.md) - MCP setup, troubleshooting
- **Notion SOPs:** [Notion SOPs](https://www.notion.so/1d697d34ed2880e18a07dc060e66787f)
- **Manage Marketing Website:** [Notion](https://www.notion.so/Manage-Marketing-Website-2f697d34ed2880308836dd4c977bc0c8)
