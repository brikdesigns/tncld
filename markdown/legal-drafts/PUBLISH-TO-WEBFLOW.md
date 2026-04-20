# Webflow Publish Guide — Legal Pages

**Why manual:** Webflow API v2 restricts `update_static_content` to *secondary* locales only. TNCLD uses only the primary (English) locale, so page content must be edited in the Webflow Designer. Tested and confirmed 2026-04-20.

**Est. total time:** ~20 min for all six pages + typo fix.

---

## Quick reference — Webflow page IDs

| Page | ID | URL |
|------|----|----|
| Privacy (existing, REPLACE content) | `694f1892a016a6340049f7e9` | `/legal/privacy` |
| Terms (existing, REPLACE content) | `694f1892a016a6340049f7e8` | `/legal/terms` |
| Disclaimer (existing, REPLACE content) | `698cd0737125a9be02b75f89` | `/legal/disclaimer` |
| Contact (existing, fix "Miler" typo) | `694f1892a016a6340049f7e0` | `/contact` |
| Legal folder parent | `6976484324...` | `/legal/` |
| Notice of Privacy Practices (**CREATE**) | _new_ | `/legal/notice-of-privacy-practices` |
| Accessibility Statement (**CREATE**) | _new_ | `/legal/accessibility` |

---

## Step 1 — Fix existing pages (5 min each)

For `/legal/privacy`, `/legal/terms`, `/legal/disclaimer`:

1. Open Webflow Designer → Pages panel → select the page
2. Click anywhere in the main content container
3. Duplicate the existing content section, hide the old one (keep as backup until published, then delete)
4. Paste the approved draft content from:
   - [`privacy-policy.md`](privacy-policy.md) → `/legal/privacy`
   - [`terms-and-conditions.md`](terms-and-conditions.md) → `/legal/terms`
   - [`website-disclaimer.md`](website-disclaimer.md) → `/legal/disclaimer`
5. Keep the existing page header, nav, and footer — only the body content changes

**Shortcut:** because all three pages share the same content structure (`<h1>` heading + numbered sections), you can:
- Keep the existing section elements
- Update the `<h1>` text
- Replace each numbered section's heading and paragraph text via inline editing
- Delete obsolete sections (like the "Refund & Return Policy" on `/legal/privacy`)
- Add any new sections needed

---

## Step 2 — Create two new pages (5 min each)

### Notice of Privacy Practices

1. Pages panel → Legal folder → "+" New Page
2. Settings:
   - **Name:** Notice of Privacy Practices
   - **Slug:** `notice-of-privacy-practices`
   - **Meta title:** Notice of Privacy Practices | Tennessee Center for Laser Dentistry
   - **Meta description:** How TNCLD uses and discloses Protected Health Information (PHI) under HIPAA, and how patients can access their health information.
3. Duplicate the structure of `/legal/terms` as a starting template
4. Replace content with [`notice-of-privacy-practices.md`](notice-of-privacy-practices.md)

### Accessibility Statement

1. Pages panel → Legal folder → "+" New Page
2. Settings:
   - **Name:** Accessibility Statement
   - **Slug:** `accessibility`
   - **Meta title:** Accessibility Statement | Tennessee Center for Laser Dentistry
   - **Meta description:** TNCLD is committed to web accessibility. How we meet WCAG 2.1 AA, how to report issues, and how to request information in alternative formats.
3. Duplicate the structure of `/legal/disclaimer` as a starting template
4. Replace content with [`accessibility-statement.md`](accessibility-statement.md)

---

## Step 3 — Fix "Miler" typo on /contact

The contact page currently displays:
> 204 **Miler** Springs Ct. Suite 200, Franklin, TN 37064

Should be:
> 204 **Miller** Springs Ct., Suite 200, Franklin, TN 37064

Search for "Miler" across the site — may appear in multiple places (contact page, footer, Google Maps label):

1. Pages → `/contact` → find the address block → change "Miler" → "Miller"
2. Check if address appears in a **symbol/component** (footer, nav) — if yes, edit the component once and it updates everywhere
3. Google Maps embed uses the aria-label — update that too

---

## Step 4 — Update footer legal links

After creating the two new pages, update the footer to link to them:

1. Open the footer symbol/component
2. In the legal links group (currently: Privacy Policy | Terms and Conditions | Website Disclaimer)
3. Add two new links:
   - **Notice of Privacy Practices** → `/legal/notice-of-privacy-practices`
   - **Accessibility** → `/legal/accessibility`

---

## Step 5 — Publish

1. In Webflow Designer, click **Publish** → **Publish to tncld.com**
2. Wait ~60 seconds for DNS propagation
3. Verify each page loads:
   - [tncld.com/legal/privacy](https://tncld.com/legal/privacy)
   - [tncld.com/legal/terms](https://tncld.com/legal/terms)
   - [tncld.com/legal/disclaimer](https://tncld.com/legal/disclaimer)
   - [tncld.com/legal/notice-of-privacy-practices](https://tncld.com/legal/notice-of-privacy-practices)
   - [tncld.com/legal/accessibility](https://tncld.com/legal/accessibility)
4. Confirm the "Miler" → "Miller" typo is fixed on `/contact`

---

## Step 6 — Final checks

After publish:

- [ ] HIPAA Privacy Officer name inserted (replaces "The Practice Manager" placeholder in Privacy Policy + Notice of Privacy Practices)
- [ ] Legal counsel has reviewed content (especially the NPP)
- [ ] Footer links updated to include the two new pages
- [ ] Accessibility Statement page is discoverable (footer link)
- [ ] NPP also available as a printed document at the front desk (HIPAA best practice)
