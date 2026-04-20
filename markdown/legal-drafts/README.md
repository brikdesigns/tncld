# TNCLD Legal Page Drafts

**Status:** Draft — requires TNCLD + legal counsel review before publishing to Webflow.

## Context

Audit on 2026-04-20 revealed the live [Privacy Policy](https://tncld.com/legal/privacy) contained content from a different client entirely (Atlantic Aluminum Marine boat company — wrong email, product refund policy, Florida governing law). These drafts replace that placeholder content with proper documents for a Tennessee dental practice.

## Documents in this folder

| File | Replaces | Priority |
|------|----------|----------|
| `privacy-policy.md` | `/legal/privacy` page | **Critical** — current page is wrong-client content |
| `terms-and-conditions.md` | `/legal/terms` page | High — existing content has duplicate numbering |
| `notice-of-privacy-practices.md` | New page (`/legal/notice-of-privacy-practices`) | High — HIPAA requirement, currently missing |
| `accessibility-statement.md` | New page (`/legal/accessibility`) | Medium — reduces ADA lawsuit damages |
| `website-disclaimer.md` | `/legal/disclaimer` page | Low — current is acceptable, minor polish |

## Review gates before publish

1. **TNCLD Privacy Officer review.** HIPAA requires a designated Privacy Officer (required by 45 CFR § 164.530). Their name + contact go in the Notice of Privacy Practices.
2. **Legal counsel review.** These drafts are strong starting points, not attorney-vetted final copy. A Tennessee healthcare attorney should review — especially the NPP, which has specific content requirements under the HIPAA Privacy Rule.
3. **TNCLD sign-off on practice-specific details.** Placeholder data (`[BRACKETED]`) must be replaced: business address, Privacy Officer name, complaint process, data retention periods per Tennessee state law.

## Publish process (after approval)

These are Webflow *static* pages (not CMS items), so content is edited in Webflow Designer directly:

1. Open Webflow Designer → Pages → `/legal/privacy` (etc.)
2. Replace body content with approved draft
3. Update "Last Updated" and "Effective Date" to publish date
4. Publish via Webflow (or run `deploy.sh` which includes publish hook)

## HIPAA ≠ ADA ≠ Website Privacy

Three distinct legal regimes. These documents address them separately:

- **HIPAA Privacy Rule** — protects PHI (Protected Health Information). Governs how TNCLD handles patient info obtained during care. The Notice of Privacy Practices is the required patient-facing document.
- **ADA Title III** — accessibility. Measured against WCAG 2.1 AA. Addressed by the Accessibility Statement + remediation work (separate task).
- **Website Privacy (state-level)** — California CCPA/CPRA, Virginia VCDPA, etc. Governs what the *website* collects (cookies, analytics, form submissions before a provider relationship exists). Addressed in Privacy Policy.
