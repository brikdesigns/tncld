import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import './marketing.css';

/**
 * Shell for every non-legal marketing page (home, content, patient-resource,
 * CMS detail, contact). Provides the global header + footer, a keyboard skip
 * link, and the real <main> landmark. The route group `(marketing)` adds no
 * URL segment, so pages keep their top-level paths. Legal keeps its own
 * minimal shell (src/app/legal/layout.tsx).
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="marketing-skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
