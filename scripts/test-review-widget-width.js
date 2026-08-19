/*
 * Regression test for tncld#28 — the GHL review widget must fill the site
 * container, not shrink to 300px.
 *
 * The seam: the page HTML comes from Webflow, the CSS from this repo. So this
 * loads the real live pages and applies the LOCAL header.css on top, which is
 * what a deploy will do. Run it before deploying to prove the rule works, and
 * after deploying to confirm the CDN is serving it.
 *
 * Run: npm run test:widget-width
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CSS = fs.readFileSync(path.join(__dirname, '..', 'header.css'), 'utf8');
const PAGES = [
  '/patient-resources/new-patients',
  '/about/technology',
  '/about/meet-the-doctors',
  '/about/tour-our-office',
];
// Desktop must reach the .container-lg width; the tolerance absorbs scrollbars.
const MIN_DESKTOP_WIDTH = 1200;
const BREAKPOINTS = [1440, 991, 767, 479];

async function measure(page) {
  return page.locator('iframe.lc_reviews_widget').evaluate(
    (el) => Math.round(el.getBoundingClientRect().width)
  );
}

(async () => {
  const browser = await chromium.launch();
  let failed = 0;

  for (const url of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('https://tncld.com' + url, { waitUntil: 'load' });
    await page.waitForFunction(
      () => document.querySelector('iframe.lc_reviews_widget') !== null,
      { timeout: 15000 }
    );
    const before = await measure(page);
    await page.addStyleTag({ content: CSS });
    await page.waitForTimeout(500);
    const after = await measure(page);
    const ok = after >= MIN_DESKTOP_WIDTH;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${url}  ${before} -> ${after}px (need >= ${MIN_DESKTOP_WIDTH})`);
    await page.close();
  }

  // Horizontal overflow is the failure mode a max-width fix can introduce.
  for (const width of BREAKPOINTS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('https://tncld.com/about/technology', { waitUntil: 'load' });
    await page.addStyleTag({ content: CSS });
    await page.waitForTimeout(500);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    if (overflows) failed++;
    console.log(`${overflows ? 'FAIL' : 'PASS'}  vw=${width}  horizontal overflow: ${overflows}`);
    await page.close();
  }

  await browser.close();
  if (failed > 0) {
    console.error(`${failed} check(s) failed`);
    process.exit(1);
  }
  console.log('PASS — review widget fills the site container at every breakpoint');
})();
