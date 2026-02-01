---
name: transfer-code
description: Transfer custom code (header.css, footer.js) to Webflow site settings. Use when user says "transfer custom code to Webflow" or "push code to Webflow"
disable-model-invocation: true
allowed-tools: Bash, Read
---

# Transfer Custom Code to Webflow

Transfer local custom code files to Webflow Site Settings > Custom Code.

## Files to Transfer

| Local File | Webflow Location | Wrap In |
|------------|------------------|---------|
| `header.css` | Site Settings > Custom Code > Head Code | `<style>...</style>` |
| `footer.js` | Site Settings > Custom Code > Footer Code | `<script>...</script>` |
| `local-cms.js` | **NEVER TRANSFER** | N/A |

## Pre-Transfer Checklist

1. **Verify files exist and are ready:**
```bash
ls -la header.css footer.js
```

2. **Review content for any local-only code:**
```bash
cat header.css
cat footer.js
```

3. **Check for development-only code that should NOT be transferred:**
   - `console.log()` statements (remove or comment out)
   - Local file paths
   - Debug flags

## Transfer Methods

### Method 1: Direct API (Preferred)

Using Webflow API to register custom scripts:

```bash
source .env

# Register footer.js as inline script
SCRIPT_CONTENT=$(cat footer.js | jq -Rs .)
curl -X POST "https://api.webflow.com/v2/sites/$WEBFLOW_SITE_ID/custom_code/scripts" \
  -H "Authorization: Bearer $WEBFLOW_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"displayName\": \"Footer Custom JS\",
    \"location\": \"footer\",
    \"sourceCode\": $SCRIPT_CONTENT
  }"
```

### Method 2: Manual Transfer (Fallback)

1. **Open Webflow Designer**
2. **Go to:** Site Settings > Custom Code
3. **Head Code:** Copy contents of `header.css` wrapped in `<style>` tags
4. **Footer Code:** Copy contents of `footer.js` wrapped in `<script>` tags
5. **Save and Publish**

## Code Templates

### Header Code (for header.css)
```html
<style>
/* TNCLD Custom Styles - Transferred from header.css */
/* Last updated: [DATE] */

[PASTE header.css CONTENT HERE]
</style>
```

### Footer Code (for footer.js)
```html
<script>
// TNCLD Custom JavaScript - Transferred from footer.js
// Last updated: [DATE]

[PASTE footer.js CONTENT HERE]
</script>
```

## Post-Transfer Verification

1. **List registered scripts:**
```bash
curl -s "https://api.webflow.com/v2/sites/$WEBFLOW_SITE_ID/custom_code/scripts" \
  -H "Authorization: Bearer $WEBFLOW_API_TOKEN" | jq
```

2. **Publish site:**
```bash
curl -X POST "https://api.webflow.com/v2/sites/$WEBFLOW_SITE_ID/publish" \
  -H "Authorization: Bearer $WEBFLOW_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"publishToWebflowSubdomain": true}'
```

3. **Test live site** to verify custom code is working

## Important Notes

- **NEVER transfer `local-cms.js`** - This is for local testing only
- Always test on staging before publishing to production
- Keep a backup of custom code in git before overwriting

## Reference

See full workflow: [markdown/webflow-custom-code-transfer.md](markdown/webflow-custom-code-transfer.md)
