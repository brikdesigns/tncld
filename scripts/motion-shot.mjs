// motion-shot.mjs — the MOTION half of the fidelity harness (tncld#96 AC4).
//
// WHY THIS IS A SEPARATE SCRIPT AND NOT A FLAG ON fidelity-shot.mjs
// fidelity-shot.mjs forces every zero-opacity element visible after load (its
// REVEAL step) so a static side-by-side is not a column of blank bands. That is
// correct for #95/#97 and fatal here: it destroys the reveal-on-scroll state
// this script exists to measure. The two harnesses want opposite things from
// the same page, so they are two scripts, not one with a mode.
// See markdown/fidelity-method.md § Known limits.
//
// WHAT IT MEASURES
// The original's whole scroll choreography is one effect — Webflow IX2's
// `fadeIn` action list, bundled into the checked-in export's js/webflow.js:
//
//   trigger  SCROLL_INTO_VIEW, offset 0%, one-shot
//   initial  opacity 0
//   reveal   opacity 1, 1000ms, easing outQuart (= 1 - (1 - p)^4)
//   no transform, no stagger
//
// So this script parks each revealing element just below the viewport, scrolls
// it in, and samples computed opacity every animation frame — for the original
// AND the rebuild, in the same run. It then checks the sampled curve against
// the spec above rather than against the other render's samples: both are
// JS-driven and neither's start instant is observable, so curve-vs-curve
// comparison measures sampling jitter as much as fidelity.
//
// It also asserts the three paths where the original is NOT the bar (#96 AC3):
// with `prefers-reduced-motion: reduce` and with JavaScript disabled every
// revealing element must already be at opacity 1, and keyboard focus must
// reveal its container at once rather than leaving the focus indicator
// invisible. The original strands content in all three; the rebuild does not.
//
// Usage:
//   python3 -m http.server 8899 --bind 127.0.0.1     # the export, repo root
//   npx next dev -p 3100                             # the rebuild
//   node scripts/motion-shot.mjs
//   node scripts/motion-shot.mjs --route /about --rebuild-origin http://localhost:3100
import { chromium } from 'playwright';
import { assertIsRebuild } from './lib/assert-rebuild.mjs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};

const ROUTES = {
  '/': { orig: 'index.html', rebuild: '/' },
  '/about': { orig: 'about.html', rebuild: '/about' },
};

/** The revealing element in each render. */
const SELECTORS = {
  // Webflow's own wrapper — the element carrying the fadeIn data-w-id.
  original: '.section-tabbed',
  // The rebuild's equivalent container (src/components/sections/Reveal.tsx).
  rebuild: '.section-reveal',
};

const SPEC = {
  durationMs: 1000,
  /** outQuart. */
  ease: (p) => 1 - (1 - p) ** 4,
  /**
   * outQuart is asymptotic, so "when did it finish" is not observable — the
   * last 0.1% of opacity takes 18% of the duration. The measurable landmark is
   * the first frame at opacity ≥ 0.999, which outQuart reaches at p here:
   *   1 - (1 - p)^4 = 0.999  →  p = 1 - 0.001^(1/4) = 0.8221
   * Dividing the measured t(0.999) by this recovers the nominal duration. The
   * first version of this script compared t(0.999) directly against 1000ms and
   * so failed the ORIGINAL at 825ms — flagging the reference render as
   * non-conformant to the spec read out of its own config.
   */
  p999: 1 - 0.001 ** 0.25,
  /** Max |sampled - spec| allowed at a normalized checkpoint. */
  curveTolerance: 0.05,
  /** Accepted nominal-duration window; a JS-driven fade lands slightly long. */
  durationWindow: [850, 1200],
};

const route = arg('route', '/');
const width = Number(arg('width', 1440));
const height = Number(arg('height', 900));
const origOrigin = arg('orig-origin', 'http://127.0.0.1:8899');
// `localhost`, NOT `127.0.0.1` (tncld#118) — Next 16 answers 403 on every
// /_next/static/chunks/* for any other host, which renders the page unhydrated
// and therefore motionless for a reason that has nothing to do with the code.
const rebuildOrigin = arg('rebuild-origin', 'http://localhost:3000');

