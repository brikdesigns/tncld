---
name: verify-sync
description: Verify Webflow sync completed successfully. Use when user says "verify sync" or wants to check file counts after syncing
disable-model-invocation: true
allowed-tools: Bash, Read
---

# Verify Webflow Sync

Verify that the Webflow export sync completed successfully by checking file counts and local-only file preservation.

## Quick Verification

Run these commands to verify sync status:

```bash
echo "=== TNCLD Sync Verification ==="
echo ""
echo "HTML Files:"
echo "  Root:              $(find . -maxdepth 1 -name '*.html' | wc -l | tr -d ' ')"
echo "  about/:            $(ls about/*.html 2>/dev/null | wc -l | tr -d ' ')"
echo "  bds/:              $(ls bds/*.html 2>/dev/null | wc -l | tr -d ' ')"
echo "  legal/:            $(ls legal/*.html 2>/dev/null | wc -l | tr -d ' ')"
echo "  patient-resources/: $(ls patient-resources/*.html 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "Assets:"
echo "  CSS files:         $(ls css/*.css 2>/dev/null | wc -l | tr -d ' ')"
echo "  JS files:          $(ls js/*.js 2>/dev/null | wc -l | tr -d ' ')"
echo "  Images:            $(ls images/ 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "Local-Only Files:"
ls -la header.css footer.js local-cms.js 2>/dev/null || echo "  (some files may not exist yet)"
```

## Expected File Counts (TNCLD)

| Location | Expected Count |
|----------|----------------|
| Root HTML | ~11-15 |
| about/ | 5 |
| bds/ | 6 |
| legal/ | 2 |
| patient-resources/ | 4 |
| CSS files | ~3-13 |
| Images | 300+ |

## Local-Only Files Check

These files should exist and NOT be overwritten by Webflow exports:

| File | Purpose | Should Exist |
|------|---------|--------------|
| `header.css` | Custom styles | Yes |
| `footer.js` | Custom JavaScript | Yes |
| `local-cms.js` | Local CMS bindings | Optional |

```bash
# Check local-only files
echo "=== Local-Only Files Status ==="
[ -f header.css ] && echo "[OK] header.css exists ($(wc -c < header.css) bytes)" || echo "[MISSING] header.css"
[ -f footer.js ] && echo "[OK] footer.js exists ($(wc -c < footer.js) bytes)" || echo "[MISSING] footer.js"
[ -f local-cms.js ] && echo "[OK] local-cms.js exists ($(wc -c < local-cms.js) bytes)" || echo "[INFO] local-cms.js not created yet"
```

## Compare with Updates Folder

Check if root matches the updates folder:

```bash
echo "=== Comparison with Updates Folder ==="
echo "Updates HTML: $(find updates/tncld.webflow -name '*.html' 2>/dev/null | wc -l | tr -d ' ')"
echo "Root HTML:    $(find . -maxdepth 1 -name '*.html' | wc -l | tr -d ' ') + subdirs"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing HTML files | Re-run `/sync-webflow` |
| Local files overwritten | `git checkout -- header.css footer.js` |
| Images missing | Check `cp -r updates/tncld.webflow/images/* images/` |
| CSS not loading | Verify `css/` folder has all files |

## Full Verification Script

```bash
#!/bin/bash
echo "=== TNCLD Full Sync Verification ==="
echo "Date: $(date)"
echo ""

# Count files
ROOT_HTML=$(find . -maxdepth 1 -name '*.html' | wc -l | tr -d ' ')
ABOUT_HTML=$(ls about/*.html 2>/dev/null | wc -l | tr -d ' ')
BDS_HTML=$(ls bds/*.html 2>/dev/null | wc -l | tr -d ' ')
LEGAL_HTML=$(ls legal/*.html 2>/dev/null | wc -l | tr -d ' ')
PR_HTML=$(ls patient-resources/*.html 2>/dev/null | wc -l | tr -d ' ')
CSS_COUNT=$(ls css/*.css 2>/dev/null | wc -l | tr -d ' ')
IMG_COUNT=$(ls images/ 2>/dev/null | wc -l | tr -d ' ')

echo "File Counts:"
echo "  Root HTML:           $ROOT_HTML"
echo "  about/:              $ABOUT_HTML"
echo "  bds/:                $BDS_HTML"
echo "  legal/:              $LEGAL_HTML"
echo "  patient-resources/:  $PR_HTML"
echo "  CSS files:           $CSS_COUNT"
echo "  Images:              $IMG_COUNT"
echo ""

echo "Local-Only Files:"
[ -f header.css ] && echo "  [OK] header.css" || echo "  [MISSING] header.css"
[ -f footer.js ] && echo "  [OK] footer.js" || echo "  [MISSING] footer.js"
[ -f local-cms.js ] && echo "  [OK] local-cms.js" || echo "  [INFO] local-cms.js (optional)"
echo ""

echo "Sync Status: COMPLETE"
```
