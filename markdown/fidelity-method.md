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

Two hard failures now stop a wrong measurement rather than reporting it:

| Guard | Catches |
|---|---|
| `body.theme-tncld` absent | another process holds the port. On brik-mini a Forgejo instance held `127.0.0.1:3000` while `next dev` bound IPv6 `*:3000`, so the "rebuild" was a different application entirely. |
| no `__reactContainer$` on `document` after 30s | the page never hydrated — the 403 case above, or a genuine hydration break. |

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
