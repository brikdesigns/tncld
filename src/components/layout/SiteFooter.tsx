import Image from 'next/image';
import Link from 'next/link';
import { LEGAL_PAGES } from '@/lib/legal';
import { getFooterContent } from '@/lib/content';
import { APPOINTMENT_CTA, PRACTICE_NAME } from './site-nav';
import './site-footer.css';

/**
 * Global marketing footer, rebuilt against the original's own `.nav_footer`
 * (tncld#129). It previously carried an "Explore" column mirroring the primary
 * nav and a "Legal" column, which was neither what the original renders nor
 * enough of it: the original has a brand blurb, three link groups — About,
 * Services, Patient Resources — and the practice's opening hours, and the
 * hours appeared nowhere in the rebuild at all.
 *
 * That mattered for more than parity. The four groups sit in a 2x2 grid at
 * 1440 and stack full-width below it, so the original's footer runs 540 /
 * 835 / 1473 / 1559px at 1440 / 991 / 767 / 479 while the two-column version
 * held 518 / 518 / 738 / 854. The footer falls inside the last band on every
 * route by construction, which is what made that band measure 56% at 767.
 *
 * Content comes from `dental.footer` via getFooterContent() — no copy is
 * hardcoded here, and the hours are the export's own, not invented.
 *
 * Native semantic markup: a <footer> contentinfo landmark and text-labelled
 * <nav>s, no runtime a11y JS. Hours are a <dl>, not a <nav>, because they are
 * name/value content rather than navigation.
 */
export function SiteFooter() {
  const { blurb, groups, hours } = getFooterContent();

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
          <p className="site-footer__blurb">{blurb}</p>
          <Link href={APPOINTMENT_CTA.href} className="site-footer__cta-link">
            {APPOINTMENT_CTA.label}
          </Link>
        </div>

        <div className="site-footer__cols">
          {groups.map((group) => (
            <nav className="site-footer__col" key={group.title} aria-label={group.title}>
              <h2 className="site-footer__heading">
                <Link href={group.href}>{group.title}</Link>
              </h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* A description list, not a nav — these are name/value pairs. The
              original renders the same seven rows as plain divs. */}
          <div className="site-footer__col site-footer__hours">
            <h2 className="site-footer__heading">{hours.title}</h2>
            <dl>
              {hours.days.map((row) => (
                <div className="site-footer__hours-row" key={row.day}>
                  <dt>{row.day}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* The original's bottom bar: copyright, its three legal links, and the
          build credit. The rebuild carries five legal links rather than three —
          the Notice of Privacy Practices and the Accessibility &
          Non-Discrimination Statement are required by this site's Compliance
          Profile (HIPAA 45 CFR § 164.520, ADA Title III) and the original
          predates them, so this is an addition on purpose, not drift. */}
      <div className="site-footer__bar">
        <p className="site-footer__copyright">
          &copy; {PRACTICE_NAME}. All rights reserved.
        </p>
        <nav className="site-footer__legal" aria-label="Legal">
          <ul>
            {LEGAL_PAGES.map((page) => (
              <li key={page.slug}>
                <Link href={`/legal/${page.slug}`}>{page.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
