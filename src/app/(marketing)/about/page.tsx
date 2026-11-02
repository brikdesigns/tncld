import type { Metadata } from 'next';
import { getAboutContent } from '@/lib/content';
import { PageSections } from '@/components/sections/PageSections';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Meet the team at Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
};

/**
 * About page (tncld#89). Composed from `dental.about.sections` through the
 * shared PageSections templates so its IA mirrors the original Webflow /about —
 * interior hero, team / office / technology split teasers, and a closing CTA.
 * This is the reusable pattern the other interior pages follow. Copy is the
 * real TNCLD content migrated from the live original (tncld#56).
 */
export default function AboutPage() {
  const about = getAboutContent();
  return <PageSections sections={about.sections} images={about.images} />;
}
