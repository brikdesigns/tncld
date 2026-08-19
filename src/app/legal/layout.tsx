import Link from 'next/link';
import { LEGAL_PAGES } from '@/lib/legal';
import './legal.css';

/**
 * Shell for every /legal/* page. The accessibility behavior the legacy
 * footer.js patched in at runtime (initAccessibility → addMainLandmark, a
 * missing skip target, unlabelled links) is expressed here as native semantic
 * markup instead: a real <main> landmark, a keyboard skip link, and a
 * text-labelled footer nav. No runtime a11y JS.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="legal-skip-link">
        Skip to main content
      </a>
      <header className="legal-header">
        <Link href="/" className="legal-home-link">
          Tennessee Center for Laser Dentistry
        </Link>
      </header>
      <main id="main-content" className="legal-main">
        {children}
      </main>
      <footer className="legal-footer">
        <nav aria-label="Legal pages">
          <ul>
            {LEGAL_PAGES.map((page) => (
              <li key={page.slug}>
                <Link href={`/legal/${page.slug}`}>{page.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </>
  );
}
