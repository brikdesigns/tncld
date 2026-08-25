# Interior-page section audit — original Webflow → Next.js rebuild

Tracks tncld#89 AC2. Bar = the **live original**, read via the Webflow Data API
(page DOM + component property overrides), not `tncld.com` HTML (egress-blocked,
ADR-036). Companion to [home.md](home.md).

Before this pass every interior page rendered as a flat `title + lede + text
sections` (ResourcePage / ContentPage) — no interior hero, no closing CTA, and
rich sections (splits, testimonials, card grids) flattened to markdown. Every
original interior page opens with a hero and closes with a CTA.

## Audit — original section set per page

| Page | Original sections (Webflow components) | Status |
|---|---|---|
| **/about** | hero-split · split ×3 (Meet Our Team / Tour Our Office / Technologies) · cta-center | ✅ **rebuilt** (this change) |
| /services | hero-split · split ×6 (one per service) · cta-lg | ⬜ pending |
| /technology | hero-split · split ×4 (Digital Imaging / Laser / Oral Cancer / CEREC) · 3-col testimonials · cta-lg | ⬜ pending |
| /meet-the-doctors | hero-split · cta-img · 2-col card-list · 3-col testimonials · 3-col related-pages · cta-lg | ⬜ pending |
| /patient-resources | hero-split · 3-col card (New Patient Info) · cta-img (Office & Experience) · cta-lg | ⬜ pending |
| /why-laser-dentistry | hero-split · 3-col card · 4-col card-center · split · cta · cta-lg | ⬜ pending |

## /about — section map (rebuilt)

| # | Original (Webflow component) | Rebuild `type` |
|---|---|---|
| 1 | `2-column-hero-split` — "About" | `hero` |
| 2 | `2-column-content-split` — Meet Our Team | `split` |
| 3 | `2-column-content-split` — Tour Our Office | `split` |
| 4 | `2-column-content-split` — Technologies | `split` |
| 5 | `1-column-cta-center` — Schedule an Appointment Today! | `cta` (center) |

- Model: `json/cms-data.json` → `dental.about` → `{ images, sections[] }`.
- Renders through the shared `src/components/sections/PageSections.tsx` — the
  same templates the home uses. This is the reusable pattern for the pending
  pages: give each page its own `sections[]`, render through `PageSections`.
- CTA targets remapped to rebuilt routes (all resolve 200): "Tour Our Office" →
  `/patient-resources` (no `/tour-our-office` route rebuilt); others map 1:1.

## Remaining pages

The five pending pages follow the /about pattern. Two need section templates not
yet built: a **testimonials-with-attribution** variant (technology,
meet-the-doctors use `3-column-testimonial`, richer than the home's story cards)
and **card-grid** variants (`4-column-card-center`, `related-pages`). Tracked in
tncld#92.
