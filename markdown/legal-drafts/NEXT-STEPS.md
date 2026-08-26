# TNCLD A11y + Legal — Next Steps

**Last updated:** 2026-04-20
**Owner:** Nick (+ TNCLD for client-side decisions)

Three work streams. Do them in this order — each unblocks the next.

---

## Legal framework for TNCLD

**Confirmed 2026-04-20:** TNCLD does **not** accept Medicare/Medicaid → no federal funding received → **Section 1557 of the ACA and Section 504 do not apply.**

Still applicable:

- **ADA Title III (42 USC § 12181; 28 CFR § 36)** — covers dental practices as "professional offices of health care providers." Requires effective communication with patients with disabilities (auxiliary aids, alternative formats, TTY). WCAG 2.1 AA is the de-facto standard DOJ applies to websites under Title III.
- **HIPAA Privacy Rule (45 CFR § 164.500-534)** — requires Notice of Privacy Practices, designated Privacy Officer, and privacy safeguards for PHI regardless of federal funding status.
- **Tennessee Human Rights Act (T.C.A. § 4-21-501)** — state-level prohibition on disability discrimination in public accommodations.

Not applicable (unless Medicare/Medicaid status changes): Section 1557 ACA, Section 504 Rehabilitation Act.

---

## Stream 1 — Client-side decisions (blocks publishing)

Cannot publish legal pages to Webflow until TNCLD resolves these.

### 1.1 Designate HIPAA Privacy Officer

- **What:** HIPAA (45 CFR § 164.530) requires a named individual as Privacy Officer
- **Currently in drafts:** placeholder "The Practice Manager" — must be replaced with a person
- **Action:** TNCLD picks one (typically the Practice Manager, Office Manager, or a provider) and sends the name
- **Where it appears:** [`privacy-policy.md`](privacy-policy.md) §11, [`notice-of-privacy-practices.md`](notice-of-privacy-practices.md) "Exercising Your Rights" + "Complaints" sections

### 1.2 Designate Accessibility Coordinator

- **What:** ADA Title III expects a point of contact for auxiliary aids requests and disability-related grievances
- **Currently in drafts:** references "Accessibility Coordinator" at `accessibility@tncld.com`
- **Action:** TNCLD confirms the email alias routes to a named individual + adds them to inbox for prompt response (target: 5 business days for accessibility feedback, 15 business days for grievances)
- **Where it appears:** [`accessibility-statement.md`](accessibility-statement.md) "Feedback and Concerns" section

### 1.3 Legal counsel review

- **What:** A Tennessee healthcare attorney reviews Privacy Policy + Notice of Privacy Practices + Accessibility Statement
- **Why:** NPP has specific content requirements under the HIPAA Privacy Rule; state law may modify retention/minors provisions; the grievance procedure in the Accessibility Statement should be vetted against Tennessee Human Rights Act language
- **Est. attorney time:** 1-2 hours
- **Action:** TNCLD sends drafts to counsel and relays any revisions

### 1.4 Confirm address formatting

- **Confirmed:** `204 Miller Springs Ct., Suite 200, Franklin, TN 37064`
- **Confirmed:** Williamson County (for governing law clause)
- No action needed unless TNCLD wants a different suite number or formatting

### 1.5 ~~Confirm physical accessibility claims~~ — struck; the claims were removed

- The four premises claims (ADA-compliant parking, step-free entrance, accessible restrooms, accessible treatment rooms) were agent-written with no client source, and a fifth sat in [`PUBLISH-TO-WEBFLOW.md`](PUBLISH-TO-WEBFLOW.md). All five are removed.
- Asking TNCLD to ratify agent-invented claims was the wrong direction: the agent should not have written them. See brik-llm#2649.
- **No action required of TNCLD.** If they *volunteer* specific accessibility features in their own words, those may be added as a sourced list — that is a new statement, not a confirmation of this one.

---

## Stream 2 — Webflow Designer work (~25 min — Brik)

Blocked by Stream 1.1 + 1.2. Once the Privacy Officer name is in, do all of this in one Designer session.

Full click-by-click guide: [`PUBLISH-TO-WEBFLOW.md`](PUBLISH-TO-WEBFLOW.md).

### 2.1 Replace content on existing pages

