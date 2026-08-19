import { readFileSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { sanitizeHtml } from './sanitize';
import { HIPAA_PRIVACY_OFFICER, ACCESSIBILITY_COORDINATOR } from './compliance';

/**
 * The five TNCLD legal pages. Content is sourced verbatim from the drafts in
 * markdown/legal-drafts/ (per tncld#13 — the rebuild reuses the drafts, it does
 * not re-author them). Slugs preserve the legacy Webflow /legal/* URLs so the
 * cross-links inside the drafts (/legal/privacy, /legal/accessibility, …)
 * resolve unchanged.
 */
export interface LegalPageMeta {
  slug: string;
  file: string;
  title: string;
  description: string;
}

export const LEGAL_PAGES: LegalPageMeta[] = [
  {
    slug: 'privacy',
    file: 'privacy-policy.md',
    title: 'Privacy Policy',
    description:
      'How Tennessee Center for Laser Dentistry collects, uses, and protects information collected through tncld.com.',
  },
  {
    slug: 'notice-of-privacy-practices',
    file: 'notice-of-privacy-practices.md',
    title: 'Notice of Privacy Practices',
    description:
      'How TNCLD may use and disclose your protected health information (PHI) under HIPAA, and your rights over that information.',
  },
  {
    slug: 'accessibility',
    file: 'accessibility-statement.md',
    title: 'Accessibility & Non-Discrimination Statement',
    description:
      'TNCLD’s commitment to WCAG 2.1 AA, ADA Title III effective communication, auxiliary aids, and non-discrimination.',
  },
  {
    slug: 'terms',
    file: 'terms-and-conditions.md',
    title: 'Terms and Conditions',
    description:
      'The terms governing your use of the Tennessee Center for Laser Dentistry website.',
  },
  {
    slug: 'disclaimer',
    file: 'website-disclaimer.md',
    title: 'Website Disclaimer',
    description:
      'Informational-use disclaimer for the Tennessee Center for Laser Dentistry website.',
  },
];

const DRAFTS_DIR = path.join(process.cwd(), 'markdown', 'legal-drafts');

/**
 * Read a legal draft, substitute the named-officer compliance tokens, convert
 * markdown → HTML, and sanitize for the BDS `Prose` Block.
 *
 * `breaks: true` preserves the soft line breaks the drafts rely on (address
 * blocks, the Last Updated / Effective Date header) as <br> rather than
 * collapsing them into one run-on paragraph.
 */
export function getLegalPage(
  slug: string,
): { meta: LegalPageMeta; html: string } | null {
  const meta = LEGAL_PAGES.find((p) => p.slug === slug);
  if (!meta) return null;

  const raw = readFileSync(path.join(DRAFTS_DIR, meta.file), 'utf8');
  const substituted = raw
    .replaceAll('{{HIPAA_PRIVACY_OFFICER}}', HIPAA_PRIVACY_OFFICER)
    .replaceAll('{{ACCESSIBILITY_COORDINATOR}}', ACCESSIBILITY_COORDINATOR);

  const rendered = marked.parse(substituted, {
    async: false,
    breaks: true,
    gfm: true,
  });
  return { meta, html: sanitizeHtml(rendered) };
}
