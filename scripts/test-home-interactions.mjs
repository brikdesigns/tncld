/*
 * Regression test for tncld#97 — the homepage's two restored interactions plus
 * the hero background video.
 *
 * These are the pieces #13's superseded no-pixel-parity charter flattened into
 * static substitutes, so the thing worth guarding is that they stay *behaviour*:
 * a real tab widget, a real modal player, a real autoplay background video.
 * Every geometry and colour value asserted here was measured on the rendered
 * Webflow export at 1440 (markdown/fidelity-method.md § Step 3), not chosen.
 *
 * Needs a running dev/prod server. Two traps this file is shaped around:
 *
 * 1. The default origin is `localhost`, NOT `127.0.0.1`. Next 16's dev server
 *    answers 403 on /_next/static/chunks/* for a non-localhost origin, so the
 *    page arrives unhydrated and every interaction assertion fails for a reason
 *    that has nothing to do with the code.
 * 2. It never waits on `networkidle`. The hero video this suite asserts is an
 *    autoplaying HLS loop, so the network is never idle and the wait simply
 *    times out — reliably so against a deploy preview, where the segments keep
 *    arriving. Waits are on the elements instead.
 *
 * Run: npm run test:interactions            (server on :3000)
 *      npm run test:interactions -- --origin http://localhost:3100
 */

import { chromium } from 'playwright';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const ORIGIN = arg('origin', 'http://localhost:3000');

/** The original's own playback IDs, read out of index.html. */
const PLAYBACK_IDS = {
  story: [
    'dHGGUOQu8aOCHgitzLmQqdzZb5F4f1DDe1qF48yRTqE', // A Life-Changing Transformation
    'Fiikx6lOPjNe2PmaAiOAwujwi026WYlGDs21gZcVRzJM', // A Great First Visit
    '5eTr5CPDOUTVVht4a8ZjG4IT6Os1WVhWwXl9ywhzRn8', // Comfort for Every Age
  ],
  hero: 'r92oSj01u7jQ8cbg2lazj16yAtoEScCvFsdFd4ceLHWU',
};

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(
    `${pass ? '  ok  ' : ' FAIL '} ${name}${detail ? ` — ${detail}` : ''}`,
  );
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });

/**
 * Wait for the tab widget to be genuinely INTERACTIVE, not merely present.
 *
 * Do not wait on `[aria-selected="true"]` — the server renders that already, so
 * it is true before any handler is attached and the keyboard assertions then run
 * against dead markup. Against the Netlify preview that produced three failures
 * while the story modals lower down passed, which is the giveaway: the page was
 * hydrating fine, the wait was just measuring the wrong thing.
 *
 * React's per-node internal keys are the signal that the fiber owns the element.
 */
await page.waitForFunction(
  () =>
    Object.keys(document.querySelector('.section-tabs__tab') ?? {}).some((k) =>
      k.startsWith('__react'),
    ),
  null,
  { timeout: 30_000 },
);
check('tab widget is hydrated and interactive (precondition)', true, errors[0] ?? '');

// ── Tabbed treatments ───────────────────────────────────────────────────
const tabs = page.getByRole('tab');
check('three tabs, in the original order', (await tabs.count()) === 3);

const selected = () =>
  tabs.evaluateAll((els) =>
    els.findIndex((e) => e.getAttribute('aria-selected') === 'true'),
  );

check(
  'the third tab opens by default (original ships data-current="Tab 3")',
  (await selected()) === 2,
);
check('exactly one panel is rendered', (await page.getByRole('tabpanel').count()) === 1);

