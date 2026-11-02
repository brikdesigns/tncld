// test-live-urls.mjs — the cutover gate for tncld#168.
//
// Every URL the LIVE Webflow footer links must still resolve on the rebuild,
// because tncld#44 points tncld.com at the rebuild and every one of them is
// then a real inbound URL. Six of them 404'd when #168 was filed; three legal
// slugs changed and three pages are not built yet.
//
// This asserts the OUTCOME (final status 200), not the mechanism, so it stays
// true whether a URL is served by a route today and by a redirect tomorrow, or
// the reverse — which is exactly what happens as #137 and #127 land and their
// interim redirects in next.config.mjs are deleted.
//
// Run (the rebuild must be serving; :3000 is often taken on brik-mini):
//   npm run test:live-urls -- --origin http://localhost:3100
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = JSON.parse(
  readFileSync(join(root, 'scripts/fixtures/live-footer-urls.json'), 'utf8'),
);

const originArg = process.argv.indexOf('--origin');
const ORIGIN = originArg > -1 ? process.argv[originArg + 1] : 'http://localhost:3000';
const MAX_HOPS = 5;

// Refuse to grade the wrong server. Port 3000 on brik-mini holds a Forgejo
// instance, and a harness that measures the wrong application still prints a
// plausible table (tncld#118, scripts/lib/assert-rebuild.mjs). `theme-tncld` is
// on <body> for every route (src/app/layout.tsx), so this needs no route
// knowledge — and unlike assert-rebuild.mjs it does not need a browser, because
// nothing here depends on hydration.
async function assertOriginIsRebuild() {
  let res;
  try {
    res = await fetch(`${ORIGIN}/`, { redirect: 'follow' });
  } catch (err) {
    console.error(
      `FAIL — nothing served ${ORIGIN}/ (${err.message}). Start the rebuild ` +
        `first: npm run dev -- --port 3100, then pass --origin http://localhost:3100.`,
    );
    process.exit(1);
  }
  const html = await res.text();
  if (!html.includes('theme-tncld')) {
    console.error(
      `FAIL — ${ORIGIN} is not serving the TNCLD rebuild: no body.theme-tncld ` +
        `on /. Another process may hold the port; check ` +
        `lsof -nP -iTCP:${new URL(ORIGIN).port || 80} -sTCP:LISTEN.`,
    );
    process.exit(1);
  }
}

// Follow the chain by hand rather than with redirect:'follow', so a failure
// names the hop that broke and a loop is a distinct diagnosis from a 404.
async function resolve(path) {
  const chain = [];
  let url = new URL(path, ORIGIN).toString();
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status < 300 || res.status > 399) {
      return { status: res.status, chain };
    }
    const location = res.headers.get('location');
    if (!location) {
      return { status: res.status, chain, error: `${res.status} with no Location` };
    }
    const next = new URL(location, url).toString();
    chain.push(`${res.status} -> ${new URL(next).pathname}`);
    if (chain.length > 1 && url === next) {
      return { status: res.status, chain, error: 'redirect loop' };
    }
    url = next;
  }
  return { status: 508, chain, error: `more than ${MAX_HOPS} redirect hops` };
}

const failures = [];
await assertOriginIsRebuild();

for (const path of fixture.urls) {
  const { status, chain, error } = await resolve(path);
  const via = chain.length ? `  [${chain.join(' ')}]` : '';
  if (error || status !== 200) {
    failures.push(`${path} — ${error ?? `final status ${status}`}${via}`);
    console.error(`FAIL ${path} — ${error ?? status}${via}`);
  } else {
    console.log(`ok   ${path}${via}`);
  }
}

if (failures.length > 0) {
  console.error(
    `\nFAIL — ${failures.length}/${fixture.urls.length} live footer URL(s) do ` +
      `not resolve on the rebuild. Each is a hard 404 the day tncld#44 moves ` +
      `DNS. Add a route, or a redirect in next.config.mjs:\n  ` +
      failures.join('\n  '),
  );
  process.exit(1);
}

console.log(
  `\nPASS — all ${fixture.urls.length} live footer URLs resolve on ${ORIGIN} ` +
    `(footer captured ${fixture.capturedAt} from ${fixture.source}).`,
);
