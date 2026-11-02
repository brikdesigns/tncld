# Interior-page section audit — original Webflow → Next.js rebuild

Tracks tncld#89 AC2, completed by tncld#92. Bar = the **live original**, read via
the Webflow Data API (page DOM + component property overrides), not `tncld.com`
HTML (egress-blocked, ADR-036). Companion to [home.md](home.md) and
[../fidelity-method.md](../fidelity-method.md).

Before this pass every interior page rendered as a flat `title + lede + text
sections` (ResourcePage / ContentPage) — no interior hero, no closing CTA, and
rich sections (splits, testimonials, card grids) flattened to markdown. Every
original interior page opens with a hero and closes with a CTA.

## Routes — the original nests three of these under `/about/`

Read off `GET /v2/sites/694f1891a016a6340049f761/pages`: `technology`,
`meet-the-doctors` and `why-laser-dentistry` all carry
`parentId=697648d22cb71ab803455a08`, which is the folder with slug `about`. The
rebuild served them top-level; #92 moved them so the URLs match the original.

| Original URL | Rebuild route |
|---|---|
| `/services` | `/services` |
| `/patient-resources` | `/patient-resources` |
| `/about/technology` | `/about/technology` |
| `/about/meet-the-doctors` | `/about/meet-the-doctors` |
| `/about/why-laser-dentistry` | `/about/why-laser-dentistry` |

The **detail** templates are not in that folder (`detail_services` and
`detail_technology` are both `parent=root`), so `/services/<slug>` and
`/technology/<slug>` stay top-level — they are not moved and must not be.

Old top-level paths now 404 in the rebuild. Redirects belong to the cutover,
tncld#44, not here.

## Audit — original section set per page

Component names are Webflow's own, resolved from each page's `componentId`
against `GET /v2/sites/{id}/components` — not inferred from CSS class names.

