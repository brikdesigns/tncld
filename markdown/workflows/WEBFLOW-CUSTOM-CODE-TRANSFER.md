# Webflow Custom Code Transfer Workflow

## Overview

This document outlines the process for transferring custom CSS and JavaScript from local development to Webflow. Two methods are available:

1. **Automated Transfer** (via Webflow MCP) - Recommended
2. **Manual Transfer** (copy-paste) - Fallback method

---

## Verified: January 16, 2026

Automated transfer tested and confirmed working on TNCLD project:

| Script | Location | Status | CDN Hosted |
|--------|----------|--------|------------|
| TNCLD Custom CSS | header | ✅ Applied | Yes |
| TNCLD Custom JS | footer | ✅ Applied | Yes |

**Key Finding:** Scripts are automatically applied after registration - no separate "apply" step needed.

---

## Quick Reference

| File | Destination | Method |
|------|-------------|--------|
| `header.css` | Webflow Head Code | Automated or Manual |
| `footer.js` | Webflow Footer Code | Automated or Manual |
| `local-cms.js` | **NEVER TRANSFER** | N/A |

---

## Method 1: Automated Transfer (Webflow MCP)

### Prerequisites

- Webflow MCP server connected (`claude mcp add --transport http webflow -s local https://mcp.webflow.com/mcp`)
- Webflow Designer open with site loaded
- Bridge App connected in Webflow

### Step 1: Verify MCP Connection

Say to Claude:
```
"Check Webflow connection and list available sites"
```

Claude will use `data_sites_tool > list_sites` to verify the connection.

### Step 2: Transfer Custom Code

**Transfer Header CSS (to Head Code):**
```
"Transfer header.css to Webflow head code for site [site-id]"
```

**Transfer Footer JS (to Footer Code):**
```
"Transfer footer.js to Webflow footer code for site [site-id]"
```

**Transfer Both:**
```
"Transfer custom code (header.css and footer.js) to Webflow for site [site-id]"
```

### How It Works

Claude uses the Webflow MCP `data_scripts_tool` to:

1. **Register the script** - Creates a named script entry in Webflow
2. **Apply to site** - Associates the script with your site
3. **Specify location** - Places code in "header" or "footer" section

**Available Actions:**
- `add_inline_site_script` - Register and add inline script/CSS
- `list_registered_scripts` - View all registered scripts
- `list_applied_scripts` - View scripts applied to site
- `delete_all_site_scripts` - Remove all custom scripts

### Example Commands

**Add CSS to head:**
```javascript
// Claude uses data_scripts_tool with:
{
  "add_inline_site_script": {
    "site_id": "your-site-id",
    "request": {
      "displayName": "Custom Header CSS",
      "sourceCode": "/* contents of header.css */",
      "version": "1.0.0",
      "location": "header",
      "canCopy": true
    }
  }
}
```

**Add JS to footer:**
```javascript
// Claude uses data_scripts_tool with:
{
  "add_inline_site_script": {
    "site_id": "your-site-id",
    "request": {
      "displayName": "Custom Footer JS",
      "sourceCode": "// contents of footer.js",
      "version": "1.0.0",
      "location": "footer",
      "canCopy": true
    }
  }
}
```

### Limitations

- **Inline scripts limited to 2000 characters** - For larger files:
  - Option 1: Condense/minify code to fit under limit
  - Option 2: Use manual transfer method (copy-paste)
  - Option 3: Split into multiple smaller scripts
- Requires active Webflow MCP connection
- Scripts are registered per-app (your integration)
- Scripts are hosted on Webflow CDN after registration

### Updating Existing Scripts

To update a script version:
1. Delete existing scripts: `"Remove all custom scripts from site"`
2. Re-register with incremented version number (e.g., "1.0.1")
3. Scripts auto-apply after registration

---

## Method 2: Manual Transfer (Copy-Paste)

Use this method when:
- Code exceeds 2000 characters
- MCP connection issues
- Preference for manual control

### Transfer header.css → Head Code

1. **Open `header.css`** in your editor
2. **Copy entire contents**
3. **In Webflow:** Settings → Custom Code → Head Code
4. **Wrap in `<style>` tags and paste:**

```html
<style>
/* ============================================= */
/*     [PROJECT] - CUSTOM CSS (HEAD CODE)       */
/* ============================================= */

[paste header.css contents here]

</style>
```

5. **Save** and **Publish** to test

### Transfer footer.js → Footer Code

