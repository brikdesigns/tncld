---
name: sync-webflow
description: Sync latest Webflow export from updates folder to root directory. Use when user says "sync webflow updates" or "sync from updates folder"
disable-model-invocation: true
allowed-tools: Bash, Read, Glob
---

# Sync Webflow Updates to Root

Sync the latest Webflow export from `updates/tncld.webflow/` to the project root while preserving local-only files.

## Pre-Sync Checklist

1. Verify updates folder exists: `ls updates/tncld.webflow/`
2. Check for local-only files to preserve:
   - `header.css` (custom styles)
   - `footer.js` (custom JavaScript)
   - `local-cms.js` (local CMS bindings - NEVER transfer to Webflow)

## Sync Process

### Step 1: Copy HTML Files
```bash
# Copy root-level HTML files
cp -r updates/tncld.webflow/*.html .

# Create subdirectories if needed and copy
mkdir -p about bds legal patient-resources
cp -r updates/tncld.webflow/about/*.html about/
cp -r updates/tncld.webflow/bds/*.html bds/
cp -r updates/tncld.webflow/legal/*.html legal/
cp -r updates/tncld.webflow/patient-resources/*.html patient-resources/
```

### Step 2: Copy Asset Folders
```bash
cp -r updates/tncld.webflow/css/* css/
cp -r updates/tncld.webflow/js/* js/
cp -r updates/tncld.webflow/images/* images/
```

### Step 3: Verify Local-Only Files Preserved
```bash
ls -la header.css footer.js local-cms.js 2>/dev/null
```

## Post-Sync Verification

Run `/verify-sync` to confirm all files are in place.

## Important Notes

- **NEVER overwrite** `local-cms.js`, `header.css`, or `footer.js` with Webflow exports
- These files contain local customizations that should persist across syncs
- If local-only files are accidentally overwritten, restore from git: `git checkout -- header.css footer.js`