| Page | Original sections (Webflow components) | Status |
|---|---|---|
| **/about** | hero-split · content-split ×3 · cta-center | ✅ rebuilt (#89) |
| **/services** | hero-split · content-split ×6 · cta-center-lg | ✅ rebuilt (#92) |
| **/patient-resources** | hero-split · 3-column-card · cta-img · cta-center-lg | ✅ rebuilt (#92) |
| **/about/technology** | hero-split · content-split ×4 · 3-column-testimonial · cta-center-lg | ✅ rebuilt (#92) |
| **/about/meet-the-doctors** | hero-split · cta-img · *(static)* doctor cards · card-list-right · 3-column-testimonial · card-img-landscape · cta-center-lg | ✅ rebuilt (#92) |
| **/about/why-laser-dentistry** | hero-split · 3-column-card · 4-column-card-center · content-split · cta · cta-center-lg | ✅ rebuilt (#92) |

## Section map per page

Model: `json/cms-data.json` → `dental.sectionPages.<key>` → `{ images,
sections[] }`, rendered by `src/components/sections/PageSections.tsx`. Same
shape /about uses, so no page component holds layout.

### /services — `sectionPages.services`

| # | Original component | Rebuild `type` | Reveal |
|---|---|---|---|
| 1 | `2-column-hero-split` — "Services" | `hero` (interior) | — |
| 2–7 | `2-column-content-split` ×6, one per service | `split`, `imageFrame: square` | `start` each |
| 8 | `1-column-cta-center-lg` | `cta`, `variant: center-lg` | — |

The six service splits are the only place a **square** media frame appears:
547×547 at radius 12, right-aligned in a full-bleed row, where every other
split runs the 1368×770 16:9 band. Each carries **two** buttons in one wrapper
(Get Started + Learn More), which is why `SplitSection` gained `actions[]`.

### /patient-resources — `sectionPages.patient-resources`

| # | Original component | Rebuild `type` | Reveal |
|---|---|---|---|
| 1 | `2-column-hero-split` | `hero` (interior) | — |
| 2 | `3-column-card` — New Patient Information | `cards`, `variant: icon` | — |
| 3 | `1-column-cta-img` — Office & Experience | `split` (2 actions) | `start` |
| 4 | `1-column-cta-center-lg` | `cta`, `variant: center-lg` | — |

The card grid's trailing button reads **"This is the default text value"** in
the export and carries no override on the live page — an unfilled Webflow slot,
not copy. It is dropped rather than invented, and `check-content.mjs` now fails
on that string so it cannot come back.

### /about/technology — `sectionPages.technology`

| # | Original component | Rebuild `type` | Reveal |
|---|---|---|---|
| 1 | `2-column-hero-split` — "Technology" | `hero` (interior) | — |
| 2–5 | `2-column-content-split` ×4 | `split` (wide frame) | `start` each |
| 6 | `3-column-testimonial` — What Our Customers Are Saying | `reviewsEmbed` | — |
| 7 | `1-column-cta-center-lg` | `cta`, `variant: center-lg` | — |

`3-column-testimonial` is **not** testimonial cards. Its component DOM
(`bd164091-…`) is a heading above a third-party review embed. The export
carries an Elfsight app; the live component serves the LeadConnector/GHL
widget the rebuild now embeds — the same one
`scripts/test-review-widget-width.js` measures against `tncld.com`.

### /about/meet-the-doctors — `sectionPages.meet-the-doctors`

| # | Original component | Rebuild `type` | Reveal |
|---|---|---|---|
| 1 | `2-column-hero-split` | `hero` (interior) | — |
| 2 | `1-column-cta-img` — Exceptional Dentists… | `split` | `start` |
| 3 | *static markup* — Guides You Can Trust | `cards`, `variant: portrait` | — |
| 4 | `2-column-card-list-right` — A shared philosophy | `principles` | — |
| 5 | `3-column-testimonial` — Patient Testimonials | `reviewsEmbed` | — |
| 6 | `3-column-card-img-landscape` — Related Pages | `cards`, `variant: landscape` | — |
| 7 | `1-column-cta-center-lg` | `cta`, `variant: center-lg` | — |

Section 3 is the only band on any of the five that is **not** a component
instance — it is page markup, so it has no property overrides and the export is
its own spec. Each doctor card's "Read Bio" opens the original's `modal-1..3`
biography; the rebuild renders those as a native `<dialog>` (`BioCard.tsx`),
the same approach `StoryVideo` took for the patient-story modals in #97.

Two deviations, both deliberate:

- The original sets the third doctor's name as an `h2` where the first two are
  `h4`, inside a section already headed by an `h2`. The rebuild renders all
  three as `h3` under the section heading — reproducing the inconsistency would
  carry a heading-order failure (WCAG 2.1 AA 1.3.1) across.
- `4-column-card-center` and `card-numeric` draw their mark from a Font Awesome
  ligature with no accessible name. The rebuild draws a decorative brand rule
  instead, for the same reason.

### /about/why-laser-dentistry — `sectionPages.why-laser-dentistry`

| # | Original component | Rebuild `type` | Reveal |
|---|---|---|---|
| 1 | `2-column-hero-split` | `hero` (interior) | — |
| 2 | `3-column-card` — Why "Laser Dentistry" Is Part of Our Name | `cards`, `variant: numeral` | — |
| 3 | `4-column-card-center` — What this means for you | `values` | — |
| 4 | `2-column-content-split` — A Higher Standard of Modern Care | `split` | `start` |
| 5 | `1-column-cta` — Beyond Traditional Procedures | `cta`, `variant: center` | — |
| 6 | `1-column-cta-center-lg` | `cta`, `variant: center-lg` | — |

**Section 5 is not in the checked-in export at all.** The live page carries it;
the 2026-02-11 export predates it. `check-export-drift.mjs` reports it, and the
Data API is the spec where the two disagree. Its `CTA/Secondary Label` override
is the literal string `Button Label` — an unfilled slot, dropped.

## Section templates added by #92

| Template | Original component | Shape |
|---|---|---|
| `cards` | `3-column-card`, `-img-portrait`, `-img-landscape` | 381×400 cards, 20px gutter, 40px radius; the variant chooses glyph / numeral / portrait / landscape above the title |
| `values` | `4-column-card-center` | 308×160 title-only cards, 16px gutter |
| `reviewsEmbed` | `3-column-testimonial` | heading + the practice's review widget |
| `principles` | `2-column-card-list-right` | copy left, 600×112 numbered cards right at 6px radius |
| `cta --center-lg` | `1-column-cta-center-lg` | 1000px closing band, 72.8px heading in an 800px column |

Every measurement above came from `getComputedStyle` /
`getBoundingClientRect` on the rendered export at 1440, per
[../fidelity-method.md](../fidelity-method.md) § Step 3.

## Scroll choreography — the reveal set is one rule, measured

**Only the split reveals.** On every one of these five pages the original's sole
`.section-tabbed` wrapper — what `2-column-content-split` and `1-column-cta-img`
both render as — carries the IX2 `fadeIn`. Card grids, the value grid, the
card-list, the reviews band and every CTA sit outside it, so they are never
hidden and never fade.

That was measured, not assumed: an earlier pass gave `/patient-resources` its
card grid a `start` marker and the split a `join`, and `motion-shot.mjs`
rejected it — *"the renders disagree about which containers are above the fold
(original 0, rebuild 1)"*. The original reveals one container at top 1724; the
mis-marked rebuild revealed one at 823. The harness catching a plausible-looking
choreography is the reason to run it per page rather than pattern-match from
/about.

| Route | Revealed containers |
|---|---|
| `/services` | 6 — every service split |
| `/about/technology` | 4 — every technology split |
| `/patient-resources` | 1 — Office & Experience |
| `/about/meet-the-doctors` | 1 — Exceptional Dentists |
| `/about/why-laser-dentistry` | 1 — A Higher Standard of Modern Care |

## Known gaps, tracked elsewhere

- **`/services/sedation-dentistry` 404s.** The original lists Sedation
  Dentistry and links that page; the rebuild's `serviceDetails` has no such
  entry (and carries `dental-implants`, which the original's /services page does
  not list). The link is reproduced faithfully and the missing page is filed
  under the content work, not patched over here.
- **The `technologyDetails` key `same-day-crowns-cerec` was renamed `cerec`**
  so `/technology/cerec` — the URL the original links — resolves.
