#!/usr/bin/env node
/**
 * Gate: every route the app serves must be audited by the a11y suite.
 *
 * WHY: `tests/a11y/public-routes.spec.ts` is a hand-maintained array. A page
 * added without its route would leave the suite green while the page is never
 * scanned (treehouse-pediatric-dentistry#146). A gate that silently narrows
 * its own scope is worse than none, because it is also a claim.
 *
 * Walks `src/app/` for `page.tsx`, drops route groups `(x)`, and expands each
 * dynamic `[slug]` route to every slug it statically generates. Every resulting
 * path must appear as a `path:` in the spec, and the 404 probe must remain.
 * Needs only node — run it before `npm ci`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const APP_DIR = 'src/app';
const SPEC = 'tests/a11y/public-routes.spec.ts';
const NOT_FOUND_PROBE = '/this-page-does-not-exist-a11y-probe';

const cms = JSON.parse(readFileSync('json/cms-data.json', 'utf8')).dental;

/** patient-resources/[slug] excludes these (see its NOT_CHILDREN set). */
const NOT_CHILDREN = new Set(['patient-resources', 'meet-the-doctors', 'technology', 'why-laser-dentistry']);

/**
 * Slugs each dynamic route generates, read from the same sources its
 * `generateStaticParams` reads. A dynamic route not listed here fails the gate.
 */
const DYNAMIC = {
  '/legal/[slug]': () =>
    [...readFileSync('src/lib/legal.ts', 'utf8').matchAll(/^\s*slug:\s*'([^']+)'/gm)]
      .map((m) => m[1])
      .filter((s) => s !== 'string'),
  '/services/[slug]': () => Object.keys(cms.serviceDetails ?? {}),
  '/technology/[slug]': () => Object.keys(cms.technologyDetails ?? {}),
  '/patient-resources/[slug]': () =>
    Object.keys(cms.pages ?? {}).filter((s) => !NOT_CHILDREN.has(s)),
};

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const spec = readFileSync(SPEC, 'utf8');
const specPaths = new Set([...spec.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]));

const failures = [];
const expected = [];

for (const file of walk(APP_DIR)) {
  if (!/(^|[\\/])page\.(tsx|ts|jsx|js)$/.test(file)) continue;
  const segs = relative(APP_DIR, file)
    .split(sep)
    .slice(0, -1)
    .filter((s) => !/^\(.*\)$/.test(s));
  const route = '/' + segs.join('/');
  if (!route.includes('[')) {
    expected.push(route);
  } else if (DYNAMIC[route]) {
    const slugs = DYNAMIC[route]();
    if (!slugs.length) failures.push(`${route} resolved to zero slugs — the slug source in ${import.meta.url} is stale.`);
    for (const s of slugs) expected.push(route.replace('[slug]', s));
  } else {
    failures.push(`${file} is a dynamic route with no slug source — add it to DYNAMIC in scripts/assert-a11y-routes.mjs.`);
  }
}

for (const route of expected.sort()) {
  if (!specPaths.has(route)) {
    failures.push(`${route} is never audited — add { path: '${route}', name: '…' } to PUBLIC_ROUTES in ${SPEC}.`);
  }
}
if (!specPaths.has(NOT_FOUND_PROBE)) {
  failures.push(`the 404 probe '${NOT_FOUND_PROBE}' is missing from ${SPEC}.`);
}

if (failures.length) {
  console.error(`[assert-a11y-routes] ${failures.length} problem(s):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}

const extras = [...specPaths].filter((p) => p !== NOT_FOUND_PROBE && !expected.includes(p));
if (extras.length) {
  console.warn(`[assert-a11y-routes] note — audited route(s) with no page: ${extras.join(', ')}. Check for a typo.`);
}
console.log(`[assert-a11y-routes] all ${expected.length} route(s) under ${APP_DIR} are audited (plus the 404 probe).`);