const target = ROUTES[route];
if (!target) {
  console.error(`motion-shot: unknown route ${route}. Known: ${Object.keys(ROUTES).join(', ')}`);
  process.exit(2);
}

const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
};
const pass = (msg) => console.log(`  ✓ ${msg}`);

/**
 * Park `index`-th match just below the fold, scroll it in, and sample computed
 * opacity every frame. Returns the raw samples plus the element's geometry.
 */
async function sampleReveal(page, selector, index) {
  return page.evaluate(
    async ({ selector, index }) => {
      const el = document.querySelectorAll(selector)[index];
      if (!el) return { error: `no ${selector}[${index}]` };
      const top = el.getBoundingClientRect().top + window.scrollY;
      const geometry = {
        top: Math.round(top),
        height: Math.round(el.getBoundingClientRect().height),
      };

      window.scrollTo(0, Math.max(0, top - window.innerHeight - 200));
      await new Promise((r) => setTimeout(r, 400));
      const before = Number(getComputedStyle(el).opacity);
      const transformBefore = getComputedStyle(el).transform;

      // One pixel of the element inside the viewport is IX2's `offset 0%`.
      window.scrollTo(0, Math.max(0, top - window.innerHeight + 1));
      const t0 = performance.now();
      const samples = [];
      const transforms = new Set();
      while (performance.now() - t0 < 2000) {
        const cs = getComputedStyle(el);
        samples.push([performance.now() - t0, Number(cs.opacity)]);
        transforms.add(cs.transform);
        await new Promise((r) => requestAnimationFrame(r));
      }
      return { geometry, before, transformBefore, samples, transforms: [...transforms] };
    },
    { selector, index },
  );
}

/**
 * Reduce raw frame samples to the numbers the spec is stated in: when the fade
 * actually started, how long it took, and how far it strayed from outQuart.
 */
function analyse(samples) {
  const startIdx = samples.findIndex(([, o]) => o > 0.001);
  const endIdx = samples.findIndex(([, o]) => o >= 0.999);
  if (startIdx === -1 || endIdx === -1) return null;
  // The fade began somewhere between the last zero sample and the first
  // non-zero one; the midpoint is the least-wrong estimate available.
  const t0 = startIdx === 0 ? samples[0][0] : (samples[startIdx - 1][0] + samples[startIdx][0]) / 2;
  const t999 = samples[endIdx][0] - t0;
  // The nominal duration the spec is written in, recovered from the one
  // landmark a frame sampler can actually see. See SPEC.p999.
  const duration = t999 / SPEC.p999;

  const at = (p) => {
    const t = t0 + p * duration;
    let prev = samples[startIdx === 0 ? 0 : startIdx - 1];
    for (const s of samples) {
      if (s[0] >= t) {
        const span = s[0] - prev[0] || 1;
        return prev[1] + (s[1] - prev[1]) * ((t - prev[0]) / span);
      }
      prev = s;
    }
    return prev[1];
  };

  const checkpoints = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((p) => ({
    p,
    measured: at(p),
    spec: SPEC.ease(p),
  }));
  const maxDeviation = Math.max(...checkpoints.map((c) => Math.abs(c.measured - c.spec)));
  return { duration, t999, checkpoints, maxDeviation };
}

