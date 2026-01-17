# TNCLD - Initial Project Setup Guide

**Project:** Tennessee Centers for Laser Dentistry
**Created:** January 16, 2026
**Status:** Ready for Initial Setup

---

## 📋 Overview

This guide walks through the initial setup process for the TNCLD Webflow project. The Webflow export has been received and is staged in the `updates/` folder, ready to be synced to the project root.

---

## ✅ Prerequisites

Before starting setup:

- [ ] Webflow export downloaded ✅ (Jan 16, 2026)
- [ ] Extracted to `updates/tndlc.webflow/` ✅
- [ ] Documentation reviewed ✅
- [ ] Development environment ready
- [ ] Node.js installed (v16.0.0 or higher)

---

## 🚀 Setup Steps

### Step 1: Sync Webflow Export to Root

**Goal:** Copy all Webflow files from staging to project root

```bash
# Navigate to project directory
cd /Users/nickstanerson/Documents/GitHub/tncld

# Copy HTML files (22 pages)
cp -r updates/tndlc.webflow/*.html .

# Copy CSS directory
cp -r updates/tndlc.webflow/css .

# Copy JavaScript directory
cp -r updates/tndlc.webflow/js .

# Copy fonts directory
cp -r updates/tndlc.webflow/fonts .

# Copy images directory
cp -r updates/tndlc.webflow/images .

# Verify files copied
ls -la *.html
ls -la css/
ls -la js/
ls -la fonts/
ls -la images/ | head -20
```

**Expected Results:**
- 22 HTML files in root
- css/ directory with 3 stylesheets
- js/ directory with webflow.js
- fonts/ directory with web fonts
- images/ directory with ~142 images

---

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected Dependencies:**
- @notionhq/client (if using Notion integration)
- axios
- dotenv
- fs-extra

---

### Step 3: Create Local Testing Files

**3a. Create local-cms.js (if CMS binding needed)**

Determine if CMS bindings are needed:

```bash
# Check for CMS elements in HTML
grep -l "w-dyn-list\|w-dyn-item" *.html
```

If CMS elements found, create `local-cms.js`:

```javascript
// ===== LOCAL CMS DATA BINDING =====
// This file is for local testing only
// DO NOT transfer this to Webflow

console.log('Local CMS script loaded!');

// CMS data and bindings will be added here as needed
```

**3b. Create header.css (for custom styles)**

```css
/* ============================================= */
/*        TNCLD - CUSTOM CSS (HEAD CODE)        */
/*     Copy to Webflow: Settings > Custom Code  */
/*              > Head Code                      */
/* ============================================= */

/* Custom styles will be added here as needed */
```

**3c. Create footer.js (for custom JavaScript)**

```javascript
// =============================================
//     TNCLD - CUSTOM JAVASCRIPT (FOOTER CODE)
//  Copy to Webflow: Settings > Custom Code
//              > Footer Code
// =============================================

// Custom JavaScript will be added here as needed
```

---

### Step 4: Add Script References (if needed)

**Only if CMS bindings are required:**

```bash
# Add local-cms.js reference to all HTML pages
for file in *.html; do
  sed -i '' 's|</body>|  <script src="local-cms.js"></script>\n</body>|' "$file"
done

# Verify references added
grep -l "local-cms.js" *.html | wc -l
# Should return: 22
```

**Note:** Only add script references if CMS bindings are actually needed. Check with client requirements first.

---

### Step 5: Test Local Environment

**5a. Start Local Server**

```bash
# Start Python HTTP server
npm start
# or
python3 -m http.server 8000
```

**5b. Open Pages in Browser**

```bash
# Open homepage
open http://localhost:8000/index.html

# Test key pages
open http://localhost:8000/about.html
open http://localhost:8000/services.html
open http://localhost:8000/contact.html
```

**5c. Verification Checklist**

- [ ] Pages load without errors
- [ ] CSS styles display correctly
- [ ] Images load properly
- [ ] Fonts render correctly
- [ ] Navigation works
- [ ] Forms display properly
- [ ] Mobile responsive (check browser dev tools)
- [ ] No console errors

---

### Step 6: Assess CMS Requirements

**Check for CMS Collections:**

```bash
# Find pages with CMS elements
grep -l "w-dyn-list" *.html

# Check for collection data
ls -la cms/
```

**Common CMS Collections for Dental Sites:**
- Services (dental procedures)
- Team Members (dentists, hygienists)
- Patient Stories (testimonials)
- Blog Posts (educational content)
- FAQs

**Action Items:**
- [ ] Identify which pages use CMS
- [ ] Determine required collections
- [ ] Export CMS data from Webflow (if applicable)
- [ ] Save CSV exports to `cms/` folder
- [ ] Document collections in README.md

---

### Step 7: Document Custom Code Needs

**Assess Requirements:**

**Custom CSS (`header.css`) may be needed for:**
- [ ] Theme overrides
- [ ] Custom component styles
- [ ] Animation enhancements
- [ ] Responsive fixes
- [ ] Accessibility improvements

**Custom JavaScript (`footer.js`) may be needed for:**
- [ ] Form enhancements
- [ ] Interactive features
- [ ] Analytics tracking
- [ ] Third-party integrations
- [ ] Appointment booking system

