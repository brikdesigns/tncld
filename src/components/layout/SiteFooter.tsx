import Image from 'next/image';
import Link from 'next/link';
import { LEGAL_PAGES } from '@/lib/legal';
import { PRIMARY_NAV, APPOINTMENT_CTA, PRACTICE_NAME } from './site-nav';
import './site-footer.css';

/**
 * Global marketing footer: brand line, an Explore column mirroring the primary
 * nav, and the Legal column driven by the same LEGAL_PAGES source the legal
 * shell uses. Native semantic markup — a <footer> contentinfo landmark and
 * text-labelled <nav>s — no runtime a11y JS. Contact details point at /contact
 * rather than hardcoding a phone/address here (real practice details land with
 * the contact template, tncld#62).
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          {/* Matches the original's footer, which repeats the header lockup
              (tncld#94). Decorative here: PRACTICE_NAME already names the
              practice in the copyright line below, so alt is empty rather than
              announcing the same words twice. */}
          <Image
            className="site-footer__brand-mark"
            src="/images/tncld-logo.svg"
            alt=""
            width={204}
            height={62}
          />
          <Link href={APPOINTMENT_CTA.href} className="site-footer__cta-link">
            {APPOINTMENT_CTA.label}
          </Link>
        </div>

        <nav className="site-footer__col" aria-label="Explore">
          <h2 className="site-footer__heading">Explore</h2>
          <ul>
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="site-footer__col" aria-label="Legal">
          <h2 className="site-footer__heading">Legal</h2>
          <ul>
            {LEGAL_PAGES.map((page) => (
              <li key={page.slug}>
                <Link href={`/legal/${page.slug}`}>{page.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="site-footer__copyright">
        &copy; {PRACTICE_NAME}. All rights reserved.
      </p>
    </footer>
  );
}
