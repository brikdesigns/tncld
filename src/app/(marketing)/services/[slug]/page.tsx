import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/content/ContentPage';
import { getServiceList, getServiceBySlug } from '@/lib/content';

// Only the known service slugs exist; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return getServiceList().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.description,
  };
}

/**
 * Service detail (tncld#61) — one dynamic route per service in the migrated
 * `services.serviceList`, rendered through the shared ContentPage template.
 * Descriptions are still placeholder in the source (tncld#56); the template
 * renders them as-is.
 */
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();
  return <ContentPage title={service.title} lede={service.description} />;
}
