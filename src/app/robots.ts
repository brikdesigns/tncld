import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Noindex until launch. Allow crawling only on production with indexing
  // explicitly switched on. Keep in sync with the X-Robots-Tag gate in
  // next.config.mjs.
  const indexingAllowed =
    process.env.NEXT_PUBLIC_ENV === 'production' &&
    process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';

  if (!indexingAllowed) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
  };
}
