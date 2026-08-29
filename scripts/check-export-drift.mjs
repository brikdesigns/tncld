// check-export-drift.mjs — gate for tncld#95 AC1.
//
// The fidelity spec for the rebuild is the checked-in Webflow export
// (index.html / about.html + css/ + images/), because the rendered original is
// unreachable from an agent sandbox: tncld.com and tncld.webflow.io are both
// egress-blocked (ADR-036), the Data API page DOM carries copy but no CSS or
// layout, and the site previewUrl is a 540x360 thumbnail.
//
// The export is dated 2026-02-11; the Webflow site's lastPublished is
// 2026-08-20. So the export is only a valid spec if the live site's copy still
// matches it. This gate proves that per page, by pulling every text string the
// Data API reports for the live page — page-level text nodes plus
// component-instance propertyOverrides, which is where the hero and section
// copy actually lives — and asserting each one is present in the export.
//
// Drift here does NOT mean "fix the export". It means the live site moved and
// that section's spec must come from the API, not the export.
//
// Usage:
//   WEBFLOW_API_TOKEN=$(op read 'op://Development/v7yjeqrzuqolnt7boicclvheb4/credential') \
//     node scripts/check-export-drift.mjs
//   node scripts/check-export-drift.mjs --json     # machine-readable report
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Webflow page ids, verified against GET /v2/sites/694f1891a016a6340049f761/pages.
const PAGES = [
  { route: '/', pageId: '694f1892a016a6340049f7db', export: 'index.html' },
  { route: '/about', pageId: '694f1892a016a6340049f7de', export: 'about.html' },
  { route: '/services', pageId: '694f1892a016a6340049f7dc', export: 'services.html' },
  {
    route: '/patient-resources',
    pageId: '694f1892a016a6340049f7dd',
    export: 'patient-resources.html',
  },
  {
    route: '/about/technology',
    pageId: '696e35cb7920bf42c9e40b4c',
    export: 'about/technology.html',
  },
  {
    route: '/about/meet-the-doctors',
    pageId: '696e35b114eb106d073a2fcc',
    export: 'about/meet-the-doctors.html',
  },
  {
    route: '/about/why-laser-dentistry',
    pageId: '69762b5e495696aa755236d1',
    export: 'about/why-laser-dentistry.html',
  },
];

const token = process.env.WEBFLOW_API_TOKEN;
if (!token) {
  console.error(
    'check-export-drift: WEBFLOW_API_TOKEN is unset.\n' +
      "  export WEBFLOW_API_TOKEN=\"$(op read 'op://Development/v7yjeqrzuqolnt7boicclvheb4/credential')\"",
  );
  process.exit(2);
}

// Webflow emits a zero-width non-joiner as an empty-rich-text placeholder, and
// curly punctuation that survives the export unchanged. Normalise whitespace
// and drop the ZWNJ so a match is about words, not invisible characters.
const normalise = (s) =>
  s
    .replace(/‌/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Strings too short or too generic to be evidence of anything — a "Close" or an
// icon name matches by accident, so asserting on them yields false greens.
const isMeaningful = (s) => s.length >= 12 && /[a-z]/i.test(s);

async function liveStrings(pageId) {
  const res = await fetch(`https://api.webflow.com/v2/pages/${pageId}/dom?limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Data API ${res.status} for page ${pageId}: ${await res.text()}`);
  }
  const { nodes = [] } = await res.json();
  const out = [];
  for (const node of nodes) {
    if (node.type === 'text' && node.text?.text) {
      out.push({ text: node.text.text, from: 'page text node' });
    }
    for (const o of node.propertyOverrides ?? []) {
      if (o.text?.text) {
        out.push({ text: o.text.text, from: `component override "${o.label}"` });
      }
    }
  }
  return out
    .map((s) => ({ ...s, text: normalise(s.text) }))
    .filter((s) => isMeaningful(s.text));
}

// The export is static HTML, so strip tags rather than pay for a browser. Copy
// split across inline markup (<em>, <br>) would false-positive on a raw
// substring search, so compare against the tag-stripped text.
function exportText(file) {
  const html = readFileSync(join(root, file), 'utf8');
  return normalise(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#x27;|&apos;/g, "'")
      .replace(/&quot;/g, '"'),
  );
}

const report = [];
for (const page of PAGES) {
  const haystack = exportText(page.export);
  const live = await liveStrings(page.pageId);
  const seen = new Set();
  const missing = [];
  for (const s of live) {
    if (seen.has(s.text)) continue;
    seen.add(s.text);
    if (!haystack.includes(s.text)) missing.push(s);
  }
  report.push({ route: page.route, export: page.export, checked: seen.size, missing });
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const r of report) {
    const status = r.missing.length ? 'DRIFT' : 'match';
    console.log(`\n${r.route}  (${r.export})  ${r.checked} live strings  -> ${status}`);
    for (const m of r.missing) {
      console.log(`  - not in export [${m.from}]: ${JSON.stringify(m.text.slice(0, 120))}`);
    }
  }
}

const drifted = report.filter((r) => r.missing.length);
if (drifted.length) {
  console.error(
    `\ncheck-export-drift: ${drifted.reduce((n, r) => n + r.missing.length, 0)} live string(s) ` +
      `absent from the export on ${drifted.map((r) => r.route).join(', ')}.\n` +
      '  The export is stale for those sections — take their spec from the Data API, not the export.',
  );
  process.exit(1);
}
console.log('\ncheck-export-drift: export copy matches the live site on every checked page.');
