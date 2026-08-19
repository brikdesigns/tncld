import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Prose } from '@brikdesigns/bds';
import { LEGAL_PAGES, getLegalPage } from '@/lib/legal';

// Only the five known legal slugs exist; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) return {};
  return {
    title: page.meta.title,
    description: page.meta.description,
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();
  return <Prose html={page.html} />;
}
