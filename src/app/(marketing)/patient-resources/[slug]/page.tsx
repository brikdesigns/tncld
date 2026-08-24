import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourcePage } from '@/components/content/ResourcePage';
import { getResourcePage, getResourceSlugs } from '@/lib/content';

/** The hub itself is served by ../page.tsx, not this dynamic child route. */
const HUB_SLUG = 'patient-resources';

// Only the migrated resource slugs exist; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return getResourceSlugs()
    .filter((slug) => slug !== HUB_SLUG)
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getResourcePage(slug);
  if (!page) return {};
  return { title: page.title, description: page.lede };
}

/**
 * Patient-resource child pages (tncld#60): new-patients, membership-plan,
 * payments-and-insurance, faqs. Content migrated from the Notion "TNCLD
 * Website" DB (tncld#56), rendered through the shared patient-resource template.
 */
export default async function PatientResourceChildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === HUB_SLUG) notFound();
  const page = getResourcePage(slug);
  if (!page) notFound();
  return <ResourcePage page={page} />;
}
