// fidelity-shot.mjs — the fidelity-verification harness for tncld#95 AC2,
// reused by #92 for the interior pages.
//
// Captures the original and the rebuild side by side, sliced into the same
// content bands, so a visual gap is a diff between two images rather than a
// judgement call.
//
// WHY THE ORIGINAL IS A LOCAL SERVER, NOT tncld.com
// tncld.com and tncld.webflow.io are both egress-blocked from an agent sandbox
// (ADR-036). The checked-in Webflow export renders faithfully on localhost,
// which IS allow-listed. Run `scripts/check-export-drift.mjs` first — it proves
// the export's copy still matches the live site, which is what makes it a
// legitimate stand-in.
//
// WHY BANDS ARE ANCHORED ON HEADINGS, NOT ON <section> ELEMENTS
// The original groups its 12 content sections into 8 <section> elements; the
// rebuild renders 12. Slicing by element would compare mismatched regions. Each
// band is instead anchored on the y-offset of a heading that appears in both
// renders, so band N is the same content in both images by construction.
//
// Usage:
//   node scripts/fidelity-shot.mjs --route /
//   node scripts/fidelity-shot.mjs --route /about --width 767
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { assertIsRebuild } from './lib/assert-rebuild.mjs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};

// The rebuild route → the export file that renders the same page. The three
// `/about/*` entries are nested because that is where the ORIGINAL serves them
// (Webflow `about` folder, parentId 697648d22cb71ab803455a08) — tncld#92 moved
// the rebuild's routes to match, so the two sides line up on both ends.
const ROUTES = {
  '/': { orig: 'index.html', rebuild: '/' },
  '/about': { orig: 'about.html', rebuild: '/about' },
  '/services': { orig: 'services.html', rebuild: '/services' },
  '/patient-resources': { orig: 'patient-resources.html', rebuild: '/patient-resources' },
  '/about/technology': { orig: 'about/technology.html', rebuild: '/about/technology' },
  '/about/meet-the-doctors': {
    orig: 'about/meet-the-doctors.html',
    rebuild: '/about/meet-the-doctors',
  },
  '/about/why-laser-dentistry': {
    orig: 'about/why-laser-dentistry.html',
    rebuild: '/about/why-laser-dentistry',
  },
};

const route = arg('route', '/');
const width = Number(arg('width', 1440));
const origin = arg('orig-origin', 'http://127.0.0.1:8899');
// `localhost`, NOT `127.0.0.1` (tncld#118). Next 16's dev server answers 403 on
// every /_next/static/chunks/* for a non-localhost origin, so the rebuild
// renders UNHYDRATED — and this script used to screenshot and measure that,
// reporting a normal-looking band table. The export server on :8899 is plain
// static files and has no such rule, so it keeps its address.
const rebuildOrigin = arg('rebuild-origin', 'http://localhost:3000');
const outDir = arg('out', join('.fidelity', route === '/' ? 'home' : route.slice(1), String(width)));

