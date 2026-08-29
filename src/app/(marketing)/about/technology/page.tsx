import type { Metadata } from 'next';
import { getSectionPage } from '@/lib/content';
import { PageSections } from '@/components/sections/PageSections';

export const metadata: Metadata = {
  title: 'Technology',
  description:
    'Digital imaging, laser dentistry, oral cancer detection, and same-day CEREC crowns at Tennessee Center for Laser Dentistry.',
};

/**
 * Technology hub (tncld#92), at `/about/technology` because that is where the
 * original serves it — the Webflow page sits under the `about` folder
 * (parentId 697648d22cb71ab803455a08). The per-technology detail pages are
 * top-level (`/technology/<slug>`) in the original and stay there.
 *
 * Composed from `dental.sectionPages.technology`: an interior hero, one split
 * per technology, the practice's reviews band, and the large closing CTA.
 */
export default function TechnologyPage() {
  const page = getSectionPage('technology');
  return <PageSections sections={page.sections} images={page.images} />;
}
