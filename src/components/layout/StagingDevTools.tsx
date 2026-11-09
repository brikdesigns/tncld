'use client';

import { usePathname } from 'next/navigation';

/**
 * Brik dev tools (token/component inspector + design feedback pin-drop widget)
 * for the `tncld-staging` review surface (brik-client-portal#6583).
 *
 * The Astro client sites add these with a post-build `inject-devtools.mjs` over
 * `dist/`; this site renders through @netlify/plugin-nextjs, so there is no
 * static HTML to rewrite and the same contract lives here instead. The root
 * layout reads the env and renders this only when PUBLIC_ENABLE_DEV_TOOLS is
 * "true" — a per-SITE var on `tncld-staging`, never in netlify.toml (a staging
 * site builds in Netlify's `production` context, see netlify.toml). The
 * feedback widget also needs PUBLIC_FEEDBACK_TOKEN and PUBLIC_FEEDBACK_API_URL;
 * neither has a fallback, since an origin default names a tier (#4287).
 * brik-client-portal `scripts/provision-staging-widget.ts` sets all three.
 *
 * The tags are server-rendered so the served HTML carries `data-api-url`, which
 * is what `provision-staging-widget.ts --check` asserts. `defer` keeps the
 * constants → widget order and `document.currentScript`, which the widget reads
 * its config from.
 *
 * The widget reads `data-variant-key` once, at load: it is right on every full
 * page load, and after a `next/link` navigation it stays at the landing page's
 * key. Each submission still records `page_url` from `window.location`, so a
 * filed item always names the page it was left on.
 */
const BASE =
  'https://rnspxmrkpoukccahggli.supabase.co/storage/v1/object/public/design-mockups/shared';

/** "/" -> "home", "/about/technology/" -> "about/technology" (inject-devtools.mjs). */
function variantKey(pathname: string): string {
  const key = pathname.replace(/^\/+|\/+$/g, '');
  return key === '' ? 'home' : key;
}

export function StagingDevTools({ token, apiUrl }: { token: string; apiUrl: string }) {
  const pathname = usePathname();
  return (
    <>
      <script src={`${BASE}/inspect-widget.js`} data-auto-enable="1" defer />
      {token && apiUrl ? (
        <>
          <script src={`${BASE}/widget-constants.global.js`} defer />
          <script
            src={`${BASE}/feedback-widget.js`}
            data-review-token={token}
            data-api-url={apiUrl}
            data-variant-key={variantKey(pathname)}
            defer
          />
        </>
      ) : null}
    </>
  );
}
