// assert-rebuild.mjs — the "am I actually measuring the rebuild?" guard.
//
// Extracted from scripts/fidelity-shot.mjs (tncld#118 / #120) so the motion
// harness (tncld#96) shares one copy rather than a second one that can drift.
// The whole value of this check is that it is the same check everywhere: a
// harness that measures the wrong page still prints a plausible table, and two
// near-identical guards is exactly how one of them ends up weaker.

/**
 * Refuse to measure the wrong page (tncld#118).
 *
 * Two ways a harness used to produce plausible numbers for something that was
 * not the rebuild, both hit in one session:
 *
 *   1. Port 3000 held another session's service (a Forgejo instance on
 *      brik-mini), so the "rebuild" was a different application entirely.
 *   2. A non-localhost origin got 403 on every JS chunk, so the page was the
 *      server-rendered shell with nothing hydrated.
 *
 * Neither shows up in a results table — both produce one. A wrong measurement
 * that looks right is worse than a crash, so these are hard failures.
 *
 * @param {import('playwright').Page} page
 * @param {string} label appears in the error message
 * @param {{ port?: number|string }} [opts] port named in the port-clash hint
 */
export async function assertIsRebuild(page, label, opts = {}) {
  const port = opts.port ?? 3000;
  // `body.theme-tncld` (src/app/layout.tsx) rather than page copy: it is on
  // every route, so this check does not have to know which one is being
  // measured, and no other app on a stray port will carry it.
  const isTncld = await page.evaluate(() =>
    document.body?.classList.contains('theme-tncld'),
  );
  if (!isTncld) {
    const title = await page.title();
    throw new Error(
      `${label}: this origin is not serving the TNCLD rebuild — no ` +
        `body.theme-tncld (page title: "${title}"). Another process may hold ` +
        `the port; check lsof -nP -iTCP:${port} -sTCP:LISTEN and --rebuild-origin.`,
    );
  }
  // React owns the DOM only once it has hydrated. Poll for the internal keys
  // rather than for rendered markup — the server renders the markup too, so its
  // presence proves nothing about interactivity.
  //
  // `__reactContainer$` on `document` is the signal because it is
  // route-independent. Probing a specific widget is not: keying this on
  // `[role="tab"]` made `--route /about` fail with "never hydrated" on a page
  // that had hydrated perfectly well and simply has no tabs.
  await page
    .waitForFunction(
      () => Object.keys(document).some((k) => k.startsWith('__reactContainer')),
      null,
      { timeout: 30000 },
    )
    .catch(() => {
      throw new Error(
        `${label}: the page never hydrated — measuring it would report the ` +
          `static shell as if it were the app. If the origin is not ` +
          `\`localhost\`, that is the cause: Next 16 serves 403 on ` +
          `/_next/static/chunks/* to any other host (tncld#118).`,
      );
    });
}
