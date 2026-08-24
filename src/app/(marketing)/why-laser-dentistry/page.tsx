import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourcePage } from '@/components/content/ResourcePage';
import { getResourcePage } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Why "Laser Dentistry" Is Our Standard',
  description:
    'Why laser dentistry is part of our name — a modern philosophy of care built on comfort and precision at Tennessee Center for Laser Dentistry.',
};

/**
 * "Why laser dentistry is our standard" (tncld#72) — the practice's philosophy
 * page, its copy migrated from the Notion "TNCLD Website" DB (tncld#56) and
 * rendered through the shared resource template.
 */
export default function WhyLaserDentistryPage() {
  const page = getResourcePage('why-laser-dentistry');
  if (!page) notFound();
  return <ResourcePage page={page} />;
}