1. **Open `footer.js`** in your editor
2. **Copy entire contents**
3. **In Webflow:** Settings → Custom Code → Footer Code
4. **Wrap in `<script>` tags and paste:**

```html
<script>
// =============================================
//     [PROJECT] - CUSTOM JAVASCRIPT
// =============================================

[paste footer.js contents here]

</script>
```

5. **Save** and **Publish** to test

---

## Versioning & Updates

### Best Practices

1. **Version your code** - Add version comments:
   ```css
   /* Version: 1.2.0 - 2026-01-16 */
   ```

2. **Track changes** - Update changelog in file header:
   ```javascript
   // Changelog:
   // v1.2.0 - Added form validation
   // v1.1.0 - Fixed mobile nav
   // v1.0.0 - Initial release
   ```

3. **Backup before overwriting** - Copy existing Webflow code before replacing

### Update Workflow

1. Make changes to local `header.css` or `footer.js`
2. Test locally
3. Increment version number
4. Transfer to Webflow (automated or manual)
5. Publish and test
6. Update maintenance log

---

## File Structure Reference

### header.css Template

```css
/* ============================================= */
/*     [PROJECT] - CUSTOM CSS (HEAD CODE)       */
/*     Version: 1.0.0 - [DATE]                  */
/* ============================================= */
/*     Copy to Webflow: Settings > Custom Code  */
/*              > Head Code                      */
/*     Wrap in <style> tags when transferring   */
/* ============================================= */

/*
 * Changelog:
 * v1.0.0 - Initial release
 */

/* ============================================= */
/*              UTILITY CLASSES                 */
/* ============================================= */

.hide {
  display: none !important;
}

/* ============================================= */
/*            CUSTOM OVERRIDES                  */
/* ============================================= */

/* Add project-specific styles below */

/* ============================================= */
/*               END OF FILE                    */
/* ============================================= */
```

### footer.js Template

```javascript
// =============================================
//     [PROJECT] - CUSTOM JAVASCRIPT
//     Version: 1.0.0 - [DATE]
// =============================================
//  Copy to Webflow: Settings > Custom Code
//              > Footer Code
//  Wrap in <script> tags when transferring
// =============================================

/*
 * Changelog:
 * v1.0.0 - Initial release
 */

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('[PROJECT] custom scripts loaded - v1.0.0');
  initializeModules();
});

function initializeModules() {
  // Initialize modules here
}

// =============================================
// END OF FILE
// =============================================
```

---

## Troubleshooting

### Automated Transfer Issues

**"MCP not connected"**
```bash
# Restart MCP connection
claude mcp remove webflow -s local
claude mcp add --transport http webflow -s local https://mcp.webflow.com/mcp
# Restart Claude session
```

**"Script exceeds 2000 characters"**
- Use manual transfer method
- Or split code into multiple smaller scripts

**"Site ID not found"**
- Ask Claude to list sites: `"List my Webflow sites"`
- Use the returned site ID in your transfer command

### Manual Transfer Issues

**CSS not applying**
- Check `<style>` tags are properly closed
- Verify no syntax errors in CSS
- Check for specificity conflicts with Webflow styles

**JavaScript not running**
- Check `<script>` tags are properly closed
- Verify jQuery loads before your code (if using jQuery)
- Check browser console for errors

**Code disappearing after publish**
- Webflow may strip certain code patterns
- Check for forbidden patterns in Webflow docs
- Try encoding special characters

---

## Security Notes

- **Never include API keys or tokens** in custom code
- **Never include `local-cms.js`** - it's for local testing only
- **Remove console.log statements** in production (optional)
- **Validate all user input** in JavaScript

---

## Quick Commands

```
# Automated (via Claude with Webflow MCP):
"Transfer header.css to Webflow head code"
"Transfer footer.js to Webflow footer code"
"Transfer all custom code to Webflow"
"List registered scripts for my site"
"Remove all custom scripts from site"

# Manual steps reminder:
"Show me the manual transfer steps for Webflow"
```

---

## Related Documentation

- [GLOBAL-WEBFLOW-WORKFLOW.md](../GLOBAL-WEBFLOW-WORKFLOW.md) - Complete workflow standards
- [QUICK-START.md](../QUICK-START.md) - Quick reference guide
- [local-cms-binding.md](local-cms-binding.md) - CMS binding (local only)

---

**Last Updated:** January 2026
**Maintained By:** Brik Designs
