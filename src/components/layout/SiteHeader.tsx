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
        <Link href="/" className="site-header__brand">
          {PRACTICE_NAME}
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
