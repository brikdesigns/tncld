# Fidelity-verification method

The reusable method for checking a rebuilt page against the live Webflow
original. Written for tncld#95 (`/` and `/about`); tncld#92 points the same two
scripts at the five remaining interior pages.

Companion: [`section-maps/home.md`](section-maps/home.md),
[`section-maps/interior-pages.md`](section-maps/interior-pages.md).

---

## The problem this solves

"Visually matches the original" is unverifiable if you cannot see the original.
From an agent sandbox you cannot:

| Candidate source | Result (verified 2026-08-25) |
|---|---|
| `https://tncld.com/` | egress-blocked — ADR-036 guard fires |
| `https://tncld.webflow.io/` | egress-blocked — same guard |
| Data API `GET /v2/pages/{id}/dom` | flat text + html-embed nodes; **no CSS, no hierarchy, no layout** |
| `previewUrl` on `GET /v2/sites/{id}` | a 540×360 above-the-fold thumbnail |

So the rendered original has to come from somewhere else.

## The source: the checked-in Webflow export

This repo already contains the export — `index.html`, `about.html`,
`css/tncld.webflow.css`, `fonts/`, and 450 files under `images/`. Served over
`localhost` (which **is** on the egress allow-list) it renders faithfully:
12,056px full-page for the homepage at 1440 wide.

```bash
python3 -m http.server 8898 --bind 127.0.0.1     # from the repo root
```

Two rendering caveats, both characterised and handled:

- **`cdnjs.cloudflare.com` ScrollSmoother 404s.** It is a Club GreenSock
  plugin. Without it four `.section-tabbed` sections stay at inline
  `opacity: 0`, so they screenshot blank. `fidelity-shot.mjs` forces every
  zero-opacity element visible after load — correct for a *static* comparison,
  and motion is tncld#96's concern anyway.
- **`inferred.litix.io` fails.** A Mux analytics beacon; irrelevant to rendering.

## Step 1 — prove the export is still the spec

The export is dated 2026-02-11; the site's `lastPublished` is 2026-08-20. It is
only a valid spec where the live copy still matches.

```bash
export WEBFLOW_API_TOKEN="$(op read 'op://Development/v7yjeqrzuqolnt7boicclvheb4/credential')"
node scripts/check-export-drift.mjs
```

It pulls every text string the Data API reports for each page — page-level text
nodes **plus** component-instance `propertyOverrides`, which is where the hero
and section copy actually live — and asserts each is present in the export.

**Drift does not mean "fix the export."** It means the live site moved and that
section's spec comes from the API, not the export. As of 2026-08-25: `/about`
is clean; `/` reports 7 drifted strings, of which the step-card labels
(`1. Request an Appointment`, …) were applied to `cms-data.json` under #95.

To extend to a new page, add it to `PAGES` in the script with its Webflow page
id from `GET /v2/sites/694f1891a016a6340049f761/pages`.

## Step 2 — capture original and rebuild in matching bands

```bash
npm run dev                                       # rebuild on :3000
node scripts/fidelity-shot.mjs --route /          # then --route /about
```

Output lands in `.fidelity/<page>/<width>/` (gitignored): a full-page shot of
each side, one `NN-<heading>--orig.png` / `--rebuild.png` pair per band, and a
`report.json`.

**Bands are anchored on headings present in both renders, not on `<section>`
elements.** The original groups its 12 homepage content sections into 8
`<section>`s while the rebuild renders 12, so slicing by element would compare
mismatched regions. Anchoring on shared headings makes band *N* the same content
on both sides by construction.

`report.json` also gives you the two cheapest signals before you open any image:

- `fullHeight.deltaPx` — a rebuild much shorter than the original means dropped
  or collapsed content, not a spacing nit. `/` opened at 5,090px against 12,056.
- `headingsOnlyInOriginal` / `headingsOnlyInRebuild` — a heading on one side
  only is either a missing section or copy drift. This is what surfaced
  `Technology That Elevates Your Care` (export) vs `Where Comfort Meets
  Precision` (live + rebuild).

To add a page, add a `ROUTES` entry mapping its route to its export filename.

## Step 3 — measure, don't eyeball

Every geometry claim in #95 came from `getComputedStyle` / `getBoundingClientRect`
against the rendered export, not from reading CSS or judging a screenshot. The
multi-theme `tncld.webflow.css` defines `--font-family--body` five times; only
the computed value tells you which one wins.

What that caught on `/`:

| Claim | Measured |
|---|---|
| Page is dark | every h1/h2 white on `rgb(0, 0, 0)`, all 12 sections |
| Type is Poppins | it is **Inter** — on every heading and paragraph |
| Splits are two-column | copy row inset 96px **above** a full-width 16:9 image at 36px gutters; all four identical |
| Brand blue is `#4665f5` | it is `#0065ff` |
| Buttons | radius 12px, padding 16px 24px, secondary fill `rgb(24, 24, 24)` |
| Cards | 381×400 (steps) / 381×320 (stories), radius 40px, padding 24px, 20px gutter |

## Step 4 — reconcile deviations explicitly

A deviation is allowed, but it is written down at the point of the code, with
its reason. The two on `/` and `/about`, both in `src/styles/theme-tncld.css`:

- Brand-blue **text** is 4.31:1 on black, under the 4.5:1 AA floor the repo's
  Compliance Profile requires, so brand text and links use the green accent
  (11.99:1). The blue is reproduced faithfully wherever it is a *background* —
  white on it is 4.88:1 and passes.
- The review stars stay blue: they are a graphic (`role="img"` with the rating
  in `aria-label`), so the applicable floor is 3:1 for non-text contrast
  (WCAG 1.4.11), which blue clears.

Anything reproduced *less* faithfully than the original needs an operator
decision and a ticket, not a code comment — see the hero video, which #95
renders as a still and tncld#97 owns.

## Known limits

- **Static only.** The export renders without ScrollSmoother, and the harness
  forces revealed state, so it cannot verify motion. That is tncld#96's job.
- **One viewport by default.** `--width` takes any of Webflow's breakpoints
  (1440 / 991 / 767 / 479); the responsive pass means running it four times.
- **Collapsed tab panels read as missing height.** Two of the three showcase
  treatment images measure 0×0 in the original because their tab panels are
  closed. Band 5's residual height gap is that interaction, which is tncld#97.
