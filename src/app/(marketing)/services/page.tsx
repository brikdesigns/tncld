import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';
import { getServicesContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Dental services at Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
};

/**
 * Services page — maps the migrated `services` content onto the shared
 * ContentPage template (tncld#59). Service descriptions are still placeholder
 * in the source (tncld#56); the template renders them as-is.
 */
export default function ServicesPage() {
  const services = getServicesContent();
  return (
    <ContentPage
      title={services.hero.title}
      lede={services.hero.description}
      image={services.images.image1}
      imageAlt="Dental care at Tennessee Center for Laser Dentistry"
      sections={services.serviceList}
    />
  );
}
