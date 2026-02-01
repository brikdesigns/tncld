# TNCLD - Tennessee Centers for Laser Dentistry
## Webflow Local Development Project

---

## 📋 Project Overview

**Client:** Tennessee Centers for Laser Dentistry (TNCLD)
**Project Type:** Multi-page dental practice website
**Platform:** Webflow (local development & testing environment)
**Status:** In Development

### Live Site
- **URL:** TBD (Webflow site URL will be added upon launch)

### Project Goals
- Modern, professional dental practice website
- Patient-focused information architecture
- Service showcase and appointment booking
- Educational resources for patients
- Insurance and payment information

---

## 📁 Project Structure

```
tncld/
├── README.md                    # This file - Project overview
├── *.html                       # 22 HTML pages (synced from Webflow)
├── local-cms.js                 # Local CMS bindings (NEVER transfer to Webflow)
├── header.css                   # Custom CSS → Transfer to Webflow Head Code
├── footer.js                    # Custom JavaScript → Transfer to Webflow Footer Code
│
├── css/                         # Webflow-exported stylesheets
│   ├── tndlc.webflow.css       # Project-specific styles
│   ├── normalize.css
│   └── webflow.css
│
├── js/                          # JavaScript files
│   └── webflow.js
│
├── fonts/                       # Web fonts (Inter, Nunito Sans)
├── images/                      # Image assets (~142 images)
│
├── cms/                         # CMS data exports (if applicable)
│   └── [Collection exports].csv
│
├── markdown/                    # Project-specific documentation
│   ├── figma-page-structures.md    # Figma page analysis for rebuild
│   ├── new-patients-page-spec.md   # New Patients page specification
│   ├── webflow-custom-code-transfer.md # Custom code transfer (TNCLD verified)
│   └── archive/                    # Historical audits
│
└── updates/                     # Webflow export staging area
    └── tndlc.webflow/          # Latest Webflow export (Jan 16, 2026)
        └── [22 HTML files + assets]
```

---

## 📄 Site Pages (22 Total)

### Main Pages
- [index.html](index.html) - Homepage
- [about.html](about.html) - About the practice
- [services.html](services.html) - Services overview
- [contact.html](contact.html) - Contact form & information
- [faqs.html](faqs.html) - Frequently asked questions

### Patient Pages
- [new-patients.html](new-patients.html) - New patient information
- [patient-resources.html](patient-resources.html) - Patient resources
- [patient-stories.html](patient-stories.html) - Patient testimonials
- [payments-and-insurance.html](payments-and-insurance.html) - Payment options
- [request-appointment.html](request-appointment.html) - Appointment booking

### Detail Pages (Templates)
- [detail_services.html](detail_services.html) - Service detail template
- [detail_dental.html](detail_dental.html) - Dental content template
- [detail_about-pages.html](detail_about-pages.html) - About page template
- [detail_home.html](detail_home.html) - Home content template
- [detail_post.html](detail_post.html) - Blog post template
- [detail_icons.html](detail_icons.html) - Icon showcase template
- [detail_industry.html](detail_industry.html) - Industry template

### Utility Pages
- [components.html](components.html) - Component library
- [modules.html](modules.html) - Module library
- [style-guide.html](style-guide.html) - Style guide & design system
- [privacy.html](privacy.html) - Privacy policy
- [terms.html](terms.html) - Terms of service

---

## 🚀 Quick Start

### Initial Setup (First Time)

If you're setting up this project for the first time, follow the [setup workflow](#workflow-1-initial-project-setup) below.

### Working with CMS Data

To update CMS bindings, simply say:
```
"update cms"
```

The automated workflow will handle everything. See [_newclient/markdown/quick-start.md](../_newclient/markdown/quick-start.md) for workflow details.

### Syncing Latest Webflow Changes

When Webflow exports a new version:
```
"sync webflow updates"
```

