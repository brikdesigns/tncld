import type { Metadata } from 'next';
import { getSectionPage } from '@/lib/content';
import { PageSections } from '@/components/sections/PageSections';

export const metadata: Metadata = {
  title: 'Why "Laser Dentistry" Is Our Standard',
  description:
    'Why laser dentistry is part of our name — a modern philosophy of care built on comfort and precision at Tennessee Center for Laser Dentistry.',
};

/**
 * "Why Laser Dentistry Is Our Standard" (tncld#92), at
 * `/about/why-laser-dentistry` — the original's own URL, under the Webflow
 * `about` folder.
 *
 * Six content bands, one of which is not in the checked-in export at all: the
 * live page carries a "Beyond Traditional Procedures" CTA between the split and
 * the closing band. That is export drift, and the live Data API is the spec
 * where the two disagree (markdown/fidelity-method.md § Step 1).
 */
export default function WhyLaserDentistryPage() {
  const page = getSectionPage('why-laser-dentistry');
  return <PageSections sections={page.sections} images={page.images} />;
}
