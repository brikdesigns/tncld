// pair-headings.mjs — pairs h1/h2 headings across the two renders for fidelity-shot.
//
// Extracted from scripts/fidelity-shot.mjs (tncld#169) so the collision shape is
// testable without a browser. A text-keyed Map keeps the LAST occurrence of a
// repeated heading, so the rebuild's footer group titles (h2 `About`, `Services`
// …) beat the page's own `About` and anchored band 1 at the footer: −3258px on
// /about @991. Pairing walks both lists in document order instead.

export const key = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Pair each original heading with the first not-yet-used rebuild heading of the
 * same text that lies AFTER the previous pairing. Monotonic in both lists, so a
 * repeated heading cannot bind band N to an occurrence below band N+1.
 *
 * A reordered heading is not paired (it surfaces as one-sided on both sides)
 * rather than producing a negative band.
 *
 * @param {{text: string, y: number}[]} aHeads original headings, document order
 * @param {{text: string, y: number}[]} bHeads rebuild headings, document order
 */
export function pairHeadings(aHeads, bHeads) {
  const shared = [];
  const usedA = new Set();
  const usedB = new Set();
  let from = 0;
  aHeads.forEach((h, ai) => {
    const k = key(h.text);
    for (let bi = from; bi < bHeads.length; bi++) {
      if (key(bHeads[bi].text) !== k) continue;
      shared.push({ text: h.text, aY: h.y, bY: bHeads[bi].y });
      usedA.add(ai);
      usedB.add(bi);
      from = bi + 1;
      break;
    }
  });
  return {
    shared,
    onlyAHeads: aHeads.filter((_, i) => !usedA.has(i)),
    onlyBHeads: bHeads.filter((_, i) => !usedB.has(i)),
  };
}

/**
 * A band with a negative height is a pairing defect, never a layout finding, so
 * it throws instead of printing a plausible-looking table (tncld#169).
 *
 * @param {{text: string, aY: number, bY: number}[]} shared
 * @param {number} aHeight original document height
 * @param {number} bHeight rebuild document height
 */
export function assertBandsNonNegative(shared, aHeight, bHeight) {
  shared.forEach((s, i) => {
    const next = shared[i + 1];
    const aH = (next ? next.aY : aHeight) - s.aY;
    const bH = (next ? next.bY : bHeight) - s.bY;
    if (aH < 0 || bH < 0) {
      throw new Error(
        `band ${i + 1} (${JSON.stringify(s.text)}) has a negative height ` +
          `(orig ${aH}px, rebuild ${bH}px): headings paired out of document order. ` +
          `This is a pairing defect, not a layout delta (tncld#169).`,
      );
    }
  });
}