// `2-column-tabbed-stacked` is literal: a tab COLUMN beside the panel. This is
// the assertion that would have caught reading it as a strip above the panel.
const geom = await page.evaluate(() => {
  const list = document.querySelector('.section-tabs__tablist');
  const panel = document.querySelector('.section-tabs__panel');
  const tab = document.querySelector('.section-tabs__tab');
  const open = document.querySelector('.section-tabs__tab[aria-selected="true"]');
  return {
    direction: getComputedStyle(list).flexDirection,
    sideBySide:
      panel.getBoundingClientRect().left >= list.getBoundingClientRect().right - 2,
    tabHeight: Math.round(tab.getBoundingClientRect().height),
    tabRadius: getComputedStyle(tab).borderRadius,
    restingBg: getComputedStyle(tab).backgroundColor,
    openBg: getComputedStyle(open).backgroundColor,
    panelBg: getComputedStyle(panel).backgroundColor,
  };
});
check(
  'tab strip is a vertical column beside the panel',
  geom.direction === 'column' && geom.sideBySide,
  `${geom.direction}, sideBySide=${geom.sideBySide}`,
);
check(
  'measured treatment: resting rgb(0,101,255), open rgb(255,255,255), panel rgb(24,24,24)',
  geom.restingBg === 'rgb(0, 101, 255)' &&
    geom.openBg === 'rgb(255, 255, 255)' &&
    geom.panelBg === 'rgb(24, 24, 24)',
  `${geom.restingBg} / ${geom.openBg} / ${geom.panelBg}`,
);
check(
  'measured tab box: 180px min-height, 12px radius',
  geom.tabHeight >= 180 && geom.tabRadius === '12px',
  `h=${geom.tabHeight} radius=${geom.tabRadius}`,
);

// Keyboard operability — WCAG 2.1 AA per the repo Compliance Profile. Webflow's
// own w-tabs widget ships none of this, which is why it is not reused.
check(
  'roving tabindex — only the open tab is a tab stop',
  JSON.stringify(await tabs.evaluateAll((e) => e.map((t) => t.getAttribute('tabindex')))) ===
    JSON.stringify(['-1', '-1', '0']),
);
await tabs.nth(2).focus();
await page.keyboard.press('ArrowRight');
check('ArrowRight wraps last → first', (await selected()) === 0);
const focusFollows = await page.evaluate(() =>
  document.activeElement?.classList.contains('section-tabs__tab'),
);
check('focus moves with the selection', focusFollows === true);
await page.keyboard.press('ArrowLeft');
check('ArrowLeft wraps first → last', (await selected()) === 2);
await page.keyboard.press('Home');
check('Home selects the first tab', (await selected()) === 0);
await page.keyboard.press('End');
check('End selects the last tab', (await selected()) === 2);
check(
  'aria-controls / aria-labelledby pair up',
  await page.evaluate(() => {
    const tab = document.querySelector('.section-tabs__tab[aria-selected="true"]');
    const panel = document.querySelector('[role="tabpanel"]');
    return (
      tab.getAttribute('aria-controls') === panel.id &&
      panel.getAttribute('aria-labelledby') === tab.id
    );
  }),
);
const ring = await page.evaluate(() => {
  const tab = document.querySelector('.section-tabs__tab');
  tab.focus();
  const cs = getComputedStyle(tab);
  return { width: parseFloat(cs.outlineWidth), style: cs.outlineStyle };
});
check(
  'visible focus indicator on the tabs',
  ring.style !== 'none' && ring.width >= 2,
  `${ring.width}px ${ring.style}`,
);

// The open panel's link must resolve — "no dead card, no 404" (AC3).
const href = await page.evaluate(
  () => document.querySelector('.section-tabs__panel a')?.getAttribute('href') ?? null,
);
const status = href ? (await page.request.get(ORIGIN + href)).status() : 0;
check("open panel's link resolves", status === 200, `${href} → HTTP ${status}`);

// ── Patient-story videos ────────────────────────────────────────────────
// The posters are loading="lazy", as the original's are, and the cards sit
// ~9000px down the page — so they must be scrolled to before they load at all.
await page.locator('.section-testimonials').scrollIntoViewIfNeeded();
await page.waitForTimeout(2500);

const posters = await page.evaluate(() =>
  [...document.querySelectorAll('.section-testimonials__card-poster')].map((i) => ({
    src: decodeURIComponent(i.getAttribute('src') ?? ''),
    natural: i.naturalWidth,
  })),
);
check('three story posters', posters.length === 3);
check(
  "posters use the original's image.mux.com animated.gif URL and playback IDs",
  PLAYBACK_IDS.story.every((pid, i) =>
    posters[i]?.src.includes(
      `https://image.mux.com/${pid}/animated.gif?width=640&fps=5`,
    ),
  ),
);
check(
  'posters actually load from Mux',
  posters.every((p) => p.natural > 0),
  `naturalWidths=${posters.map((p) => p.natural).join(',')}`,
);

