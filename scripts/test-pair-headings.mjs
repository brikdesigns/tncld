/*
 * Regression test for tncld#169 — fidelity-shot paired headings through a
 * text-keyed Map, so a repeated heading bound band 1 to the footer.
 *
 * Fixtures are the measured /about @991 headings from the issue body.
 *
 * Run: npm run test:pair-headings
 */
import { pairHeadings, assertBandsNonNegative } from './lib/pair-headings.mjs';

const fail = (msg) => {
  console.error(`FAIL — ${msg}`);
  process.exit(1);
};
const eq = (got, want, label) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    fail(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
};

// Export (original): footer group titles are h4, so they are not headings here.
const orig = [
  { text: 'About', y: 376 },
  { text: 'Meet Our Team', y: 930 },
  { text: 'Tour Our Office', y: 1764 },
  { text: 'Technologies', y: 2591 },
  { text: 'Schedule an Appointment Today!', y: 3513 },
];
// Rebuild: footer group titles are h2 and collide with `About` / `Services`.
const rebuild = [
  { text: 'About', y: 320 },
  { text: 'Meet Our Team', y: 883 },
  { text: 'Tour Our Office', y: 1720 },
  { text: 'Technologies', y: 2548 },
  { text: 'Schedule an Appointment Today!', y: 3469 },
  { text: 'About', y: 4141 },
  { text: 'Services', y: 4141 },
  { text: 'Patient Resources', y: 4141 },
  { text: 'Hours', y: 4141 },
];

const { shared, onlyAHeads, onlyBHeads } = pairHeadings(orig, rebuild);

eq(shared[0], { text: 'About', aY: 376, bY: 320 }, 'band 1 anchors on the page heading, not the footer');
eq(shared.length, 5, 'five shared headings');
eq(onlyAHeads, [], 'nothing original-only');
eq(onlyBHeads.map((h) => h.text), ['About', 'Services', 'Patient Resources', 'Hours'], 'footer titles surface as rebuild-only');
assertBandsNonNegative(shared, 4491, 4954);

// Reordered heading: must not pair backwards into a negative band.
const swapped = pairHeadings(
  [{ text: 'A', y: 0 }, { text: 'B', y: 100 }],
  [{ text: 'B', y: 0 }, { text: 'A', y: 100 }],
);
eq(swapped.shared.length, 1, 'reordered heading is left unpaired');
assertBandsNonNegative(swapped.shared, 200, 200);

// The guard itself: a hand-built out-of-order pairing must throw.
let threw = false;
try {
  assertBandsNonNegative([{ text: 'X', aY: 0, bY: 4141 }, { text: 'Y', aY: 100, bY: 883 }], 200, 5000);
} catch {
  threw = true;
}
if (!threw) fail('assertBandsNonNegative accepted a negative band');

console.log('PASS — duplicate headings pair in document order; negative bands throw');
