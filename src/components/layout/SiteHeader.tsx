import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@brikdesigns/bds';
import { PRIMARY_NAV, APPOINTMENT_CTA, PRACTICE_NAME } from './site-nav';
import './site-header.css';

/**
 * Global marketing header: brand home link, primary nav, and the appointment
 * CTA. Native semantic markup only — a real <header> banner landmark and a
 * <nav> with an accessible name — mirroring the legal shell's approach (no
 * runtime a11y JS). The mega-menu behavior in the Figma spec (tncld#39,
 * `top-navigation`) is deferred; a flat accessible nav ships first.
 */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* The client's own mark, as the original header shows it (tncld#94).
            This rendered PRACTICE_NAME as plain text, so the rebuild shipped a
            client marketing site with no client logo. The asset is the export's
            `images/tndlc-logo.svg` — a white-fill lockup, corrected here to the
            practice's actual initials — localised into public/ rather than
            hotlinked. The link is the accessible name, so alt carries it. */}
        <Link href="/" className="site-header__brand">
          <Image
            src="/images/tncld-logo.svg"
            alt={`${PRACTICE_NAME} — home`}
            width={204}
            height={62}
            priority
          />
        </Link>
        <nav className="site-header__nav" aria-label="Primary">
          <ul className="site-header__nav-list">
            {PRIMARY_NAV.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="site-header__nav-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Button href={APPOINTMENT_CTA.href} variant="primary">
          {APPOINTMENT_CTA.label}
        </Button>
      </div>
    </header>
  );
}
