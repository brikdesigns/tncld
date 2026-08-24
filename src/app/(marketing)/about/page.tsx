import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';
import { getAboutContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Meet the team at Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
};

/**
 * About page — maps the migrated `about` content onto the shared ContentPage
 * template (tncld#59). Topic bodies are still placeholder in the source
 * (tncld#56); the template renders them as-is.
 */
export default function AboutPage() {
  const about = getAboutContent();
  return (
    <ContentPage
      title={about.title}
      lede={about.description}
      image={about.images.image1}
      imageAlt="The Tennessee Center for Laser Dentistry team"
      sections={about.topics}
    />
  );
}
