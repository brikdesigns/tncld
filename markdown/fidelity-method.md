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

| Candidate source | Result (re-verified 2026-09-01) |
|---|---|
| `https://tncld.webflow.io/` | **allow-listed since brik-llm#3080** — renders faithfully, see below |
| `https://tncld.com/` | egress-blocked, and deliberately so — tncld#44 cuts it over to the Netlify rebuild, so pointing the harness at it would eventually compare the rebuild against itself |
| Data API `GET /v2/pages/{id}/dom` | 9 `component-instance` nodes on `/about/why-laser-dentistry`; keys are `componentId, id, propertyOverrides, type` — **no `tag`, no `parentId`, no `children`** |
| Data API `GET /v2/sites/{id}/components/{cid}/dom` | 69 flat leaf nodes; carries `attributes` but still no hierarchy |
| Data API `GET /v2/sites/{id}/export` | **404** — there is no export endpoint |
| `previewUrl` on `GET /v2/sites/{id}` | a 540×360 above-the-fold thumbnail |

The rebuilt-from-the-API row matters because it is the reason the export cannot
simply be regenerated when it goes stale: nothing in the API maps a live string
back to the export element holding its predecessor, so even copy-level patching
has no anchor (tncld#166).

## The source: the checked-in Webflow export, with the live site as a spot-check

**The export is the default and stays the default.** It is deterministic, needs
no network, and — measured — is faithful for page content. On `/about` at 991,
which `check-export-drift.mjs` reports as `match`, banding the live site against
the export gives:

| band | live | export | delta |
|---|---|---|---|
| 1 `About` | 534 | 554 | −20 |
| 2 `Meet Our Team` | 806 | 834 | −28 |
| 3 `Tour Our Office` | 807 | 827 | −20 |
| 4 `Technologies` | 922 | 922 | **0** |
| 5 `Schedule an Appointment Today!` | 2203 | 1190 | **+1013** |

Lead-in above the first shared heading is 376px on both sides. Typography is
identical (`Inter` at 45.5 / 36 / 11.54px on h1 / h2 / p, both). Images are 20px
apart in total rendered height across the whole page.

**The whole page-level gap is band 5, and band 5 is the footer:**

| | above the footer | footer | footer links |
|---|---|---|---|
| live | 4109 | **1382** | 26 |
| export | 4135 | **456** | 17 |
| rebuild | 3808 | **813** | 23 |

The export's footer predates the compliance work and is missing 9 links — the
whole Legal column plus `Request Appointment` and `Contact Us`. Above the
footer, live and export agree to **26px**.

> Do not read a raw live-vs-export page total as a fidelity signal. The footer
> delta is a near-constant ~950px, which across routes of similar length looks
> like a systematic 15–20% ratio and was briefly reported as one. Compare bands,
> and treat the last band on any route as footer-contaminated.

So: use the export, and reach for the live site when a specific band's fidelity
is genuinely in doubt — which is how the footer was isolated. Two things the live
render gives that the export cannot:

- **Font Awesome and every webfont actually load.** `#151`'s residual 479
  deficit was attributed to the rebuild drawing a 4px rule where the original
  sets a 30px glyph; against the live original that glyph is measurable.
- **The SHA-pinned jsDelivr `header.css` / `footer.js` load,** which the export
  never carried. Worth 36px on `/about/why-laser-dentistry` at 991 — measured by
  aborting `cdn.jsdelivr.net` at the browser and re-measuring, which is also how
  it was ruled out as the cause of the export gap.

```bash
node scripts/fidelity-shot.mjs --route /about --width 991 \
  --orig-origin https://tncld.webflow.io
```

The path is chosen from the origin, not appended blindly: loopback gets the
export's `about.html`, anything else gets the route `/about`. All seven routes
resolve identically on `tncld.webflow.io` (verified 2026-09-01), so no separate
route table is needed.

> **Band 1 and the last band are wrong on `/about` and `/services` until
> tncld#169 lands** — on both origins, so this is not a live-origin problem.
> Headings pair through a text-keyed `Map`, which keeps the last occurrence, and
> the rebuild's footer group titles are `h2`. `/about`'s band 1 anchors on the
> footer's `About` (y=4141) rather than the page's (y=320) and reports
> **−3258px**. Bands 2–4 are correct and the page total is measured
> independently, which is how it went unnoticed. The other five routes are
> clean — checked, not assumed.

`cdnjs.cloudflare.com` (ScrollSmoother) and `www.google-analytics.com` are the
only failed requests on a live render — the first is the same 404 the export
takes and is already handled.

> Three asset hosts the live render pulls are **not** on the egress allow-list:
> `cdn.prod.website-files.com` (Webflow's asset CDN — images *and* the site
> CSS), `d3e54v103j8qbb.cloudfront.net` (the jQuery `webflow.js` needs), and
> `fonts.gstatic.com` (the `woff2` files; `*.googleapis.com` covers only the
> CSS). It renders anyway because Playwright's browser requests do not pass
> through `egress-guard.sh`, which inspects Bash command strings. That is a
> control gap, not permission — add them before making the live origin routine.

## The export itself

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

### Use `localhost` for the rebuild, never `127.0.0.1` (tncld#118)

They are not interchangeable here. **Next 16 answers `403` on every
`/_next/static/chunks/*` for a non-localhost origin**, so the page arrives with
no JS: it renders as the server-side shell, nothing hydrates, and the harness
used to screenshot and measure *that* while printing a normal-looking band
table. `--rebuild-origin` therefore defaults to `http://localhost:3000`.

```
127.0.0.1:3100  →  8 of 8 chunks net::ERR_ABORTED (403),  hydration markers: 0
localhost:3100  →  no console errors,                     hydration markers: 2
```

Three hard failures now stop a wrong measurement rather than reporting it:

| Guard | Catches |
|---|---|
| `body.theme-tncld` absent | another process holds the port. On brik-mini a Forgejo instance held `127.0.0.1:3000` while `next dev` bound IPv6 `*:3000`, so the "rebuild" was a different application entirely. |
| no `__reactContainer$` on `document` after 30s | the page never hydrated — the 403 case above, or a genuine hydration break. |
| an `<img>` still undecoded after `--image-timeout` (60s) | a collapsed image box being measured as a fidelity delta (tncld#142). |

### Why images are forced eager, not scrolled into view (tncld#142)

The scroll walk used to be the whole mechanism, and it silently loses a slow
lazy image: it dwells 80ms per 800px step and then returns to the top, which
**cancels** a fetch that has not committed. The original's three patient-story
posters are 2.7MB animated GIFs from `image.mux.com` and never survived it, so
`/`'s story band was measured with all three collapsed to a 20px line-box.

Adding time does not fix it — measured at 991 on the export:

```
walk 800px/80ms -> scrollTo(0,0) -> 600ms   card 236.0px  poster 0x0
same walk, 10s settle at top                card 236.0px  poster 0x0
parked in view, 600ms                       card 576.0px  poster 640x360
```

Nor does "scroll each undecoded one into view": 32 of the export's 43 images sit
inside collapsed tab panels and modals, where `scrollIntoView` is a no-op and
the loop never converges. Setting `loading = 'eager'` starts the load
immediately with no dependence on viewport position, and all 43 decode.

The cost of not having this guard: `/`'s original measured 12,681px at 991 where
it renders 13,967px, so every band-7 figure recorded on tncld#102, #106, #131 and
#133 was taken against a page 1,286px shorter than the one it was comparing to —
and band 7 read 126% when the rebuild is really at 66%.

The hydration probe keys on `document`, not on a widget, because it has to hold
on every route: keyed on `[role="tab"]` it failed `--route /about` for having no
tabs. And the rebuild waits on `load`, not `networkidle` — since tncld#97 the
hero is an autoplaying HLS loop, so the network never goes idle and the wait
just burns its timeout. The export on `:8899` is static files, does go idle, and
keeps `networkidle`.

Output lands in `.fidelity/<page>/<width>/` (gitignored): a full-page shot of
each side, one `NN-<heading>--orig.png` / `--rebuild.png` pair per band, and a
`report.json`.

**Bands are anchored on headings present in both renders, not on `<section>`
elements.** The original groups its 12 homepage content sections into 8
`<section>`s while the rebuild renders 12, so slicing by element would compare
mismatched regions. Anchoring on shared headings makes band *N* the same content
on both sides by construction.

`report.json` also gives you the cheapest signals before you open any image:

- `imagesUndecoded` — always `0` on a run that produced a report, since a
  non-zero count throws. It is recorded so a reader can see the gate ran rather
  than infer it from the absence of a complaint.

- `fullHeight.deltaPx` — a rebuild much shorter than the original means dropped
  or collapsed content, not a spacing nit. `/` opened at 5,090px against 12,056.
- `headingsOnlyInOriginal` / `headingsOnlyInRebuild` — a heading on one side
  only is either a missing section or copy drift. This is what surfaced
  `Technology That Elevates Your Care` (export) vs `Where Comfort Meets
  Precision` (live + rebuild).

To add a page, add a `ROUTES` entry mapping its route to its export filename.

### A one-sided heading is not automatically a defect (tncld#164)

Generate the drift manifest **before** a sweep, or every figure below is raw:

```bash
export WEBFLOW_API_TOKEN="$(op read 'op://Development/v7yjeqrzuqolnt7boicclvheb4/credential')"
node scripts/check-export-drift.mjs --out .fidelity/export-drift.json || true
```

The `|| true` is load-bearing in a sweep script: the gate exits **1** whenever
anything drifted, which is the normal state on three of the seven routes. The
manifest is written before that exit, so under `set -e` the sweep would abort
holding the file it needed.

Until #164 the harness reported a one-sided heading and then swallowed it into
the band above, whose height carried a section the other side never had. That
cost tncld#151 its premise: filed on a "+526px overshoot on one split" where
the split measures 858px against 861px, the overshoot being `Beyond Traditional
Procedures` — a section the live site has and the 2026-02-11 export does not.

The four cases are **not** symmetric, and the manifest is what tells them apart:

| Case | What the harness does |
|---|---|
| rebuild-only, **confirmed** by the manifest | excises that section's own box from the band and from `fullHeight.rebuildAdjusted` — the export is stale, so it cannot count against the rebuild |
| rebuild-only, unconfirmed | reports it, trims nothing |
| original-only | reports it as `missingInRebuild`, trims nothing — a section the rebuild lacks is a real defect and the deficit must keep showing |
| one-sided on **both** sides of one band | a rename; trims nothing on either side |

Two of those rules were paid for, not reasoned into existence:

- **Trimming the unconfirmed case invents deficits.** The rebuild's footer group
  titles (`About`, `Services`, `Patient Resources`, `Hours`) are `h2` where the
  original's are `h4` — matching chrome at a different heading level. Excising
  them took `/about/why-laser-dentistry` band 5 from 98.4% to 65.6%.
- **Trimming a rename hides them.** `Where Comfort Meets Precision` is both a
  rebuild-only heading *and* a genuinely drifted string, so the manifest alone
  confirms it. Excising it would have inflated `/` band 5 off its real 82.5%,
  which is the deficit tncld#132 is filed on.

The section's **own box** comes out, not a heading-to-heading slice: the slice
runs to the next shared heading, so it swallows the following section's lead-in
padding while leaving the drifted section's. On `/about/why-laser-dentistry` at
991 that is band 4 reading 84.3% against the correct 104.8%.

`fullHeight.rebuild` is never overwritten — `rebuildAdjusted` sits beside it, so
an adjustment is always auditable against the raw document height. `report.json`
carries `driftManifest`, which distinguishes *no manifest* (untested) from *no
drifted strings on this route* (tested, clean).

> The original's own measured height is not perfectly stable between sweeps —
> `/about/why-laser-dentistry` at 767 read 6,058px in one sweep and 6,214px in
> the next, 2.5pp of page fidelity, with the rebuild side identical at 6,840px
> in both. Three consecutive runs inside one sweep agreed to the pixel. Compare
> columns from a single sweep, per the reviews-widget note in Step 2.

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

## Step 5 — motion, with the other harness

`fidelity-shot.mjs` cannot verify motion and never will: its `REVEAL` step
forces every zero-opacity element visible after load, which is exactly the
state a scroll reveal is measured in. The two harnesses want opposite things
from the same page, so motion has its own script (tncld#96):

```bash
python3 -m http.server 8899 --bind 127.0.0.1     # the export, repo root
npx next dev -p 3100                             # or `next start`
node scripts/motion-shot.mjs --rebuild-origin http://localhost:3100
node scripts/motion-shot.mjs --route /about --rebuild-origin http://localhost:3100
```

It parks each revealing container just below the fold, scrolls it in, and
samples computed opacity every frame — in both renders, in one run. It shares
`fidelity-shot.mjs`'s wrong-page guard (`scripts/lib/assert-rebuild.mjs`), so a
stray port or an unhydrated page is still a hard failure rather than a table.

### What the original's choreography actually is

**Not GSAP.** The page loads three GSAP bundles and uses none of them —
measured on a local render of the export: `ScrollTrigger.getAll()` returns `0`,
and the site's own `tncld_custom_js-1.0.0.js` (887 bytes) contains no `gsap`
reference at all, only an anchor smooth-scroll handler. The whole scroll
experience is **Webflow IX2**, whose payload is bundled into the export at
`js/webflow.js` in a `Webflow.require("ix2").init({…})` call. Dump it with:

```bash
node -e 'const s=require("fs").readFileSync("js/webflow.js","utf8"),m=`ix2").init(`,i=s.indexOf(m);let d=0,e=0;for(let k=i+m.length;k<s.length;k++){if(s[k]==="{")d++;else if(s[k]==="}"&&--d===0){e=k+1;break}}console.log(JSON.stringify(new Function("return ("+s.slice(i+m.length,e)+")")(),null,2))'
```

One effect is live, and it is the entire spec:

| Action list | Trigger | Envelope |
|---|---|---|
| `fadeIn` | `SCROLL_INTO_VIEW`, offset 0%, one-shot | opacity 0 → 1, 1000ms, `outQuart`, no transform, no stagger |

The payload's two other lists are **observably inert**, which is why the
rebuild does not reproduce them — sampled opacity never leaves 1.0 on either:

- `a-37` / `a-40` ("Text Fade") put two conflicting `STYLE_OPACITY` items on the
  same target in the same group, and set no initial state; the second wins.
- `a` ("Home — Load", `PAGE_FINISH`) targets two element ids that appear in no
  `.html` file in the export.

`outQuart` is `1 - (1 - p)^4`. Sampled on the export, the reveal measures
**1003ms nominal** with a max deviation of 0.025 from that curve — i.e. the
config and the render agree, so the config is a usable spec.

### Reading motion-shot's duration column

The reported duration is **nominal, not observed**. `outQuart` is asymptotic —
its last 0.1% of opacity takes 18% of the duration — so the only landmark a
frame sampler can see is the first frame at opacity ≥ 0.999, which `outQuart`
reaches at `p = 1 - 0.001^(1/4) = 0.8221`. The script divides by that. The first
version compared the raw `t(0.999)` against 1000ms and failed the **original**
at 825ms, flagging the reference render as non-conformant to the spec read out
of its own config.

### Where the rebuild is deliberately stricter than the original

Three paths the original fails and the rebuild must not, each asserted by
`motion-shot.mjs`:

| Path | Original | Rebuild |
|---|---|---|
| `prefers-reduced-motion: reduce` | hides, then reveals regardless | never hides |
| JavaScript disabled | content stranded at `opacity: 0` | never hides — the hidden state is behind `@media (scripting: enabled)` |
| Keyboard focus into an unrevealed band | focus indicator invisible ~200ms, then a 1s fade | `onFocus` reveals the container at once |

The third was measured, not assumed: before `Reveal.tsx` handled focus, tab 12
on `/` landed on "What to Expect as a New Patient" inside a container at
`opacity: 0`, still 0 after +100ms, 0.78 at +400ms, 1 at +1200ms — a focus
indicator invisible exactly while the visitor is looking for it (WCAG 2.1 AA
2.4.7).

A container whose top is inside the viewport at load reports `on load` instead
of a curve: its trigger fires immediately and there is nowhere to park above it.
`/about`'s first band is one. The script still asserts both renders agree about
*which* containers those are, so a rebuild whose bands drifted upward cannot
quietly stop being measured.

### Sampling a one-shot trigger, and what stalls it

Two things the sampler has to do that are not obvious, both added by tncld#92
when it put five more pages through this harness:

- **Reload between containers.** IX2's `fadeIn` is one-shot, so a container
  that has already been revealed cannot be measured. Sampling container *N−1*
  scrolls far enough to trip container *N* whenever the containers are taller
  than the viewport — `/about/technology`'s splits are 1200px against a 900px
  viewport, and `original[1]` came back at `t₀.₉₉₉ 91ms` (already revealed) on
  2 of 5 identical runs. A fresh document is the only state in which the
  trigger is guaranteed unfired.
- **Exclude checkpoints read across a stalled frame.** Each checkpoint is
  interpolated linearly between the two frames bracketing it. Across a normal
  16ms frame that is nothing; across a 100ms stall it lands in `maxDeviation`
  as if the page had animated wrongly. Gaps over 32ms are excluded and
  **counted in the output**, and fewer than 6 of 9 usable checkpoints fails as
  an unusable sample — so discarding stalled points can never become a quiet
  pass.

**Residual flake, on the ORIGINAL only.** `/about/technology`'s `original[1]`
still fails roughly 1 run in 7 under load, reporting a real ~1000ms duration
with a curve deviation of 0.08–0.14. Every rebuild container passes every run,
as do the other three original containers on the same page. Two hypotheses were
tested and one was wrong: a longer post-reload settle (2000ms → 4000ms) made it
*worse* (3/9 failing vs 1/7), so it is ambient contention on the machine, not
the export still booting. Re-run before believing a red on that container, and
check which side the `✗` is on — a failure on `original[*]` is not a statement
about the rebuild.

## Known limits

- **`fidelity-shot.mjs` is static only and must not be used to verify motion.**
  `REVEAL` forces every zero-opacity element visible after load — correct for a
  static comparison, and precisely what makes it useless for a reveal. Use
  `scripts/motion-shot.mjs` (Step 5); the hydration guard only proves the JS
  ran, not that anything animated.
- **Neither harness reads the live site.** Both render the checked-in export,
  and the export omits nothing the live page's scroll behaviour depends on —
  `js/webflow.js` carries the IX2 payload, and the Webflow-hosted custom JS is
  fetched by the browser on load. Step 1's drift check is still what makes the
  export a legitimate stand-in.
- **One viewport by default.** `--width` takes any of Webflow's breakpoints
  (1440 / 991 / 767 / 479); the responsive pass means running it four times.
  tncld#106 is open on this: `/` measured 80.5% at 991 and 106.9% at 479, so a
  single 1440 figure does not mean the page is short everywhere.
- **Collapsed tab panels read as missing height.** Two of the three treatment
  images measured 0×0 in the original because their tab panels are closed.
  Resolved by tncld#97, which made the rebuild a real tab widget; the band closed
  from a residual gap to −46px.
