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

/**
 * Page intro. Two shapes in the original, told apart by `image`:
 * with one it is the homepage's full-bleed media hero; without one it is the
 * interior `2-column-hero-split` — title, rule, then an eyebrow column beside
 * the body. `image` is a key into the page's `images` map.
 */
export interface HeroSection {
  type: 'hero';
  title: string;
  body: string;
  image?: string;
  /**
   * Mux playback id for the homepage hero's background video (tncld#97). The
   * original runs it `autoplay muted loop` behind the copy; `image` stays set
   * and is the poster, so a reduced-motion visitor still gets the original's
   * framing rather than an empty box.
   */
  videoPlaybackId?: string;
  /** Interior hero only — the label beside the body column. */
  eyebrow?: string;
  /** Path under /public — the glyph the original sets before the eyebrow. */
  eyebrowIcon?: string;
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
  /**
   * The interior pages set two buttons in one wrapper — /services runs
   * "Get Started" beside "Learn More" on all six splits, /patient-resources
   * "Tour Our Office" beside "Meet the Doctors" (tncld#92). `action` stays for
   * the single-button case the home and /about use; the renderer reads
   * whichever is present.
   */
  actions?: SectionAction[];
  /**
   * Media frame. `wide` is the original's 1368x770 16:9 band (home, /about,
   * /about/technology). `square` is /services' `img-frame-1-1` — a 547x547
   * image right-aligned in a full-bleed row, measured on the export.
   */
  imageFrame?: 'wide' | 'square';
}

/** One card in a `cards` grid. */
export interface CardItem {
  title: string;
  body?: string;
  /** Path under /public — the square glyph of `3-column-card`. */
  icon?: string;
  /** Key into the page's `images` map — the photo of the img-card variants. */
  image?: string;
  /**
   * The brand numeral the `3-column-card` variant sets above the title
   * (`text_display-md brand`), e.g. "01". The original writes it as content,
   * not as a generated counter, so it is carried rather than derived.
   */
  numeral?: string;
  action?: SectionAction;
  /**
   * Full biography, shown in a dialog the card's action opens — the original's
   * `modal-1..3` on /about/meet-the-doctors. An array because each bio is
   * several paragraphs.
   */
  bio?: { title: string; paragraphs: string[] };
}

/**
 * Three-across card grid — Webflow `3-column-card`, `3-column-card-img-portrait`
 * and `3-column-card-img-landscape`, which differ only in what sits above the
 * card title (tncld#92). Measured on the export: 381x400 cards, 20px gutter,
 * `--surface-secondary` fill, 40px radius.
 */
export interface CardsSection {
  type: 'cards';
  title: string;
  body?: string;
  /**
   * Card media shape. `icon` is the 133x133 glyph (/patient-resources),
   * `numeral` the brand numeral (/about/why-laser-dentistry), `portrait` the
   * 333x500 doctor headshot, `landscape` the 333x222 thumbnail (Related Pages).
   */
  variant?: 'icon' | 'numeral' | 'portrait' | 'landscape';
  items: CardItem[];
}

/**
 * Four-across value grid — Webflow `4-column-card-center`. Title only, above a
 * brand glyph; 308x160 cards at a 16px gutter. The original renders the glyph
 * from a Font Awesome ligature with no accessible name, so the rebuild draws it
 * as a decorative mark rather than reproducing an unlabelled icon font.
 */
export interface ValuesSection {
  type: 'values';
  title: string;
  items: { title: string }[];
}

/**
 * The practice's reviews band — Webflow `3-column-testimonial`, which is a
 * heading above a third-party review widget rather than testimonial cards
 * (tncld#92). The export carries an Elfsight embed; the live site serves the
 * LeadConnector/GHL widget this points at, which is also what
 * scripts/test-review-widget-width.js asserts against tncld.com.
 */
export interface ReviewsEmbedSection {
  type: 'reviewsEmbed';
  title: string;
  body?: string;
  /** The widget iframe's src — the live embed, read from the component DOM. */
  widgetSrc: string;
  /** The vendor loader the widget needs to size its iframe. */
  scriptSrc: string;
}

/**
 * Two-column copy-plus-list band — Webflow `2-column-card-list-right`. Copy on
 * the left, a stack of numbered cards on the right (600x112, 6px radius, 16px
 * gutter). Each card leads with a bolded clause, exactly as the original sets
 * it ("**Comfort matters**. Modern dentistry should feel gentle…").
 */
export interface PrinciplesSection {
  type: 'principles';
  title: string;
  body?: string;
  items: { lead: string; body: string }[];
}

export interface StepItem {
  /** Carries the original's own numbering, e.g. "1. Request an Appointment". */
  label: string;
  body: string;
  /** Path under /public — the original gives each step a line-art glyph. */
  icon?: string;
}

/** Numbered "how it works" process. */
export interface StepsSection {
  type: 'steps';
  title: string;
  steps: StepItem[];
  action?: SectionAction;
}

export interface TabItem {
  title: string;
  /** The one-liner under the title *in the tab control*, not in the panel. */
  summary: string;
  /**
   * The open panel's copy. The original sets it as two centred lines, so this
   * is an array rather than one string with a `<br>` baked into it.
   */
  body: string[];
  /** Path under /public — the original gives each treatment a square photo. */
  image?: string;
  /** The panel's own link, e.g. Learn More → /services/invisalign. */
  action?: SectionAction;
}