See [Workflow 3: Webflow Updates Sync](#workflow-3-webflow-updates-sync) below.

---

## 🔄 Standard Workflows

### Workflow 1: Initial Project Setup

**Status:** ✅ **COMPLETED** - Initial setup finished January 16, 2026

**Current State:**
- ✅ Webflow export downloaded ([updates/tndlc.webflow/](updates/tndlc.webflow/))
- ✅ Documentation structure in place
- ✅ Files synced to root (22 HTML pages)
- ✅ Local testing files created ([header.css](header.css), [footer.js](footer.js))
- ✅ Dependencies installed
- ✅ Local server tested successfully

**Next Steps:**

1. **Sync Webflow Export to Root**
   ```bash
   # Copy all HTML, CSS, JS, fonts, images from updates/ to root
   cp -r updates/tndlc.webflow/*.html .
   cp -r updates/tndlc.webflow/css .
   cp -r updates/tndlc.webflow/js .
   cp -r updates/tndlc.webflow/fonts .
   cp -r updates/tndlc.webflow/images .
   ```

2. **Create Local Testing Files**
   - Create `local-cms.js` (if CMS bindings needed)
   - Create `header.css` (for custom styles)
   - Create `footer.js` (for custom JavaScript)

3. **Add Script References to ALL HTML Pages**
   ```bash
   # Add local-cms.js reference (if needed)
   for file in *.html; do
     sed -i '' 's|</body>|  <script src="local-cms.js"></script>\n</body>|' "$file"
   done
   ```

4. **Test Local Environment**
   - Open pages in browser
   - Verify styles load correctly
   - Test any interactive features

**See Also:** [brik-bds/markdown/global-webflow-workflow.md](../brik-bds/markdown/global-webflow-workflow.md) - Universal workflow standards

---

### Workflow 2: CMS Binding Updates

**When to Use:** When CMS collections need local testing

**Quick Command:**
```
"update cms"
```

**What It Does:**
- Scans all HTML pages for CMS elements
- Updates [local-cms.js](local-cms.js) with proper bindings
- Adds script references to all pages
- Tests all bindings

**See Also:** [_newclient/markdown/](../_newclient/markdown/) - CMS binding workflows (universal standards)

---

### Workflow 3: Webflow Updates Sync

**When to Use:** When syncing latest Webflow export

**Steps:**
1. Download latest export from Webflow
2. Extract to [updates/tndlc.webflow/](updates/tndlc.webflow/)
3. Copy files to root (overwrite existing)
4. Restore local-only files ([local-cms.js](local-cms.js), [header.css](header.css), [footer.js](footer.js))
5. Re-add script references if needed
6. Test everything

**See Also:** [brik-bds/markdown/global-webflow-workflow.md](../brik-bds/markdown/global-webflow-workflow.md)

---

### Workflow 4: Custom Code Transfer to Webflow

**Files to Transfer:**
- ✅ [header.css](header.css) → Webflow Settings → Custom Code → Head Code (wrap in `<style>` tags)
- ✅ [footer.js](footer.js) → Webflow Settings → Custom Code → Footer Code (wrap in `<script>` tags)
- ❌ [local-cms.js](local-cms.js) → **NEVER transfer** (local testing only)

**Quick Commands (Automated via Claude + Webflow MCP):**
```
"Transfer header.css to Webflow head code"
"Transfer footer.js to Webflow footer code"
"Transfer all custom code to Webflow"
"List registered scripts for my site"
"Remove all custom scripts from site"
```

**Manual Transfer (Fallback):**
```
"Show me the manual transfer steps for Webflow"
```

**See Also:** [markdown/webflow-custom-code-transfer.md](markdown/webflow-custom-code-transfer.md) - Detailed transfer guide (TNCLD verified)

---

### Workflow 5: GitHub → Webflow Code Sync

**When:** After committing code changes locally, ready to push to Webflow

**Quick Commands:**
```
"I just committed changes to header.css - push to Webflow"
"Sync my local custom code to Webflow"
"Compare local vs Webflow custom code"
"What version of custom code is live on Webflow?"
"Rollback to previous version"
```

**See Also:** [_newclient/markdown/archive/github-webflow-sync.md](../_newclient/markdown/archive/github-webflow-sync.md)

---

### Workflow 6: Notion ↔ Webflow Content Sync

**When:** Cross-checking content between Notion and Webflow, or updating content directly

**Quick Commands:**
```
"Compare Notion content with Webflow for this project"
"Find content missing from Webflow that exists in Notion"
"Update Webflow page [name] with Notion content"
"Migrate FAQ items from Notion to Webflow CMS"
"Generate content gap report"
```

**See Also:** [_newclient/markdown/archive/notion-webflow-content-sync.md](../_newclient/markdown/archive/notion-webflow-content-sync.md)

---

## 🎨 Design System

### Typography
- **Primary Font:** Inter (100-900 weights)
- **Secondary Font:** Nunito Sans (200-900 weights)

### Technology Stack
- **CMS:** Webflow CMS
- **Animations:** GSAP 3.12.2 (ScrollTrigger, ScrollSmoother)
- **Icons:** Font Awesome Kit (cd4a011d2b)
- **Framework:** Webflow Designer

### Style Guide
See [style-guide.html](style-guide.html) for complete design system documentation.

---

## 📊 CMS Collections

**Status:** To be determined based on Webflow CMS setup

### Potential Collections
Based on the page structure, possible CMS collections include:
- **Services** - Dental services offered
- **Team Members** - Dentists and staff (if applicable)
- **Patient Stories** - Testimonials and case studies
- **Blog Posts** - Educational content (if blog is used)
- **FAQs** - Frequently asked questions

### CMS Data Location
When CMS is configured, export CSV files to [cms/](cms/) folder for reference.

---

## 🔧 Development Commands

### Local Server
```bash
# Start local development server (Python)
npm start
# or
npm run dev
# or
npm run serve
# Server runs on http://localhost:8000
```

### Webflow CLI (if configured)
```bash
npm run deploy    # Deploy to Webflow
npm run export    # Export from Webflow
```

### Testing
```bash
npm test          # Run tests (if configured)
```

---

## 📝 Documentation Reference

### Project-Specific (in this repo)

- **[markdown/figma-page-structures.md](markdown/figma-page-structures.md)** - Figma page analysis for rebuild
- **[markdown/new-patients-page-spec.md](markdown/new-patients-page-spec.md)** - New Patients page specification
- **[markdown/webflow-custom-code-transfer.md](markdown/webflow-custom-code-transfer.md)** - Custom code transfer (TNCLD verified)

### Global Standards (in brik-bds)

- **[brik-bds/markdown/global-webflow-workflow.md](../brik-bds/markdown/global-webflow-workflow.md)** - Universal workflow standards
- **[brik-bds/markdown/naming-framework.md](../brik-bds/markdown/naming-framework.md)** - Naming conventions
- **[brik-bds/markdown/qa-checklist.md](../brik-bds/markdown/qa-checklist.md)** - QA checklist

### CMS Workflows (in _newclient template)

- **[_newclient/markdown/quick-start.md](../_newclient/markdown/quick-start.md)** - CMS update commands
- **[_newclient/markdown/cms-update-workflow.md](../_newclient/markdown/cms-update-workflow.md)** - Full CMS workflow
- **[_newclient/markdown/local-cms-binding.md](../_newclient/markdown/local-cms-binding.md)** - Technical patterns

---

## ✅ Quality Assurance

### QA Schedule

**Before Launch:**
- [ ] Run full QA checklist (101 items)
- [ ] Framework audit
- [ ] Cross-browser testing
- [ ] Mobile responsiveness check
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance audit (Lighthouse)

**Quarterly (After Launch):**
- [ ] Framework audit
- [ ] Image optimization audit
- [ ] Positioning audit
- [ ] Content review
- [ ] Performance monitoring

### QA Resources

- **Checklist:** [brik-bds/markdown/qa-checklist.md](../brik-bds/markdown/qa-checklist.md)
- **Positioning Reference:** [brik-bds/markdown/positioning-quick-reference.md](../brik-bds/markdown/positioning-quick-reference.md)

---

## 🔒 Important Rules

### Critical Guidelines
1. **local-cms.js** - Never transfer to Webflow (local testing only)
2. **header.css** - Transfer to Webflow Head Code when ready
3. **footer.js** - Transfer to Webflow Footer Code when ready
4. **Script References** - Add to ALL HTML pages (including static pages)
5. **Cross-Collection References** - Understand CMS data relationships when binding

### Security Notes
- No API tokens or credentials in public files
- Environment variables in `.env` (not committed to git)
- Remove any hardcoded sensitive data before deployment

---

## 📞 Support & Resources

### Documentation

- **Quick Start:** [_newclient/markdown/quick-start.md](../_newclient/markdown/quick-start.md)
- **CMS Help:** [_newclient/markdown/cms-update-workflow.md](../_newclient/markdown/cms-update-workflow.md)
- **Custom Code Transfer:** [markdown/webflow-custom-code-transfer.md](markdown/webflow-custom-code-transfer.md)

### Common Issues
- **Navigation not working?** → Ensure `local-cms.js` is in ALL pages
- **CMS bindings not showing?** → Check selectors match HTML classes
- **JavaScript errors?** → Verify code is wrapped in functions
- **Custom code not working?** → Verify `header.css` and `footer.js` references

---

## 📋 Project Notes

### Current Status (January 2026)
- ✅ Webflow export received (Jan 16, 2026)
- ✅ Documentation structure established
- ✅ Initial setup completed (Jan 16, 2026)
- ✅ Files synced to root (22 HTML, 172 images)
- ✅ Local testing files created (header.css, footer.js)
- ⚠️ CMS configuration to be determined
- ⚠️ Custom code requirements to be assessed

### Next Actions
1. **Complete Initial Setup** - Sync Webflow export to root
2. **Assess CMS Needs** - Determine which collections need local testing
3. **Review Design System** - Document any custom styles needed
4. **Plan Custom Code** - Identify any custom JavaScript/CSS requirements
5. **QA Preparation** - Set up QA schedule and checklists

### Future Enhancements
- [ ] Implement CMS bindings (if needed)
- [ ] Add custom interactions (if required)
- [ ] Optimize images
- [ ] Configure forms
- [ ] Set up analytics
- [ ] Performance optimization

---

## 📅 Maintenance Log

| Date | Action | Notes |
|------|--------|-------|
| 2026-01-16 | Initial export received | 22 pages, exported to updates/ |
| 2026-01-16 | Documentation setup | README and workflow docs created |
| 2026-01-16 | Initial setup completed | Files synced, local env tested, ready for development |

---

**Project Maintained By:** Brik Designs
**Last Updated:** January 16, 2026
**Next Review:** After initial setup completion

---

## Quick Links

- [Webflow Site](#) (TBD)
- [Style Guide](style-guide.html)
- [Component Library](components.html)
- [Project Docs](markdown/)
- [QA Checklist](../brik-bds/markdown/qa-checklist.md)
