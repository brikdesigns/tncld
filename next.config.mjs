/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: '*.supabase.co' },
      { hostname: 'cdn.prod.website-files.com' }, // Webflow CDN (legacy assets during migration)
      // Animated posters for the patient-story videos (tncld#97). Unlike the
      // Webflow CDN entry above, this is not a migration leftover: these are
      // TNCLD's own Mux assets, and the original loads them from this host too.
      { hostname: 'image.mux.com' },
    ],
  },
  // Six URLs the LIVE Webflow site links from its own footer have no route on
  // the rebuild (tncld#168). #44 points tncld.com at the rebuild, so without
  // these every one becomes a hard 404 for anyone arriving from a bookmark, an
  // email, a directory listing or a search result.
  //
  // WHY next.config.mjs AND NOT netlify.toml [[redirects]]: netlify.toml is a
  // CDN-edge rule, so it does not exist in `next dev` and cannot be asserted by
  // scripts/test-live-urls.mjs against a local server — the same shape of gap
  // that let the jsDelivr pin rot unnoticed three times (CLAUDE.md § The gate).
  // Redirects here run in dev, in `next start`, and on Netlify via
  // @netlify/plugin-nextjs, so one rule is testable everywhere it ships.
  //
  // `permanent` is Next's 308/307, NOT 301/302 — it preserves the request
  // method (node_modules/next/dist/docs/01-app/03-api-reference/05-config/
  // 01-next-config-js/redirects.md).
  async redirects() {
    return [
      // --- Permanent: the legal slugs changed, the pages did not. ---------
      // Operator ruling 2026-09-02, per the AC that forbids an agent deciding
      // it. Both are settled renames, so they are cached forever.
      {
        source: '/legal/accessibility-statement',
        destination: '/legal/accessibility',
        permanent: true,
      },
      {
        // 45 CFR §164.520 calls the artefact a "Notice of Privacy Practices";
        // the rebuild dropped the "HIPAA" prefix from the slug (src/lib/legal.ts).
        source: '/legal/hipaa-notice-of-privacy-practices',
        destination: '/legal/notice-of-privacy-practices',
        permanent: true,
      },
      {
        // A 6 -> 5 MERGE, not a rename: the live site publishes Accessibility
        // Statement and Notice of Nondiscrimination as two pages, the rebuild
        // as one. The merged draft carries the non-discrimination content
        // (markdown/legal-drafts/accessibility-statement.md, "## Non-Discrimination",
        // "### Discrimination concerns", "## Language Assistance"), and
        // CLAUDE.md § Compliance Profile records Section 1557 and §504 as not
        // applying to TNCLD, so no standalone federal notice is displaced.
        source: '/legal/notice-of-nondiscrimination',
        destination: '/legal/accessibility',
        permanent: true,
      },

      // --- Temporary: the page is owed, it just is not built yet. ---------
      // #137 (/about/tour-our-office, /about/training-center) and #127
      // (/services/sedation-dentistry) own the real pages. Sending these to the
      // parent index keeps cutover free of hard 404s without teaching a crawler
      // that the URL is gone — DELETE each entry as its page lands, or the real
      // route will be shadowed (redirects are checked BEFORE the filesystem).
      {
        source: '/about/tour-our-office',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/training-center',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/services/sedation-dentistry',
        destination: '/services',
        permanent: false,
      },
    ];
  },
  async headers() {
    const baseHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ];

    // Block crawlers unless this is production AND indexing is explicitly
    // switched on. NEXT_PUBLIC_ENV is a per-site Netlify env var (production
    // site=production, staging site=staging — see netlify.toml, two-site model
    // tncld#44); NEXT_PUBLIC_ALLOW_INDEXING gates the production deploy too, so
    // the site stays noindexed until launch. Netlify's
    // per-context [[headers]] blocks are silently ignored, so this is set from
    // Next.js where env is reliable. Keep in sync with src/app/robots.ts.
    const indexingAllowed =
      process.env.NEXT_PUBLIC_ENV === 'production' &&
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
    if (!indexingAllowed) {
      baseHeaders.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
    }

    return [{ source: '/:path*', headers: baseHeaders }];
  },
};

export default nextConfig;
