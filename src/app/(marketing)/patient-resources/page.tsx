import type { Metadata } from 'next';
import { getSectionPage } from '@/lib/content';
import { PageSections } from '@/components/sections/PageSections';

export const metadata: Metadata = {
  title: 'Patient Resources',
  description:
    'New patient information, payment & insurance, the membership plan, and FAQs for Tennessee Center for Laser Dentistry.',
};

/**
 * Patient Resources hub (tncld#92). Composed from
 * `dental.sectionPages.patient-resources`: an interior hero, the three-card
 * resource grid, the Office & Experience split, and the large closing CTA. The
 * child resource pages (new-patients, membership-plan, payments-and-insurance,
 * faqs) still render through the ResourcePage template at ./[slug].
 */
export default function PatientResourcesHubPage() {
  const page = getSectionPage('patient-resources');
  return <PageSections sections={page.sections} images={page.images} />;
}
