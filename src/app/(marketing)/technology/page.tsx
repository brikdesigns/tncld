import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourcePage } from '@/components/content/ResourcePage';
import { getResourcePage } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Technology',
  description:
    'Digital imaging, laser dentistry, oral cancer detection, and same-day CEREC crowns at Tennessee Center for Laser Dentistry.',
};

/**
 * Technology hub (tncld#72) — the overview of the practice's technology, its
 * copy migrated from the Notion "TNCLD Website" DB (tncld#56) and rendered
 * through the shared resource template. The per-technology detail pages are
 * tncld#68.
 */
export default function TechnologyPage() {
  const page = getResourcePage('technology');
  if (!page) notFound();
  return <ResourcePage page={page} />;
}
