# GitHub → Webflow Code Sync Workflow

## Overview

This document outlines processes for syncing local code changes (tracked in GitHub) to Webflow. While there's no native GitHub ↔ Webflow integration, we use Claude + Webflow MCP to bridge the gap.

---

## Quick Reference

| Workflow | Trigger | What Syncs |
|----------|---------|------------|
| **Manual Sync** | User request | `header.css`, `footer.js` |
| **Commit-Aware Sync** | After git commit | Custom code files |
| **Diff-Based Update** | Compare versions | Only changed code |

---

## Workflow 1: Manual Sync After Commit

### When to Use
- After committing changes to `header.css` or `footer.js`
- Before deploying to production
- When reviewing changes with client

### Quick Commands

```
"I just committed changes to header.css - push to Webflow"
"Sync my local custom code to Webflow"
"Push latest footer.js to Webflow"
```

### What Happens

1. Claude reads the local file
2. Checks current Webflow scripts via MCP
3. Removes old version if exists
4. Uploads new version with incremented version number
5. Confirms deployment

---

## Workflow 2: Git Diff-Aware Updates

### When to Use
- To see what changed before pushing
- To selectively push only modified files
- For code review before Webflow deployment

### Quick Commands

```
"Show me what changed in header.css since last Webflow push"
"Compare local footer.js with what's in Webflow"
"Push only the files that changed"
```

### Process

1. **Check Git Status**
   ```bash
   git diff --name-only HEAD~1
   ```

2. **Identify Custom Code Changes**
   - Look for `header.css` or `footer.js` in changed files

3. **Compare with Webflow**
   - List registered scripts: `data_scripts_tool > list_registered_scripts`
   - Compare versions/timestamps

4. **Selective Push**
   - Only push files that actually changed

---

## Workflow 3: Version-Controlled Deployments

### Best Practice: Version Your Code

Add version headers to track deployments:

**header.css:**
```css
/* Version: 1.2.0 - 2026-01-16 */
/* Git Commit: abc123 */
```

**footer.js:**
```javascript
// Version: 1.2.0 - 2026-01-16
// Git Commit: abc123
const SCRIPT_VERSION = '1.2.0';
console.log('[PROJECT] v' + SCRIPT_VERSION + ' loaded');
```

### Quick Commands

```
"What version of custom code is live on Webflow?"
"Update Webflow with version 1.3.0 of header.css"
"Tag this deployment in git"
```

---

## Workflow 4: Rollback Process

### If Something Breaks

1. **Check Git History**
   ```bash
   git log --oneline header.css
   git log --oneline footer.js
   ```

2. **Restore Previous Version**
   ```bash
   git checkout HEAD~1 -- header.css
   ```

3. **Push Restored Version to Webflow**
   ```
   "Push the restored header.css to Webflow"
   ```

### Quick Commands

```
"Rollback Webflow custom code to previous version"
"Restore header.css from commit abc123 and push to Webflow"
```

---

## Git Commit Conventions

### Recommended Commit Messages

```bash
# For custom code changes
git commit -m "feat(webflow): add mobile nav fix to header.css"
git commit -m "fix(webflow): resolve form validation in footer.js"
git commit -m "style(webflow): update button hover states"

# For Webflow sync
git commit -m "deploy(webflow): push v1.2.0 custom code"
```

### After Webflow Deployment

```bash
# Tag the deployment
git tag -a webflow-v1.2.0 -m "Deployed to Webflow 2026-01-16"
git push origin webflow-v1.2.0
```

---

## Automation Opportunities

### Future Enhancement: GitHub Actions

A GitHub Action could automatically notify when custom code changes:

```yaml
# .github/workflows/webflow-notify.yml
name: Webflow Code Change Notification
on:
  push:
    paths:
      - 'header.css'
      - 'footer.js'
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify about Webflow code change
        run: echo "Custom code changed - remember to push to Webflow"
```

### Future Enhancement: Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit
if git diff --cached --name-only | grep -E "(header\.css|footer\.js)"; then
  echo "⚠️  Custom code modified - remember to sync to Webflow after commit"
fi
```

---

## Limitations

- **No automatic sync** - Webflow doesn't support GitHub integration for custom code
- **Manual trigger required** - Claude must be asked to push changes
- **2000 char limit** - Large files need manual transfer or condensing
- **No two-way sync** - Changes in Webflow Designer don't sync back to local

---

## Quick Commands Summary

```
# Push to Webflow
"Push header.css to Webflow"
"Push footer.js to Webflow"
"Push all custom code to Webflow"

# Check Status
"What custom code is currently on Webflow?"
"Compare local vs Webflow custom code"
"List all registered scripts"

# Version Control
"What version is live on Webflow?"
"Tag this deployment as v1.2.0"
"Rollback to previous version"

# After Git Operations
"I just committed - push changes to Webflow"
"Show me what changed since last Webflow push"
```

---

## Related Documentation

- [WEBFLOW-CUSTOM-CODE-TRANSFER.md](WEBFLOW-CUSTOM-CODE-TRANSFER.md) - Transfer mechanics
- [GLOBAL-WEBFLOW-WORKFLOW.md](../GLOBAL-WEBFLOW-WORKFLOW.md) - Overall workflow
- [Git Best Practices](https://git-scm.com/book/en/v2) - External resource

---

**Last Updated:** January 2026
**Maintained By:** Brik Designs