async function measure(label, url, selector, port) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  // Not `networkidle`: the rebuild's hero is an autoplaying HLS loop since
  // tncld#97, so the network never goes idle and the wait just times out.
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  if (label === 'rebuild') await assertIsRebuild(page, label, { port });
  await page.waitForTimeout(2000);

  const count = await page.$$eval(selector, (els) => els.length);
  console.log(`\n${label} — ${url}`);
  console.log(`  ${count} × ${selector}`);
  if (count === 0) fail(`${label}: no ${selector} on ${route} — nothing reveals`);

  const results = [];
  for (let i = 0; i < count; i++) {
    const raw = await sampleReveal(page, selector, i);
    if (raw.error) {
      fail(`${label}[${i}]: ${raw.error}`);
      continue;
    }
    const stats = analyse(raw.samples);
    // A container already inside the viewport at load has no scroll-triggered
    // reveal to sample: its trigger fires immediately, in both renders. There
    // is nowhere to park above it, so this is a limit of the measurement, not a
    // fidelity gap — the check that still means something is that the two
    // renders agree about which containers are in this state, asserted below.
    const aboveFold = raw.geometry.top < height;
    results.push({ i, raw, stats, aboveFold });

    const geo = `top ${raw.geometry.top} h ${raw.geometry.height}`;
    if (aboveFold) {
      pass(`${label}[${i}] (${geo}): above the fold — reveals on load, no scroll trigger to sample`);
      continue;
    }
    if (raw.before > 0.001) {
      fail(`${label}[${i}] (${geo}): starts at opacity ${raw.before}, expected 0`);
    } else if (!stats) {
      fail(`${label}[${i}] (${geo}): never reached opacity 1 after scrolling in`);
    } else {
      const [lo, hi] = SPEC.durationWindow;
      const dur = Math.round(stats.duration);
      const dev = stats.maxDeviation.toFixed(3);
      const okDur = dur >= lo && dur <= hi;
      const okCurve = stats.maxDeviation <= SPEC.curveTolerance;
      const line =
        `${label}[${i}] (${geo}): 0 → 1 over ${dur}ms nominal ` +
        `(t₀.₉₉₉ ${Math.round(stats.t999)}ms), max |Δ| vs outQuart ${dev}`;
      if (okDur && okCurve) pass(line);
      if (!okDur) fail(`${line} — duration outside ${lo}–${hi}ms`);
      if (!okCurve) fail(`${line} — curve deviates more than ${SPEC.curveTolerance}`);
      // The original measures `transform: none` at every sample; a rebuild that
      // added a move would be embellishing, not reproducing.
      const moved = raw.transforms.filter((t) => t !== 'none');
      if (moved.length) fail(`${label}[${i}]: transform changed (${moved.join(', ')}), expected none`);
    }
  }
  await browser.close();
  return results;
}

/**
 * The two paths where the rebuild is deliberately STRICTER than the original
 * (#96 AC3): content must be visible, not stranded at opacity 0.
 */
async function assertAlwaysVisible(mode) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height },
    ...(mode === 'reduced-motion'
      ? { reducedMotion: 'reduce' }
      : { javaScriptEnabled: false }),
  });
  const page = await context.newPage();
  await page.goto(rebuildOrigin + target.rebuild, { waitUntil: 'load', timeout: 90000 });
  // No assertIsRebuild here: with JS disabled nothing can hydrate by
  // definition, which is the very condition under test.
  await page.waitForTimeout(1200);

  const opacities = await page.$$eval(SELECTORS.rebuild, (els) =>
    els.map((el) => getComputedStyle(el).opacity),
  );
  const hidden = opacities.filter((o) => Number(o) < 0.999);
  if (opacities.length === 0) {
    fail(`${mode}: no ${SELECTORS.rebuild} rendered — cannot prove content is reachable`);
  } else if (hidden.length) {
    fail(`${mode}: ${hidden.length}/${opacities.length} containers below opacity 1 (${hidden.join(', ')})`);
  } else {
    pass(`${mode}: all ${opacities.length} containers at opacity 1 with no scrolling`);
  }
  await browser.close();
}

const rebuildPort = new URL(rebuildOrigin).port || '3000';