**Action Items:**
- [ ] List specific custom code requirements
- [ ] Document in README.md Project Notes
- [ ] Plan implementation timeline

---

### Step 8: Version Control Setup (Optional but Recommended)

```bash
# Initialize git repository (if not already done)
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
package-lock.json

# Environment variables
.env
.env.local

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Temporary files
*.tmp
*.log

# Large archives (keep in updates/ only)
*.zip
*.tar.gz

# Build outputs (if applicable)
dist/
build/
EOF

# Initial commit
git add .
git commit -m "Initial setup: TNCLD Webflow project with documentation

- Added 22 HTML pages from Webflow export
- Set up project structure and documentation
- Created README.md with project overview
- Updated package.json with TNCLD details
- Added workflow documentation in markdown/
"
```

---

## 📊 Setup Verification Checklist

After completing all steps, verify:

### Files & Structure
- [ ] 22 HTML files in root directory
- [ ] css/ directory with 3 stylesheets
- [ ] js/ directory with webflow.js
- [ ] fonts/ directory with Inter and Nunito Sans
- [ ] images/ directory with ~142 images
- [ ] markdown/ directory with workflow docs
- [ ] README.md updated with TNCLD info
- [ ] package.json updated with TNCLD details

### Testing Files (if needed)
- [ ] local-cms.js created (if CMS needed)
- [ ] header.css created
- [ ] footer.js created
- [ ] Script references added (if applicable)

### Local Environment
- [ ] npm dependencies installed
- [ ] Local server runs successfully
- [ ] Pages load without errors
- [ ] Styles and fonts render correctly
- [ ] Images display properly
- [ ] No console errors

### Documentation
- [ ] README.md reflects current state
- [ ] CMS collections documented (if applicable)
- [ ] Custom code requirements noted
- [ ] Next actions clearly defined

---

## 🎯 Next Actions After Setup

Once initial setup is complete:

### Immediate Next Steps
1. **Review with Client**
   - Confirm site structure and pages
   - Identify priority customizations
   - Discuss CMS requirements

2. **Design System Review**
   - Analyze [style-guide.html](style-guide.html)
   - Document design tokens
   - Review typography and colors
   - Check component library

3. **Content Review**
   - Verify all pages have content
   - Check for placeholder text
   - Review images and alt text
   - Confirm forms are functional

4. **CMS Configuration** (if needed)
   - Set up collections in Webflow
   - Export CSV data
   - Create local-cms.js bindings
   - Test CMS pages locally

5. **Custom Code Development**
   - Implement required custom styles
   - Add custom JavaScript functionality
   - Test thoroughly locally
   - Transfer to Webflow when ready

### Pre-Launch Tasks
- [ ] Run full QA checklist (101 items)
- [ ] Framework audit
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness check
- [ ] SEO review
- [ ] Forms testing
- [ ] Analytics setup

---

## 📞 Support Resources

### Documentation
- **Project README:** [README.md](README.md)
- **Quick Start:** [markdown/QUICK-START.md](markdown/QUICK-START.md)
- **Workflows:** [markdown/GLOBAL-WEBFLOW-WORKFLOW.md](markdown/GLOBAL-WEBFLOW-WORKFLOW.md)
- **CMS Guide:** [markdown/workflows/cms-update-workflow.md](markdown/workflows/cms-update-workflow.md)
- **QA Checklist:** [markdown/quality-assurance/qa-checklist.md](markdown/quality-assurance/qa-checklist.md)

### Common Issues During Setup

**Issue: Files won't copy**
```bash
# Check source exists
ls -la updates/tndlc.webflow/

# Check permissions
chmod -R u+w .
```

**Issue: npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

**Issue: Local server won't start**
```bash
# Check if port 8000 is in use
lsof -i :8000

# Use different port
python3 -m http.server 8001
```

**Issue: Pages load but styles missing**
```bash
# Check CSS files exist
ls -la css/

# Check file references in HTML
grep -n "stylesheet" index.html
```

---

## 📋 Project Status Tracking

Update this section as you complete setup steps:

### Setup Progress
- [x] Webflow export received (Jan 16, 2026)
- [x] Documentation created (Jan 16, 2026)
- [x] Files synced to root (Jan 16, 2026)
- [x] Dependencies installed (Jan 16, 2026)
- [x] Local testing files created (Jan 16, 2026)
- [x] Local server tested (Jan 16, 2026)
- [ ] CMS requirements assessed
- [ ] Custom code requirements documented
- [ ] Version control initialized

### Current Status
**Status:** ✅ Initial setup complete - Ready for development
**Last Updated:** January 16, 2026
**Next Step:** Assess CMS requirements and plan custom code

---

## ✅ Setup Complete Confirmation

Once all steps are finished, update README.md:

1. Change project status to "Active Development"
2. Update "Current Status" section
3. Remove "Initial setup required" warnings
4. Add completion date to Maintenance Log

**Setup Completion Template:**

```markdown
| Date | Action | Notes |
|------|--------|-------|
| 2026-01-16 | Initial export received | 22 pages, exported to updates/ |
| 2026-01-16 | Documentation setup | README and workflow docs created |
| YYYY-MM-DD | Initial setup completed | Files synced, local environment tested |
```

---

**Setup Guide Created:** January 16, 2026
**Maintained By:** Brik Designs
**Last Updated:** January 16, 2026
