'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal wrapper reproducing the original's one and only scroll
 * animation (tncld#96).
 *
 * The original is **not** GSAP-driven, despite loading three GSAP bundles. It
 * uses Webflow's own IX2 engine, whose payload is bundled into the checked-in
 * export at `js/webflow.js` (the `Webflow.require("ix2").init({…})` call). The
 * `fadeIn` action list there is the whole spec:
 *
 *   trigger:  SCROLL_INTO_VIEW, scrollOffsetValue 0%, one-shot (no
 *             SCROLL_OUT_OF_VIEW counterpart exists in the payload)
 *   initial:  opacity 0            (`useFirstGroupAsInitialState: true`)
 *   reveal:   opacity 1, 1000ms, easing `outQuart`, delay 0
 *   transform: none — measured `none` at every sample, so no move and no stagger
 *
 * Measured against a local render of the export at 1440 rather than read off
 * the config alone: the sampled curve tracks 1 - (1 - p)^4 to within the rAF
 * sampling error, which is what `outQuart` means and what
 * `--reveal-ease` in page-sections.css encodes.
 *
 * The two other action lists in that payload are deliberately not reproduced,
 * because they are observably inert on the live page:
 *   - `a-37` / `a-40` ("Text Fade") put two conflicting STYLE_OPACITY items on
 *     the same target in the same group; the second wins and there is no
 *     initial state, so the sampled opacity never leaves 1.0.
 *   - `a` ("Home — Load", PAGE_FINISH) targets two element ids that appear in
 *     no `.html` file in the export at all.
 *
 * Hiding is done in CSS, gated on `(scripting: enabled)` — see
 * page-sections.css. That keeps the initial `opacity: 0` out of the no-JS and
 * reduced-motion paths entirely rather than applying it and then undoing it,
 * so nothing is ever stranded invisible (tncld#96 AC3). This is stricter than
 * the original, which hides first and reveals unconditionally.
 */
export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || revealed) return;

    // IX2's `scrollOffsetValue: 0%` means "any part of the element is in the
    // viewport", which is threshold 0 with no rootMargin. One-shot: disconnect
    // on the first intersection rather than tracking exit.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed]);

  return (
    <div
      ref={ref}
      className="section-reveal"
      data-revealed={revealed || undefined}
      // Keyboard focus reveals immediately, ahead of the observer. Tabbing to a
      // link inside a container that has not revealed yet scrolls it into view,
      // which does fire the observer — but measured on this page the focused
      // link sits at opacity 0 for ~200ms first and then fades for a second
      // more, so the focus indicator is invisible while it is the thing the
      // visitor is looking for (WCAG 2.1 AA 2.4.7). React's onFocus is
      // focusin, so a descendant reaching focus is enough.
      onFocus={() => setRevealed(true)}
    >
      {children}
    </div>
  );
}