- [ ] `/legal/privacy` — replace wrong-client (boat company) content with [`privacy-policy.md`](privacy-policy.md)
- [ ] `/legal/terms` — replace with [`terms-and-conditions.md`](terms-and-conditions.md) (fixes duplicate numbering + Florida governing-law error)
- [ ] `/legal/disclaimer` — replace with [`website-disclaimer.md`](website-disclaimer.md)

### 2.2 Create two new pages

- [ ] `/legal/notice-of-privacy-practices` — [`notice-of-privacy-practices.md`](notice-of-privacy-practices.md) **HIPAA requirement**
- [ ] `/legal/accessibility` — [`accessibility-statement.md`](accessibility-statement.md) — now covers **ADA Title III effective communication** (auxiliary aids, TTY/711, alternative formats, physical office access) + non-discrimination notice + grievance process

### 2.3 Fix "Miler" → "Miller" typo

- [ ] `/contact` page address block
- [ ] Check if the typo also appears in a footer symbol/component
- [ ] Check Google Maps iframe aria-label

### 2.4 Add accessibility block to /contact

- [ ] Add the short accessibility paragraph from [`PUBLISH-TO-WEBFLOW.md`](PUBLISH-TO-WEBFLOW.md) Step 3 to the contact page (auxiliary aids + TTY + wheelchair accessibility). Title III requires this information to be visible where patients expect it.

### 2.5 Update footer

- [ ] Add footer links to the two new pages (NPP + Accessibility)

### 2.6 Publish

- [ ] Webflow Designer → Publish → Publish to tncld.com
- [ ] Verify all 5 legal URLs load correctly

---

## Stream 3 — Accessibility validation (~45 min — Brik)

Does not block publishing but should happen this week for lawsuit-grade defensibility.

### 3.1 ~~Wait for jsDelivr CDN propagation~~ — resolved, premise was wrong

