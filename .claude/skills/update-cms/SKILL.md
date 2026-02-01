---
name: update-cms
description: Update CMS bindings for local testing. Use when user says "update cms" or needs to bind CMS data to HTML pages
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit, Grep, Glob
---

# CMS Update Workflow

Update local CMS bindings in `local-cms.js` for testing Webflow CMS functionality locally.

## Overview

This workflow binds CMS data to HTML pages for local development testing. The `local-cms.js` file is **NEVER transferred to Webflow** - it's for local testing only.

## Step 1: Identify Pages Needing CMS Binding

```bash
# List all HTML pages
ls -1 *.html

# Find CMS-bound pages (look for w-dyn-list)
grep -l "w-dyn-list" *.html

# Check for detail pages
ls -1 detail_*.html
```

### Standard Page Types

| Page Type | File Pattern | CMS Binding Needed? |
|-----------|-------------|---------------------|
| Homepage | `index.html` | Navigation only |
| Collection List | `services.html` | Yes - List binding |
| Collection Item | `detail_*.html` | Yes - Detail binding |
| Static Pages | `about.html`, `contact.html` | Navigation only |

## Step 2: Check CMS Data

```bash
# Check for existing CSV exports
ls -la cms/
```

If no data exists, export from Webflow or query via Direct API:
```bash
source .env
curl -s "https://api.webflow.com/v2/sites/$WEBFLOW_SITE_ID/collections" \
  -H "Authorization: Bearer $WEBFLOW_API_TOKEN" | jq '.collections[] | {id, displayName, slug}'
```

## Step 3: Analyze HTML Structure

For each page, identify:
- Section class names (`.section_*`)
- CMS list containers (`.w-dyn-list`)
- Item structure (`.w-dyn-item`)
- Empty state elements (`.w-dyn-empty`)
- Fields to populate (`.w-dyn-bind-empty`)

```bash
grep "section_" detail_services.html | grep "class=" | head -20
```

## Step 4: Update local-cms.js

### Navigation Binding (Global)
```javascript
// Runs on ALL pages
function initNavigationBinding() {
  const navServicesData = [/* services */];
  // Populate dropdowns
}
```

### Collection List Pages
```javascript
if (window.location.pathname.includes('services.html')) {
  function initServicesBinding() {
    const servicesData = [/* items */];
    $('.w-dyn-empty').hide();
    // Bind to sections
  }
}
```

### Detail Pages
```javascript
if (window.location.pathname.includes('detail_services.html')) {
  function initDetailServicesBinding() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceSlug = urlParams.get('service');
    // Find and bind item data
  }
}
```

## Step 5: Add Script Reference to All Pages

Ensure `local-cms.js` is referenced in ALL HTML pages:
```html
<script src="local-cms.js"></script>
```

## Step 6: Test

```bash
# Open pages in browser
open index.html
open services.html
open "detail_services.html?service=dental-implants"
```

## Success Criteria

- All navigation dropdowns populate on every page
- All collection list pages show data correctly
- All detail pages populate via URL parameters
- No "No items found" messages visible
- No JavaScript errors in browser console

## Reference

See full workflow: [markdown/workflows/cms-update-workflow.md](markdown/workflows/cms-update-workflow.md)
