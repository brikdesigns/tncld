import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourcePage } from '@/components/content/ResourcePage';
import { getResourcePage, getResourceSlugs } from '@/lib/content';

/**
 * `pages` keys that are NOT patient-resource children (tncld#92). The hub is
 * served by ../page.tsx; the other three have their own routes under /about and
 * render through PageSections now, so their flat `pages` entries would
 * otherwise generate a second, stale copy of each at
 * /patient-resources/<slug>. The original nests only the four below here.
 */
const NOT_CHILDREN = new Set([
  'patient-resources',
  'meet-the-doctors',
  'technology',
  'why-laser-dentistry',
]);

// Only the migrated resource slugs exist; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return getResourceSlugs()
    .filter((slug) => !NOT_CHILDREN.has(slug))
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
  if (NOT_CHILDREN.has(slug)) notFound();
  const page = getResourcePage(slug);
  if (!page) notFound();
  return <ResourcePage page={page} />;
}
