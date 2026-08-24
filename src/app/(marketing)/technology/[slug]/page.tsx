import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourcePage } from '@/components/content/ResourcePage';
import { getTechnologyDetail, getTechnologyDetailSlugs } from '@/lib/content';

// Only the known technology slugs exist; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return getTechnologyDetailSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getTechnologyDetail(slug);
  if (!page) return {};
  return { title: page.title, description: page.lede };
}

/**
 * Technology detail (tncld#68) — one dynamic route per technology, its
 * section-structured copy migrated from the Notion "TNCLD Website" DB
 * (tncld#56) and rendered through the shared resource template. The
 * `/technology` hub is tncld#72.
 */
export default async function TechnologyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getTechnologyDetail(slug);
  if (!page) notFound();
  return <ResourcePage page={page} />;
}