- **Status at 2026-04-20:** `@<commit-sha>` URLs serve correctly; `@main` alias still cached stale
- **~~Expected to auto-resolve within 1-4 hours of last purge~~** — it does not. jsDelivr caches each `Accept-Encoding` variant separately and a purge does not clear them together (tncld#33). The site is pinned to a commit SHA and `@main` is no longer used.
- **Verify:** `bash scripts/verify-live-assets.sh` — checks the URL the live site actually loads, on every encoding.

### 3.2 Re-run Lighthouse (5 min)

- [ ] Hard-refresh tncld.com in browser (Cmd+Shift+R)
- [ ] Run Lighthouse a11y on homepage + contact + request-appointment + one service page
- [ ] Target: 95+ on each (was 83-87 before)
- [ ] Log any remaining issues

### 3.3 Execute manual test plan (45 min)

Full plan: [`MANUAL-A11Y-TEST-PLAN.md`](MANUAL-A11Y-TEST-PLAN.md)

- [ ] Test 1 — Keyboard-only navigation (15 min)
- [ ] Test 2 — VoiceOver screen reader pass (20 min)
- [ ] Test 3 — Focus management in modals (5 min)
- [ ] Test 4 — Reduced motion setting (2 min)
- [ ] Test 5 — 200% zoom (3 min)

### 3.4 Address P0/P1 findings

- [ ] Log every finding with page URL + steps to reproduce + WCAG criterion violated
- [ ] Create follow-up tasks (Brik) or Designer tickets (TNCLD)
- [ ] Update the Accessibility Statement "Current Status" section if any P1s will take >2 weeks to fix (documents good-faith effort)

---

## Stream 4 — Brik-wide healthcare accessibility standards (~6 hrs — Brik)

Independent of TNCLD publish. Codifies the lessons from this audit so every future healthcare client build inherits the same baseline.

Full proposal: [`BRIK-HEALTHCARE-ADA-STANDARDS.md`](BRIK-HEALTHCARE-ADA-STANDARDS.md).

### 4.1 Review and approve the standards doc

- [ ] Nick reviews [`BRIK-HEALTHCARE-ADA-STANDARDS.md`](BRIK-HEALTHCARE-ADA-STANDARDS.md)
- [ ] Decide canonical location (recommended: `brik/brik-bds/content-system/compliance/healthcare-ada.md`)
- [ ] Answer the 4 open questions at the end of the doc (canonical location, ownership, AAA-on-patient-critical-flows, CI enforcement strictness)

### 4.2 Move to canonical location

- [ ] Copy/move to `brik/brik-bds/content-system/compliance/healthcare-ada.md`
- [ ] Bump BDS package version
- [ ] Sync consumers: `npm update @brikdesigns/bds` in portal + renew-pms + brikdesigns

### 4.3 Add Compliance Profile to each healthcare repo's CLAUDE.md

- [ ] `product/brik-client-portal/CLAUDE.md`
- [ ] `product/renew-pms/CLAUDE.md`
- [ ] `product/freedom-client-portal/CLAUDE.md`
- [ ] `web/tncld/CLAUDE.md`
- [ ] Future: `_newclient` template gets a Compliance Profile stub for all new clients

### 4.4 Wire axe-core CI into the portal builds

- [ ] Pilot in `brik-client-portal` — `@axe-core/playwright` on PR
- [ ] Fail on `serious`/`critical` violations
- [ ] Port to `renew-pms` and `freedom-client-portal` once pilot stable

### 4.5 Extend BDS components with required a11y props

One PR per component into `brik/brik-bds`:

- [ ] `Button` — required `aria-label` when no text children
- [ ] `IconLink` — required `aria-label`
- [ ] `Modal` — required `ariaLabelledBy` + `ariaDescribedBy`
- [ ] `FormField` — required `label` prop
- [ ] `Image` — required `alt` prop (empty string allowed for decorative)

### 4.6 Build Accessibility Preferences panel in portal layer

- [ ] Shared component in BDS: high contrast toggle, text size, reduced motion, preferred contact method
- [ ] Persist on user record
- [ ] Apply across portal surfaces

### 4.7 Audit + publish on every portal

- [ ] Full a11y audit (automated + manual + screen reader) on `brik-client-portal`, `renew-pms`, `freedom-client-portal`
- [ ] Remediate findings
- [ ] Publish `/legal/accessibility` + `/legal/notice-of-privacy-practices` on each portal

Proposed rollout: weeks of 2026-04-27 through 2026-06-15. See Step 7 in [`BRIK-HEALTHCARE-ADA-STANDARDS.md`](BRIK-HEALTHCARE-ADA-STANDARDS.md) for detail.

---

## Items intentionally deferred

Not blocking lawsuit defense, but nice to have later:

- **Skip link** ("Skip to main content") — common first-tab target for keyboard users. Adds in header.css + Webflow Designer. ~15 min.
- **Brand color contrast** — `#0065ff` on black (4.3:1) fails AA for bold small text by 0.2. Either lighten the blue slightly or restrict its use to light backgrounds. Brand decision.
- **Proper heading tags at source** — JS workaround (`role="presentation"`) prevents the axe warning, but swapping `<h6>` eyebrow elements to `<div>` in Webflow Designer is the semantic fix. ~30 min.
- **Form error ARIA** — forms need `aria-live` regions so screen readers announce validation errors. ~1 hour to wire up (depends on findings in Stream 3).

---

## Done (reference)

- **PR #1** — Accessibility CSS/JS fixes (button contrast, focus rings, ARIA, main landmark) + legal draft scaffold
- **PR #2** — Fixed duplicate `initAccessibility` declaration that was overriding the real implementation
- **PR #3** — Finalized drafts with confirmed data + publish guide + manual test plan
- **Deployed:** Color contrast fix is live; Lighthouse score improved 85 → 89 on homepage (verified)

---

## Quick links

| Resource | Purpose |
|---|---|
| [README.md](README.md) | Overall review gates + HIPAA vs ADA vs privacy context |
| [PUBLISH-TO-WEBFLOW.md](PUBLISH-TO-WEBFLOW.md) | Step-by-step Designer publish guide |
| [MANUAL-A11Y-TEST-PLAN.md](MANUAL-A11Y-TEST-PLAN.md) | 45-min keyboard + VoiceOver test plan |
| [BRIK-HEALTHCARE-ADA-STANDARDS.md](BRIK-HEALTHCARE-ADA-STANDARDS.md) | Brik-wide healthcare accessibility + compliance standard |
| [privacy-policy.md](privacy-policy.md) | Final Privacy Policy draft |
| [notice-of-privacy-practices.md](notice-of-privacy-practices.md) | HIPAA NPP (new page) |
| [terms-and-conditions.md](terms-and-conditions.md) | Corrected Terms |
| [accessibility-statement.md](accessibility-statement.md) | ADA Title III effective communication + non-discrimination (new page) |
| [website-disclaimer.md](website-disclaimer.md) | Polished Disclaimer |