/**
 * Keyboard focus must reveal its container at once (#96 AC3 read against WCAG
 * 2.1 AA 2.4.7). Tabbing into an unrevealed container does scroll it into view,
 * which fires the observer — but before Reveal.tsx handled focus directly the
 * focused link measured `opacity: 0` for ~200ms and then faded for a second
 * more, so the focus indicator was invisible exactly when it mattered.
 */
async function assertFocusReveals() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(rebuildOrigin + target.rebuild, { waitUntil: 'load', timeout: 90000 });
  await assertIsRebuild(page, 'rebuild', { port: rebuildPort });
  await page.waitForTimeout(2000);

  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    const state = await page.evaluate(() => {
      const box = document.activeElement?.closest('.section-reveal');
      if (!box) return null;
      return {
        label: (document.activeElement.textContent || '').trim().slice(0, 40),
        opacity: Number(getComputedStyle(box).opacity),
        revealed: box.hasAttribute('data-revealed'),
      };
    });
    if (!state) continue;
    if (state.revealed) {
      pass(`focus reveal: focusing "${state.label}" (tab ${i + 1}) revealed its container at once`);
    } else {
      fail(
        `focus reveal: "${state.label}" (tab ${i + 1}) has focus inside a container still at ` +
          `opacity ${state.opacity} — the focus indicator is invisible (WCAG 2.4.7)`,
      );
    }
    await browser.close();
    return;
  }
  fail('focus reveal: 80 tabs never reached a focusable element inside a reveal container');
  await browser.close();
}


console.log(`motion-shot — route ${route} at ${width}×${height}`);
console.log(`spec: opacity 0 → 1, ${SPEC.durationMs}ms, outQuart, no transform (IX2 fadeIn)`);

const original = await measure('original', `${origOrigin}/${target.orig}`, SELECTORS.original);
const rebuild = await measure(
  'rebuild',
  rebuildOrigin + target.rebuild,
  SELECTORS.rebuild,
  rebuildPort,
);

console.log('\naccessibility paths (rebuild only — the original fails all three by design)');
await assertAlwaysVisible('reduced-motion');
await assertAlwaysVisible('no-javascript');
await assertFocusReveals();

console.log('\noriginal vs rebuild');
console.log('  revealing containers: ' + `original ${original.length}, rebuild ${rebuild.length}`);
if (original.length !== rebuild.length) {
  fail(
    `container count differs — the original wraps ${original.length} group(s) on ${route}, ` +
      `the rebuild ${rebuild.length}. Check the \`reveal\` markers in json/cms-data.json ` +
      `against markdown/section-maps/home.md § Scroll choreography.`,
  );
}
const cell = (r, key) => {
  if (!r) return '—';
  if (r.aboveFold) return 'on load';
  if (!r.stats) return '—';
  return key === 'ms' ? Math.round(r.stats.duration) : r.stats.maxDeviation.toFixed(3);
};
console.table(
  original.map((o, i) => ({
    group: i,
    'original top': o.raw.geometry.top,
    'rebuild top': rebuild[i]?.raw.geometry.top ?? '—',
    'original ms': cell(o, 'ms'),
    'rebuild ms': cell(rebuild[i], 'ms'),
    'original Δ': cell(o, 'dev'),
    'rebuild Δ': cell(rebuild[i], 'dev'),
  })),
);

// The above-the-fold containers are excused from curve measurement, so the two
// renders must at least agree about which ones those are — otherwise a rebuild
// whose bands drifted upward would quietly stop being measured.
const foldSet = (rs) => rs.map((r) => (r.aboveFold ? 1 : 0)).join('');
if (foldSet(original) !== foldSet(rebuild)) {
  fail(
    `the renders disagree about which containers are above the fold at ` +
      `${height}px (original ${foldSet(original)}, rebuild ${foldSet(rebuild)}) — ` +
      `one is being measured where the other is not`,
  );
}

if (failures.length) {
  console.error(`\nmotion-shot: ${failures.length} failure(s) on ${route}`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\nmotion-shot: ${route} matches the IX2 fadeIn spec, and stays visible without JS or motion.`);
