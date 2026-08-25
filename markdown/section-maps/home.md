# Homepage section map — original Webflow → Next.js rebuild

Tracks tncld#89. The completeness bar is the **live original** homepage, read
through the Webflow Data API (page `694f1892a016a6340049f7db`, its component
instances + property overrides), not `tncld.com` HTML (egress-blocked in the
sandbox per ADR-036). Copy is the original's real copy; refining any
placeholder-adjacent copy is tracked in tncld#56.

- **Source model:** `json/cms-data.json` → `dental.home.sections` (ordered).
- **Templates:** `src/components/sections/PageSections.tsx` (+ `page-sections.css`).
- **Reader/types:** `src/lib/content.ts` (`HomeSection` union).

## Section-by-section

| # | Original section (Webflow component) | Rebuild section `type` | Template |
|---|---|---|---|
| 1 | `1-column-hero` | `hero` | `Hero` |
| 2 | `1-column-review-center` (Over 1,000 reviews) | `reviews` | `Reviews` |
| 3 | `2-column-content-split` — New Patients | `split` | `Split` |
| 4 | `3-column-card` — Your Path to a Healthier Smile | `steps` | `Steps` |
| 5 | `2-column-content-split` — Why Laser Dentistry | `split` | `Split` |
| 6 | `2-column-tabbed-stacked` — Transformative Dental Solutions | `showcase` | `Showcase` |
| 7 | `2-column-content-split` — Technology | `split` | `Split` |
| 8 | `2-column-content-split` — Our Team | `split` | `Split` |
| 9 | Patient stories (Real Patients…) | `testimonials` | `Testimonials` |
| 10 | Payments / insurance (Clear, Flexible Payment Options) | `payments` | `Payments` |
| 11 | `1-column-cta-right-img` — Virtual Tour | `cta` (`variant: split`) | `Cta` |
| 12 | `1-column-cta-center` — Ready to Book | `cta` (`variant: center`) | `Cta` |

## Deliberate deviations

- **Tabbed treatments → card grid.** The original's tab interaction
  (`2-column-tabbed-stacked`) is rendered as a static card grid (`showcase`).
  Same three items and copy (Cosmetic / Hybrid Dentures / Invisalign); the tab
  UI is presentation, not content, and #13 dropped pixel-parity.
- **Patient-story videos → text cards.** The original links each story to a
  video modal on `/patient-stories`; that route isn't rebuilt yet, so stories
  render as text cards with no link (avoids a 404). Wiring the videos is
  downstream of the `/patient-stories` page (nav-listed, unbuilt).
- **CTA targets remapped to rebuilt routes.** Original destinations without a
  rebuilt page point to the nearest existing route:
  - "What to Expect as a New Patient" → `/patient-resources` (no `/new-patients`)
  - "Take the Virtual Tour" → `/about` (no `/tour-our-office`)
  - "Explore Our Difference" → `/why-laser-dentistry`, "How Technology Improves
    Your Visit" → `/technology`, "Meet the Doctors" → `/meet-the-doctors`,
    appointment CTAs → `/request-appointment` (all rebuilt).

## Interior-page audit — NOT in this change

tncld#89 AC#2 (audit each interior page's section set vs the original, fill
gaps) is **not** covered here — this change restores the **homepage** IA only.
The interior audit is its own slice: the same Data-API method applies (read
each page's DOM + component overrides), and every interior page can reuse the
`split` / `steps` / `showcase` / `testimonials` / `cta` templates added here.
Filed as follow-up — see tncld#89.
