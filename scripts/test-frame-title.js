/*
 * Regression test for tncld#25 — WCAG 2.1 AA 4.1.2 (axe: frame-title).
 *
 * The GoHighLevel review widget embed renders a bare <iframe> with no title.
 * footer.js labelReviewWidgets() adds one at DOM-ready. This loads the embed
 * markup in real Chromium and asserts the attribute is there afterwards.
 *
 * Run: npm run test:a11y
 */

const { chromium } = require('playwright');
const path = require('path');

const FIXTURE = path.join(__dirname, 'fixtures', 'review-widget.html');
const EXPECTED = 'Google reviews for Tennessee Center for Laser Dentistry';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  await page.goto('file://' + FIXTURE, { waitUntil: 'load' });
  await page.waitForFunction(
    () => document.querySelector('iframe.lc_reviews_widget') !== null
  );
  const title = await page.getAttribute('iframe.lc_reviews_widget', 'title');
  await browser.close();

  if (pageErrors.length > 0) {
    console.error('FAIL — footer.js threw:', pageErrors);
    process.exit(1);
  }
  if (title !== EXPECTED) {
    console.error(`FAIL — iframe title was ${JSON.stringify(title)}, expected ${JSON.stringify(EXPECTED)}`);
    process.exit(1);
  }
  console.log('PASS — review widget iframe carries a title');
})();
