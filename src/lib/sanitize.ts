import sanitize from 'sanitize-html';

/**
 * Server-side HTML sanitization for the legal-page prose. The markdown drafts
 * in markdown/legal-drafts/ are first-party and trusted, but the BDS `Prose`
 * Block is a presentation-only primitive that does NOT sanitize — its contract
 * requires the caller to sanitize before passing `html`. This is that pass, run
 * in the Server Component at build time (no client bundle cost).
 *
 * Uses `sanitize-html` (htmlparser2, no DOM library) to match brikdesigns'
 * `src/lib/sanitize.ts` — DOMPurify needs jsdom, which throws ERR_REQUIRE_ESM
 * inside Netlify functions (brikdesigns#809). The allowlist covers exactly the
 * tags `marked` emits from these drafts (headings, lists, blockquotes, links,
 * emphasis, rules, line breaks).
 */
const ALLOWED_TAGS = [
  'p', 'div', 'blockquote', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'span', 'br',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'code', 'sup', 'sub', 'abbr',
];

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return sanitize(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'rel'],
    },
    // Force external links to open safely; leaves in-site links untouched.
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? '';
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: isExternal
            ? { ...attribs, rel: 'noopener noreferrer' }
            : attribs,
        };
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  });
}
