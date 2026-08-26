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