/**
 * Treatments as a tab strip — the original's `2-column-tabbed-stacked`
 * (tncld#97). This was a static card grid under #13's superseded no-pixel-parity
 * charter, which flattened the tab control, the per-tab summary and the panel
 * copy into one card body. Reproducing the interaction needs all three back.
 */
export interface TabsSection {
  type: 'tabs';
  title: string;
  body?: string;
  /** The section-level link the original sets beside the intro. */
  action?: SectionAction;
  items: TabItem[];
  /**
   * Which tab opens on load. The original ships `data-current="Tab 3"` — the
   * third treatment, not the first — so this is faithful, not a default.
   */
  defaultIndex?: number;
}

export interface StoryItem {
  title: string;
  body: string;
  /**
   * Mux playback id (tncld#97). Drives both the card's animated poster and the
   * modal player, exactly as the original's `modal-1..3` do. Absent means a
   * text-only card, which is what every story rendered as before #97.
   */
  playbackId?: string;
  /** The card's button label — the original repeats it per card. */
  videoLabel?: string;
}

/** Patient-stories band. */
export interface TestimonialsSection {
  type: 'testimonials';
  title: string;
  body?: string;
  stories: StoryItem[];
}

/** Payment / insurance options. */
export interface PaymentMethod {
  label: string;
  /** Path under /public — card/cash/check glyph or a financing partner mark. */
  icon?: string;
}

export interface PaymentsSection {
  type: 'payments';
  title: string;
  body: string;
  /** Was `string[]`; the original pairs every method with a glyph. */
  methods: PaymentMethod[];
}

/**
 * Closing call to action. Three shapes in the original, and they are different
 * components, not one component scaled: `1-column-cta-right-img` is the
 * home's photo-with-a-floating-card (`split`), `1-column-cta` the compact 463px
 * centred band (`center`), and `1-column-cta-center-lg` the 1000px closing band
 * every interior page ends on, whose heading measures 72.8px (`center-lg`).
 */
export interface CtaSection {
  type: 'cta';
  variant?: 'split' | 'center' | 'center-lg';
  title: string;
  body: string;
  image?: string;
  action?: SectionAction;
}

/**
 * Scroll-reveal membership (tncld#96). The original wraps several of its
 * content blocks in one revealed container each, so the reveal unit is a *run*
 * of rebuild sections, not a single section — e.g. the New Patients split and
 * the "Your Path to a Healthier Smile" steps share one wrapper and therefore
 * fade in together. `start` opens a run, `join` extends the run above it, and
 * an absent value means the section is not revealed at all (the hero, the
 * treatments tabs, payments and both CTAs are not, in the original).
 *
 * The mapping from original wrapper to rebuild sections is recorded in
 * markdown/section-maps/home.md § Scroll choreography.
 */
export interface SectionMotion {
  reveal?: 'start' | 'join';
}

export type HomeSection = (
  | HeroSection
  | ReviewsSection
  | SplitSection
  | StepsSection
  | TabsSection
  | TestimonialsSection
  | PaymentsSection
  | CardsSection
  | ValuesSection
  | ReviewsEmbedSection
  | PrinciplesSection
  | CtaSection
) &
  SectionMotion;

export interface HomeContent {
  images: Record<string, string>;
  sections: HomeSection[];
}

export interface ServicesContent {
  hero: HeroContent;
  images: Record<string, string>;
  serviceList: ServiceItem[];
}

/**
 * About page (tncld#89). Like the home, `about` is an ordered list of typed
 * marketing sections mirroring the original Webflow /about IA — an interior
 * hero, "Meet Our Team" / "Tour Our Office" / "Technologies" split teasers, and
 * a closing CTA — rendered by the shared PageSections templates. This is the
 * reusable pattern for the remaining interior pages (services, technology,
 * meet-the-doctors, patient-resources, why-laser-dentistry).
 */
export interface AboutContent {
  images: Record<string, string>;
  sections: HomeSection[];
}

/**
 * The five remaining interior pages (tncld#92), keyed by route: `services`,
 * `technology`, `meet-the-doctors`, `patient-resources`,
 * `why-laser-dentistry`. Same `{ images, sections[] }` shape /about uses, so
 * they render through the identical PageSections templates and the model, not
 * the page component, owns each page's IA.
 */
export type SectionPageContent = AboutContent;

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
  sectionPages?: Record<string, SectionPageContent>;
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

/**
 * One of the five section-structured interior pages by key (tncld#92). Throws
 * rather than returning null: unlike a CMS slug these five are a fixed set the
 * routes name literally, so a miss is a content-file defect that should fail
 * the build, not 404 in front of a visitor. scripts/check-content.mjs asserts
 * the same set.
 */
export function getSectionPage(key: string): SectionPageContent {
  const page = industry().sectionPages?.[key];
  if (!page) {
    throw new Error(
      `content: no sectionPages entry for "${key}" in json/cms-data.json (dental.sectionPages)`,
    );
  }
  return page;
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
