import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — accessibility audit (shared Brik site a11y gate,
 * brik-llm#5076).
 *
 * Two modes:
 * 1. Local (no PLAYWRIGHT_BASE_URL): builds and boots `next start`, so the
 *    production bundle is audited without a Netlify deploy. Not `next dev`: its
 *    on-demand compile answers 200 before `<main>` exists, which fails the
 *    gate's render check on a cold route.
 * 2. CI (PLAYWRIGHT_BASE_URL set to the Netlify deploy-preview): no webServer —
 *    audit the bundle Netlify actually built and served.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3100';
const USE_LOCAL_SERVER = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/a11y',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // Audit first-paint state without motion in flight. MUST be nested under
    // `contextOptions`: `use: { reducedMotion }` is not a TestOptions key and
    // never reaches the browser context. The shared gate asserts the pref is live.
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(USE_LOCAL_SERVER
    ? {
        webServer: {
          command: 'npm run build && npm run start -- --port 3100',
          url: 'http://localhost:3100',
          reuseExistingServer: false,
          timeout: 300 * 1000,
        },
      }
    : {}),
});
