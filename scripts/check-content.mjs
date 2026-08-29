// check-content.mjs — gate for tncld#56.
// Fails if any page the site actually renders still holds placeholder copy.
// Runs offline against json/cms-data.json, so it works in CI without the live
// site. Scoped to the `dental` (TNCLD) industry and the pages that have a
// content-consuming template today: home, about, services. Extend `PAGES` as
// new templates land (patient-resource #60, etc.).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'json/cms-data.json'), 'utf8'));

const INDUSTRY = 'dental';
// Top-level pages plus every generic content page under `pages` (patient
// resources #60, etc.) — anything the site actually renders.
const PAGES = ['home', 'about', 'services'];
const PLACEHOLDER = [
  /lorem ipsum/i,
  /consectetur adipiscing/i,
  /^Topic \d+ Title$/,
  // Webflow's own unfilled-slot defaults (#92). They read as real copy in an
  // export and are the easiest placeholder to ship by accident.
  /this is the default text value/i,
  /this is some text inside of a div block/i,
  /^Button Label$/,
];

const strings = [];
const walk = (node) => {
  if (typeof node === 'string') strings.push(node);
  else if (Array.isArray(node)) node.forEach(walk);
  else if (node && typeof node === 'object') Object.values(node).forEach(walk);
};

const industry = data[INDUSTRY];
if (!industry) {
  console.error(`check-content: industry "${INDUSTRY}" missing from cms-data.json`);
  process.exit(1);
}
for (const page of PAGES) walk(industry[page]);
walk(industry.pages ?? {});
// The five section-structured interior pages (#92). Webflow leaves an unfilled
// component slot as a literal default string, so those are placeholders here in
// exactly the sense this gate means — /patient-resources' card grid carries a
// "This is the default text value" button in the export, and #92 drops it
// rather than inventing a label.
walk(industry.sectionPages ?? {});
// Service + technology detail pages (#68) — same content-consuming template.
walk(industry.serviceDetails ?? {});
walk(industry.technologyDetails ?? {});

const hits = strings.filter((s) => PLACEHOLDER.some((re) => re.test(s)));
if (hits.length) {
  console.error(
    `check-content: placeholder copy still present in ${INDUSTRY} [${PAGES.join(', ')}]:`,
  );
  for (const h of hits) console.error(`  - ${h.slice(0, 80)}`);
  process.exit(1);
}
console.log(`check-content: OK — no placeholder copy in ${INDUSTRY} [${PAGES.join(', ')}]`);
