'use client';

import Script from 'next/script';

/**
 * The practice's reviews widget (tncld#92).
 *
 * The original's `3-column-testimonial` component is a heading above a
 * third-party review embed — read out of the Webflow component DOM
 * (`bd164091-…`), which is a LeadConnector/GoHighLevel loader plus an
 * `iframe.lc_reviews_widget`. That is the same widget the legacy site serves
 * and that scripts/test-review-widget-width.js measures against tncld.com.
 *
 * Two things the legacy surface needs custom code for are done inline here:
 *
 * - **The iframe title.** The vendor renders a bare `<iframe>`, which fails
 *   WCAG 2.1 AA 4.1.2 (tncld#25). `footer.js` patches one in at DOM-ready on
 *   the Webflow site; the rebuild owns the markup, so it sets the attribute
 *   itself and the patch has nothing to do. The string matches the one
 *   scripts/test-frame-title.js asserts, so the two surfaces stay consistent.
 * - **The width.** The vendor's inline `min-width: 100%` collapses the frame to
 *   its 300px intrinsic width inside a flex parent (tncld#28); header.css fixes
 *   that on the Webflow site with a `:has()` rule. Here the wrapper sets the
 *   measured 1280px container directly.
 *
 * `strategy="lazyOnload"` because the widget sits at the bottom of both pages
 * it appears on and nothing above it depends on the vendor script.
 */
export function ReviewsWidget({
  widgetSrc,
  scriptSrc,
  title,
}: {
  widgetSrc: string;
  scriptSrc: string;
  title: string;
}) {
  return (
    <div className="section-reviews-embed__frame">
      <Script src={scriptSrc} strategy="lazyOnload" />
      <iframe
        className="lc_reviews_widget"
        src={widgetSrc}
        title={title}
        scrolling="no"
      />
    </div>
  );
}
