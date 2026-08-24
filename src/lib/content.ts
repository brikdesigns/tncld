import cmsData from '../../json/cms-data.json';

/**
 * Typed reader over the migrated Webflow content (`json/cms-data.json`). The
 * file is industry-scoped (dental / finance / real-estate / small-business);
 * TNCLD is the `dental` industry. This is the file-based content source for the
 * rebuild — the eventual swap to Supabase is tracked in tncld#55.
 *
 * Some descriptions in the source are still placeholder copy; completing that
 * migration is tncld#56. Templates render whatever the source holds and never
 * hardcode copy, so real content flows in as #56 lands with no template change.
 */
export interface HeroContent {
  title: string;
  description: string;
}

export interface ServiceItem {
  title: string;
  description: string;
}

export interface HomeContent {
  hero: HeroContent;
  images: Record<string, string>;
  cta: HeroContent;
}

export interface ServicesContent {
  hero: HeroContent;
  images: Record<string, string>;
  serviceList: ServiceItem[];
}

export interface AboutContent {
  title: string;
  description: string;
  images: Record<string, string>;
  topics: ServiceItem[];
}

/** The TNCLD industry key within the shared demo content file. */
const INDUSTRY = 'dental';

interface IndustryContent {
  slug: string;
  name: string;
  home: HomeContent;
  about: AboutContent;
  services: ServicesContent;
}

function industry(): IndustryContent {
  return (cmsData as Record<string, IndustryContent>)[INDUSTRY];
}

export function getHomeContent(): HomeContent {
  return industry().home;
}

export function getServicesContent(): ServicesContent {
  return industry().services;
}

export function getAboutContent(): AboutContent {
  return industry().about;
}

/** URL-safe slug for a service title, e.g. "Cleaning Exam" → "cleaning-exam". */
export function serviceSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Every service, tagged with its route slug — used by the detail routes. */
export function getServiceList(): (ServiceItem & { slug: string })[] {
  return getServicesContent().serviceList.map((service) => ({
    ...service,
    slug: serviceSlug(service.title),
  }));
}

/** A single service by slug, or null if no service maps to it. */
export function getServiceBySlug(slug: string): ServiceItem | null {
  return (
    getServicesContent().serviceList.find(
      (service) => serviceSlug(service.title) === slug,
    ) ?? null
  );
}
