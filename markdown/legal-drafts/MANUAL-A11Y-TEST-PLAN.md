# Manual Accessibility Test Plan (Option B)

Lighthouse catches ~40% of real a11y issues. The remaining 60% — keyboard flow, screen reader semantics, focus management, form errors — requires manual testing. Forms are the #1 ADA lawsuit trigger; automated tools frequently pass forms that are unusable without a mouse.

**Est. time:** ~45 min for a thorough pass.
**Tools needed:** Keyboard only (unplug your mouse), macOS VoiceOver (Cmd+F5 to toggle).

---

## Test 1 — Keyboard-only navigation (15 min)

**Goal:** Complete every user flow without touching a mouse or trackpad.

### Setup
- Hard-refresh the site (Cmd+Shift+R) to pick up latest `header.css`/`footer.js`
- Unplug mouse or cover trackpad

### Homepage flow
- [ ] `Tab` from URL bar — first focused element should be "Skip to main content" (or the logo if no skip link). Note: skip link doesn't exist yet — flag this as a follow-up.
- [ ] `Tab` through the nav — every link should show a **visible blue focus ring** (we added this in `header.css` under the ACCESSIBILITY section)
- [ ] `Tab` to "Request Appointment" button — press `Enter` — appointment form should open
- [ ] `Escape` should close the modal
- [ ] Continue tabbing through page — focus order should follow visual order (top-to-bottom, left-to-right)
- [ ] Reach the footer — social icons should announce proper labels (see Test 2)

### Contact page flow ([/contact](https://tncld.com/contact))
- [ ] Tab into the form. First focus lands on the first input?
- [ ] Each input's label is visible and associated? (If a label isn't clickable-to-focus, it's not associated properly.)
- [ ] Tab through all fields in form order — Name → Email → Phone → Message → Submit
- [ ] Submit with empty required fields — do error messages appear? Are they announced? Do they move focus to the first invalid field?
- [ ] Submit with valid data — does a success message appear? Is it announced?

### Request Appointment flow ([/request-appointment](https://tncld.com/request-appointment))
- Same checklist as Contact, plus:
- [ ] Date/time pickers usable with arrow keys + Enter?
- [ ] Dropdown selects announce options on open?

### Known current gaps (to fix)
- No skip link ("Skip to main content") — typical first tab target
- Form error announcements likely use only visual color change (need `aria-live` region)

---

## Test 2 — VoiceOver screen reader (20 min)

**Enable:** Cmd+F5 to toggle VoiceOver.
**Key commands:**
- `VO = Ctrl+Option`
- `VO+→` / `VO+←` — next/previous element
- `VO+U` — open Rotor (heading list, link list, landmark list)
- `VO+A` — read from current position
- `Ctrl` — stop reading

### Homepage
- [ ] On page load, VoiceOver announces page title
- [ ] `VO+U` → **Headings** rotor — list should go h1 → h2 → h3 in order, no skipped levels
- [ ] `VO+U` → **Landmarks** rotor — should include "main" (we added this via footer.js)
- [ ] `VO+U` → **Links** rotor — every link has descriptive text (no "link" with empty name, no "click here")
- [ ] Logo link announces "Tennessee Center for Laser Dentistry — Home, link"
- [ ] Social icons announce "TNCLD on Facebook, link", "TNCLD on LinkedIn, link", etc.
- [ ] Video/image content has alt text or is marked decorative

### Contact / Request Appointment forms
- [ ] Each form field announces its label + type + required/optional state
- [ ] Submit button announces purpose (e.g., "Submit contact form, button")
- [ ] Error messages are announced via `aria-live` or alert role (not just color change)
- [ ] Success state is announced after submit

### Service pages
- [ ] Image-heavy pages — do images have meaningful alt text (or empty alt if decorative)?
- [ ] Testimonials marked up with `<blockquote>` and `<cite>`?

---

## Test 3 — Focus management in interactive components (5 min)

- [ ] Click a video modal → focus moves into modal?
- [ ] `Escape` closes modal → focus returns to the element that opened it?
- [ ] Tab inside modal is trapped (doesn't escape to page behind)?
- [ ] Hamburger menu (mobile) — opens with keyboard, closes with Escape, focus managed correctly?

---

## Test 4 — Motion & reduced motion (2 min)

1. System Settings → Accessibility → Display → **Reduce motion: On**
2. Reload tncld.com
- [ ] Auto-play videos still autoplay? (should pause/stop with reduced motion)
- [ ] Scroll animations / parallax still animate? (should be disabled)
- [ ] Hover-triggered animations still run? (should be instant or disabled)

---

## Test 5 — Zoom to 200% (3 min)

WCAG AA requires content to remain usable at 200% browser zoom.

1. `Cmd++` five times (200% zoom)
- [ ] No horizontal scroll appears
- [ ] All content is readable; nothing is clipped
- [ ] Interactive elements are still reachable and usable

---

## Reporting findings

For each issue found, record:
- Page + URL
- Steps to reproduce
- What a sighted mouse user experiences vs. what a keyboard/screen-reader user experiences
- WCAG success criterion violated (e.g., 2.4.3 Focus Order, 3.3.1 Error Identification, 1.4.11 Non-text Contrast)

Severity levels:
- **P0** — Completely blocks a user flow (can't submit form, can't close modal)
- **P1** — Makes flow very difficult (missing labels, no error announcements)
- **P2** — Annoyance but workaround exists (suboptimal focus order, missing skip link)

---

## Outcomes → next actions

- P0/P1 findings become new tasks in the next Webflow Designer session
- Accessibility Statement should be updated with "known issues" if any P1s are found and not immediately fixable (shows good-faith effort, reduces damages)
- Re-run Lighthouse after fixes; target 95+ on all tested pages