const target = ROUTES[route];
if (!target) {
  console.error(`fidelity-shot: unknown route ${route}. Known: ${Object.keys(ROUTES).join(', ')}`);
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

// The original's reveals hold ~4 sections at opacity 0 until they scroll into
// view, so a full-page screenshot catches them blank. For a STATIC comparison
// the reveals must simply be off in both renders, so force every element
// visible after load.
//
// They are driven by Webflow IX2, NOT by GSAP — this comment used to say
// "GSAP/ScrollTrigger gate the original's reveals", which tncld#96 measured as
// false: `ScrollTrigger.getAll()` returns 0 on the rendered export. ScrollSmoother
// does 404 from cdnjs (Club GreenSock plugin), but nothing on the page uses it.
// Motion fidelity belongs to scripts/motion-shot.mjs; see
// markdown/fidelity-method.md § Step 5.
const REVEAL = `
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.opacity === '0') el.style.setProperty('opacity', '1', 'important');
    if (cs.visibility === 'hidden') el.style.setProperty('visibility', 'visible', 'important');
  }
`;

async function capture(url, label) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  const failed = new Set();
  page.on('requestfailed', (r) => failed.add(new URL(r.url()).host));

  // The rebuild cannot wait on `networkidle`: its hero is an autoplaying HLS
  // loop since tncld#97, so segments keep arriving and the network is never
  // idle — the wait just burns the full timeout. The export on :8899 is static
  // files, does go idle, and its screenshots depend on that, so it keeps it.
  const settle = label === 'rebuild' ? 'load' : 'networkidle';
  await page
    .goto(url, { waitUntil: settle, timeout: 90000 })
    .catch((e) => console.error(`${label} nav: ${e.message}`));
  if (label === 'rebuild') await assertIsRebuild(page, label);
  // Lazy images only decode once scrolled into view; walk the page so the
  // full-page screenshot is not a column of empty image boxes.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 800) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(REVEAL);
  await page.waitForTimeout(600);

  // Heading text -> absolute y. Only h1/h2 so a card subtitle cannot become a
  // band boundary; both renders are keyed by the same normalised strings.
  const headings = await page.evaluate(() =>
    [...document.querySelectorAll('h1, h2')]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
          y: Math.round(r.top + window.scrollY),
          h: Math.round(r.height),
        };
      })
      .filter((x) => x.text && x.h > 0),
  );
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: join(outDir, `${label}-full.png`), fullPage: true });
  return { page, browser, headings, height, failed: [...failed] };
}

const a = await capture(`${origin}/${target.orig}`, 'orig');
const b = await capture(`${rebuildOrigin}${target.rebuild}`, 'rebuild');

// A band boundary must exist in BOTH renders, else the slices drift apart.
const key = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const bMap = new Map(b.headings.map((h) => [key(h.text), h]));
const shared = a.headings
  .filter((h) => bMap.has(key(h.text)))
  .map((h) => ({ text: h.text, aY: h.y, bY: bMap.get(key(h.text)).y }));

const onlyA = a.headings.filter((h) => !bMap.has(key(h.text))).map((h) => h.text);
const aKeys = new Set(a.headings.map((h) => key(h.text)));
const onlyB = b.headings.filter((h) => !aKeys.has(key(h.text))).map((h) => h.text);

const slug = (t) => key(t).replace(/ /g, '-').slice(0, 40) || 'band';
const bands = [];
for (let i = 0; i < shared.length; i++) {
  const start = shared[i];
  const next = shared[i + 1];
  bands.push({
    n: i + 1,
    heading: start.text,
    a: { y: start.aY, h: (next ? next.aY : a.height) - start.aY },
    b: { y: start.bY, h: (next ? next.bY : b.height) - start.bY },
  });
}

// `clip` alone is bounded by the viewport, so a band below the fold throws
// "Clipped area is … outside the resulting image". Pair it with fullPage so the
// clip is taken against the whole document.
const bandShot = (page, path, y, h, docHeight) =>
  page.screenshot({
    path,
    fullPage: true,
    clip: { x: 0, y: Math.max(0, y), width, height: Math.max(1, Math.min(h, docHeight - y)) },
  });

for (const band of bands) {
  const name = `${String(band.n).padStart(2, '0')}-${slug(band.heading)}`;
  await bandShot(a.page, join(outDir, `${name}--orig.png`), band.a.y, band.a.h, a.height);
  await bandShot(b.page, join(outDir, `${name}--rebuild.png`), band.b.y, band.b.h, b.height);
}

const report = {
  route,
  width,
  outDir,
  fullHeight: { orig: a.height, rebuild: b.height, deltaPx: b.height - a.height },
  bands: bands.map((x) => ({ n: x.n, heading: x.heading, origH: x.a.h, rebuildH: x.b.h })),
  headingsOnlyInOriginal: onlyA,
  headingsOnlyInRebuild: onlyB,
  requestsFailed: { orig: a.failed, rebuild: b.failed },
};
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await a.browser.close();
await b.browser.close();
