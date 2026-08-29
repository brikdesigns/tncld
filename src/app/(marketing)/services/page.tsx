import type { Metadata } from 'next';
import { getSectionPage } from '@/lib/content';
import { PageSections } from '@/components/sections/PageSections';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Dental services at Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
};

/**
 * Services (tncld#92). Composed from `dental.sectionPages.services` through the
 * shared PageSections templates, the same pattern /about follows: an interior
 * hero, one split per service, and the large closing CTA. It rendered as a flat
 * `title + lede + text sections` ContentPage before, which dropped the hero,
 * every service photo, both per-service buttons and the closing CTA. Copy is
 * the live original's, read from the Webflow Data API.
 */
export default function ServicesPage() {
  const page = getSectionPage('services');
  return <PageSections sections={page.sections} images={page.images} />;
}
