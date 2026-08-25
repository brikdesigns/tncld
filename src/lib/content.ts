import { marked } from 'marked';
import cmsData from '../../json/cms-data.json';
import { sanitizeHtml } from './sanitize';

/**
 * Typed reader over the migrated Webflow content (`json/cms-data.json`). The
 * file is industry-scoped (dental / finance / real-estate / small-business);
 * TNCLD is the `dental` industry. This is the file-based content source for the
 * rebuild — the eventual swap to Supabase is tracked in tncld#55.
 *
 * The home/about/services copy is the real TNCLD content migrated from the
 * Notion "TNCLD Website" DB (tncld#56). Templates render whatever the source
 * holds and never hardcode copy, so further pages flow in with no template
 * change as their templates land (patient-resource tncld#60, detail tncld#68).
 */
export interface HeroContent {
  title: string;
  description: string;
}

export interface ServiceItem {
  title: string;
  description: string;
}

/**
 * Home page sections (tncld#89). The home is an ordered list of typed sections
 * that mirror the section set of the original Webflow homepage — a hero,
 * social-proof reviews, feature "split" teasers, a numbered process, a
 * treatments showcase, patient stories, payment options, and closing CTAs.
 * The section templates in src/components/sections render whatever the source
 * holds and never hardcode copy, so the model, not the template, owns the IA.
 */
export interface SectionAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

/** Full-width intro. `image` is a key into HomeContent.images. */
export interface HeroSection {
  type: 'hero';
  title: string;
  body: string;
  image?: string;
  actions?: SectionAction[];
}

/** Social-proof band — an aggregate review count + star rating. */
export interface ReviewsSection {
  type: 'reviews';
  stat: string;
  rating: number;
  label: string;
  body: string;
}

/** Feature teaser: copy on one side, image on the other. */
export interface SplitSection {
  type: 'split';
  eyebrow?: string;
  title: string;
  body: string;
  image?: string;
  mediaSide?: 'left' | 'right';
  action?: SectionAction;
}

export interface StepItem {
  label: string;
  body: string;
}

/** Numbered "how it works" process. */
export interface StepsSection {
  type: 'steps';
  title: string;
  steps: StepItem[];
  action?: SectionAction;
}

export interface ShowcaseItem {
  title: string;
  body: string;
}

/** A card grid of highlighted treatments / solutions. */
export interface ShowcaseSection {
  type: 'showcase';
  title: string;
  body?: string;
  items: ShowcaseItem[];
}

export interface StoryItem {
  title: string;
  body: string;
}

/** Patient-stories band. */
export interface TestimonialsSection {
  type: 'testimonials';
  title: string;
  body?: string;
  stories: StoryItem[];
}

/** Payment / insurance options. */
export interface PaymentsSection {
  type: 'payments';
  title: string;
  body: string;
  methods: string[];
}

/** Closing call to action, either split-with-image or centered. */
export interface CtaSection {
  type: 'cta';
  variant?: 'split' | 'center';
  title: string;
  body: string;
  image?: string;
  action?: SectionAction;
}

export type HomeSection =
  | HeroSection
  | ReviewsSection
  | SplitSection
  | StepsSection
  | ShowcaseSection
  | TestimonialsSection
  | PaymentsSection
  | CtaSection;

export interface HomeContent {
  images: Record<string, string>;
  sections: HomeSection[];
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

/**
 * Practice contact details for the contact / appointment pages (tncld#62).
 * Every field is optional — the source (`dental.contact`) is empty until real
 * practice details land under tncld#56, and the templates render only the
 * fields that are present rather than fabricating a phone/address.
 */
export interface ContactContent {
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
}

/**
 * A generic content page — the patient-resource set (tncld#60) and any future
 * page whose body is a list of headed sections. Section bodies are markdown so
 * the migrated Notion copy keeps its lists, sub-headings, and emphasis.
 */
export interface PageSection {
  title: string;
  /** Markdown body — rendered to sanitized HTML by getResourcePage(). */
  body: string;
  /** When set, the section title links here. */
  href?: string;
}

export interface PageContent {
  title: string;
  lede: string;
  sections: PageSection[];
}

/** A section whose markdown body has been rendered to sanitized HTML. */
export interface RenderedSection {
  title: string;
  html: string;
  href?: string;
}

export interface RenderedPage {
  title: string;
  lede: string;
  sections: RenderedSection[];
}

/** The TNCLD industry key within the shared demo content file. */
const INDUSTRY = 'dental';

interface IndustryContent {
  slug: string;
  name: string;
  home: HomeContent;
  about: AboutContent;
  services: ServicesContent;
  contact?: ContactContent;
  pages?: Record<string, PageContent>;
  serviceDetails?: Record<string, PageContent>;
  technologyDetails?: Record<string, PageContent>;
}

function industry(): IndustryContent {
  // Boundary cast through `unknown`: the shared cms-data.json is industry-scoped
  // and heterogeneous — only `dental` conforms to IndustryContent's rich shape
  // (the other industries keep the old thin `home`), and a JSON import widens
  // section discriminants (`type`) to `string`, which a direct assertion can't
  // reconcile with the HomeSection union. The data is validated separately by
  // scripts/check-content.mjs and the tncld#89 section map.
  return (cmsData as unknown as Record<string, IndustryContent>)[INDUSTRY];
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

export function getContactContent(): ContactContent {
  return industry().contact ?? {};
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

/**
 * Render a content page's markdown section bodies to sanitized HTML for the BDS
 * `Prose` Block (same pipeline as the legal pages — see src/lib/legal.ts and
 * src/lib/sanitize.ts). Shared by every section-structured page: the generic
 * resource pages, the service detail pages, and the technology detail pages.
 */
function renderPage(page: PageContent): RenderedPage {
  return {
    title: page.title,
    lede: page.lede,
    sections: page.sections.map((section) => ({
      title: section.title,
      href: section.href,
      html: sanitizeHtml(
        marked.parse(section.body, { async: false, breaks: true, gfm: true }),
      ),
    })),
  };
}

function pages(): Record<string, PageContent> {
  return industry().pages ?? {};
}

/** Every generic content page slug — used to statically generate the routes. */
export function getResourceSlugs(): string[] {
  return Object.keys(pages());
}

/**
 * A generic content page by slug, with each section rendered to sanitized HTML.
 * Returns null for an unknown slug so the route can 404.
 */
export function getResourcePage(slug: string): RenderedPage | null {
  const page = pages()[slug];
  return page ? renderPage(page) : null;
}

function serviceDetails(): Record<string, PageContent> {
  return industry().serviceDetails ?? {};
}

function technologyDetails(): Record<string, PageContent> {
  return industry().technologyDetails ?? {};
}

/** Every service-detail slug — used to statically generate `/services/[slug]`. */
export function getServiceDetailSlugs(): string[] {
  return Object.keys(serviceDetails());
}

/** The rich, section-structured detail page for a service (tncld#68). */
export function getServiceDetail(slug: string): RenderedPage | null {
  const page = serviceDetails()[slug];
  return page ? renderPage(page) : null;
}

/** Every technology-detail slug — used to statically generate `/technology/[slug]`. */
export function getTechnologyDetailSlugs(): string[] {
  return Object.keys(technologyDetails());
}

/** The rich, section-structured detail page for a technology (tncld#68). */
export function getTechnologyDetail(slug: string): RenderedPage | null {
  const page = technologyDetails()[slug];
  return page ? renderPage(page) : null;
}
