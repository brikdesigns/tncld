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
| 6 | `2-column-tabbed-stacked` — Transformative Dental Solutions | `tabs` | `TreatmentTabs` |
| 7 | `2-column-content-split` — Technology | `split` | `Split` |
| 8 | `2-column-content-split` — Our Team | `split` | `Split` |
| 9 | Patient stories (Real Patients…) | `testimonials` | `Testimonials` |
| 10 | Payments / insurance (Clear, Flexible Payment Options) | `payments` | `Payments` |
| 11 | `1-column-cta-right-img` — Virtual Tour | `cta` (`variant: split`) | `Cta` |
| 12 | `1-column-cta-center` — Ready to Book | `cta` (`variant: center`) | `Cta` |

## Scroll choreography (tncld#96)

The original wraps its content blocks in four `<section class="section-tabbed
comfortable center">` containers on `/`, each carrying the IX2 `fadeIn`
data-w-id, and reveals **the container** — so blocks sharing one wrapper fade in
together, not one after another. The rebuild's section list is flat, so
membership is a `reveal` marker on the section in `json/cms-data.json`
(`start` opens a group, `join` extends it) and
`PageSections.tsx` wraps each group in one `<Reveal>`.

| Original wrapper (`index.html`) | First heading | Rebuild sections | `reveal` |
|---|---|---|---|
| line 469 | Dental Care Should Be Clear, Comfortable, and Stress-Free | 2 `split` + 3 `steps` | `start`, `join` |
| line 547 | Why "Laser Dentistry" Is Our Standard | 4 `split` | `start` |
| line 657 | Technology That Elevates Your Care | 6 `split` | `start` |
| line 687 | Experienced Clinicians. Elevated Care. | 7 `split` + 8 `testimonials` | `start`, `join` |

Not revealed in the original, and so not in the rebuild: the hero, the
`section_tabbed-accordion` treatments strip (line 577), and both
`section_1-column` bands (payments + the two CTAs, lines 768 and 827) — none
carries a `data-w-id`.

`/about` follows the same shape with three revealed wrappers ("Meet Our Team",
"Tour Our Office", "Technologies") and an unrevealed closing CTA.

The envelope, the measurement, and why the payload's two other action lists are
not reproduced are in [`../fidelity-method.md`](../fidelity-method.md) § Step 5.

## Deliberate deviations

> Two entries were removed here in tncld#97 — the tabbed treatments and the
> patient-story videos. Both rested on #13's superseded no-pixel-parity charter
> ("the tab UI is presentation, not content"), which the 2026-08-25 correction
> retired, and the story-video entry was also factually wrong: the original
> opens an in-place modal (`modal-1..3`), it does not link to
> `/patient-stories`, so the unbuilt route never was the blocker. Both
> interactions are now reproduced. The hero background video went the same way
> in the same change, by operator decision 2026-08-26.

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
