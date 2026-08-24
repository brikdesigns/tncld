import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';
import { getServicesContent, getServiceList } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Dental services at Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
};

/**
 * Services page — maps the migrated `services` content onto the shared
 * ContentPage template (tncld#59). Each service links to its detail route
 * (tncld#61). Copy is the real TNCLD content migrated from the Notion
 * "TNCLD Website" DB (tncld#56); rich per-service detail bodies are tncld#68.
 */
export default function ServicesPage() {
  const services = getServicesContent();
  const sections = getServiceList().map((service) => ({
    title: service.title,
    description: service.description,
    href: `/services/${service.slug}`,
  }));
  return (
    <ContentPage
      title={services.hero.title}
      lede={services.hero.description}
      image={services.images.image1}
      imageAlt="Dental care at Tennessee Center for Laser Dentistry"
      sections={sections}
    />
  );
}