const watch = page.getByRole('button', { name: /Watch Their Story/ });
check('three story buttons', (await watch.count()) === 3);
check(
  'each button names its own story (the label repeats in the original)',
  (await watch.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))).every(
    (n, i) =>
      n?.includes(
        ['A Life-Changing Transformation', 'A Great First Visit', 'Comfort for Every Age'][i],
      ),
  ),
);

for (const index of [0, 1, 2]) {
  await watch.nth(index).click();
  await page.waitForTimeout(900);
  const modal = await page.evaluate(() => {
    const d = document.querySelector('.story-dialog[open]');
    if (!d) return null;
    return {
      playbackId: d.querySelector('mux-player')?.getAttribute('playback-id'),
      label: d.getAttribute('aria-label'),
      dismiss: d.querySelector('.story-dialog__dismiss')?.innerText?.trim(),
    };
  });
  check(
    `story ${index + 1} opens a modal on its own playback ID`,
    modal?.playbackId === PLAYBACK_IDS.story[index],
    `${modal?.playbackId ?? 'no modal'}`,
  );
  check(
    `story ${index + 1} modal and dismiss both have accessible names`,
    Boolean(modal?.label) && Boolean(modal?.dismiss),
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check(
    `story ${index + 1} closes on Esc`,
    await page.evaluate(() => !document.querySelector('.story-dialog[open]')),
  );
}

// ── Hero background video ───────────────────────────────────────────────
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
const hero = await page.evaluate(() => {
  const v = document.querySelector('.section-hero__video');
  if (!v) return null;
  const cs = getComputedStyle(v);
  return {
    playbackId: v.getAttribute('playback-id'),
    autoplay: v.getAttribute('autoplay'),
    loop: v.hasAttribute('loop'),
    // mux-player's React wrapper maps `muted` to the property, which delegates
    // to the inner <video>, so the attribute may legitimately be absent.
    muted: v.muted === true || v.hasAttribute('muted'),
    ariaHidden: v.getAttribute('aria-hidden'),
    controls: cs.getPropertyValue('--controls').trim(),
  };
});
check(
  "hero video runs the original's playback ID, autoplay muted loop, no chrome",
  hero?.playbackId === PLAYBACK_IDS.hero &&
    hero?.autoplay === 'muted' &&
    hero?.loop === true &&
    hero?.muted === true &&
    hero?.controls === 'none',
  JSON.stringify(hero),
);
check('hero video is decorative (aria-hidden)', hero?.ariaHidden === 'true');

// The scrim has to sit above the video, or the hero copy has no guaranteed
// contrast ratio over a moving frame.
const scrim = await page.evaluate(() => {
  const cs = getComputedStyle(document.querySelector('.section-hero'), '::after');
  return { content: cs.content, bg: cs.backgroundColor };
});
check(
  'hero scrim rides on the section, so it covers the video too',
  scrim.content !== 'none' && scrim.bg === 'rgba(0, 0, 0, 0.4)',
  JSON.stringify(scrim),
);

// Reduced motion falls back to the still, not to an empty box.
const reduced = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
const reducedPage = await reduced.newPage();
await reducedPage.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
await reducedPage.locator('.section-hero__image img').waitFor({
  state: 'attached',
  timeout: 30_000,
});
// The video mounts from an effect, so give it the chance to appear before
// asserting that it did not — otherwise this passes for the wrong reason.
await reducedPage.waitForTimeout(2000);
const fallback = await reducedPage.evaluate(() => ({
  video: Boolean(document.querySelector('.section-hero__video')),
  still: Boolean(document.querySelector('.section-hero__image img')),
}));
check(
  'prefers-reduced-motion: no video, still retained',
  fallback.video === false && fallback.still === true,
  JSON.stringify(fallback),
);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(
  `\ntest-home-interactions: ${results.length - failed.length}/${results.length} passed`,
);
if (failed.length) {
  failed.forEach((f) => console.log(`  FAILED: ${f.name} ${f.detail ?? ''}`));
  process.exit(1);
}
