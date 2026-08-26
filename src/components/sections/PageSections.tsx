import type { ComponentProps } from 'react';
import Image from 'next/image';
import { Button } from '@brikdesigns/bds';
import type {
  CtaSection,
  HeroSection,
  HomeSection,
  PaymentsSection,
  ReviewsSection,
  SectionAction,
  SplitSection,
  StepsSection,
  TestimonialsSection,
} from '@/lib/content';
import { HeroVideo } from './HeroVideo';
import { StoryVideo } from './StoryVideo';
import { TreatmentTabs } from './TreatmentTabs';
import './page-sections.css';

/**
 * Section-template renderer for the marketing pages (tncld#89). A page's
 * content model is an ordered list of typed sections; this switches on
 * `section.type` and renders the matching BDS-token template. Templates render
 * only what the source holds — no hardcoded copy — so the model owns the page
 * IA and interior pages can reuse the same section set as their content lands.
 *
 * `images` maps the image keys used by hero/split/cta sections to their URLs
 * (the migrated Webflow CDN assets in `home.images`; localizing them is
 * tracked in tncld#56).
 */
export function PageSections({
  sections,
  images,
}: {
  sections: HomeSection[];
  images: Record<string, string>;
}) {
  return (
    <>
      {sections.map((section, index) => {
        const key = `${section.type}-${index}`;
        switch (section.type) {
          case 'hero':
            return <Hero key={key} section={section} images={images} eager />;
          case 'reviews':
            return <Reviews key={key} section={section} />;
          case 'split':
            return <Split key={key} section={section} images={images} />;
          case 'steps':
            return <Steps key={key} section={section} />;
          case 'tabs':
            return <TreatmentTabs key={key} section={section} />;
          case 'testimonials':
            return <Testimonials key={key} section={section} />;
          case 'payments':
            return <Payments key={key} section={section} />;
          case 'cta':
            return <Cta key={key} section={section} images={images} />;
        }
      })}
    </>
  );
}

function ActionButton({
  action,
  variant,
}: {
  action: SectionAction;
  /** BDS ButtonVariant — `on-color` is the one for brand-filled surfaces. */
  variant?: ComponentProps<typeof Button>['variant'];
}) {
  return (
    <Button href={action.href} variant={action.variant ?? variant ?? 'primary'}>
      {action.label}
    </Button>
  );
}

/**
 * Section photography, served from `public/images` (tncld#95).
 *
 * These used to be `<img>` tags pointing at `cdn.prod.website-files.com/
 * 67c4e62250923072710d478a/...` — the BDS *template's* Webflow site, not
 * TNCLD's (`694f1891a016a6340049f761`). Every homepage and /about photo was
 * therefore generic stock hotlinked off a third party, where the original uses
 * the practice's own photography.
 *
 * `fill` rather than intrinsic sizing because the paths come from
 * `cms-data.json` at runtime, so there is no static import to read dimensions
 * from. The 16:9 frame is the original's own (`img-frame-16-9-wide`) and lives
 * in the CSS beside the other frame rules.
 */
function SectionImage({
  src,
  className,
  eager,
}: {
  src: string;
  className: string;
  eager?: boolean;
}) {
  return (
    <span className={className}>
      <Image
        src={src}
        alt=""
        fill
        // Every section photo now spans the viewport or near it — the hero and
        // the CTA are full-bleed, the split images inset only 36px at 1440.
        sizes="100vw"
        priority={eager}
        style={{ objectFit: 'cover' }}
      />
    </span>
  );
}

function Hero({
  section,
  images,
  eager,
}: {
  section: HeroSection;
  images: Record<string, string>;
  eager?: boolean;
}) {
  const image = section.image ? images[section.image] : undefined;
  // No media means the interior `2-column-hero-split`, which the original lays
  // out differently from the homepage's full-bleed hero: title, a rule, then
  // the eyebrow and the body side by side. #92's five remaining pages all open
  // with this shape.
  if (!image) {
    return (
      <section className="section-hero section-hero--interior">
        <h1 className="section-hero__title">{section.title}</h1>
        <hr className="section-hero__rule" />
        <div className="section-hero__columns">
          <p className="section-hero__eyebrow">
            {section.eyebrowIcon ? (
              <Image
                className="section-hero__eyebrow-icon"
                src={section.eyebrowIcon}
                alt=""
                width={20}
                height={20}
              />
            ) : null}
            {section.eyebrow}
          </p>
          <p className="section-hero__lede">{section.body}</p>
        </div>
      </section>
    );
  }
  return (
    <section className="section-hero">
      <div className="section-hero__copy">
        <h1 className="section-hero__title">{section.title}</h1>
        <p className="section-hero__lede">{section.body}</p>
        {section.actions?.length ? (
          <div className="section-hero__actions">
            {section.actions.map((action) => (
              <ActionButton key={action.href} action={action} />
            ))}
          </div>
        ) : null}
      </div>
      <SectionImage src={image} className="section-hero__image" eager={eager} />
      {/* Layered over the still, not instead of it — the still is both the
          reduced-motion rendering and what shows until the stream is
          playable. */}
      {section.videoPlaybackId ? (
        <HeroVideo playbackId={section.videoPlaybackId} />
      ) : null}
    </section>
  );
}

function Reviews({ section }: { section: ReviewsSection }) {
  return (
    <section className="section-reviews" aria-label="Patient reviews">
      {/* One headline line — `Over 1,000 ★★★★★ Reviews` — as the original sets
          it. These were three stacked <p>s at three different sizes, which lost
          the original's single-statement reading. */}
      <p className="section-reviews__headline">
        <span className="section-reviews__stat">{section.stat}</span>
        <span
          className="section-reviews__stars"
          role="img"
          aria-label={`${section.rating} out of 5 stars`}
        >
          {'★'.repeat(section.rating)}
        </span>
        <span className="section-reviews__label">{section.label}</span>
      </p>
      <p className="section-reviews__body">{section.body}</p>
    </section>
  );
}

function Split({
  section,
  images,
}: {
  section: SplitSection;
  images: Record<string, string>;
}) {
  const image = section.image ? images[section.image] : undefined;
  const headingId = `split-${section.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
  return (
    // `mediaSide` is deliberately not read. Webflow's `2-column-content-split`
    // names two columns of TEXT — copy left, action right — above one
    // full-width image; it never places the image beside the copy. All four
    // homepage splits measure identically (image 1368x770 at x=36, 1440 wide),
    // so there is no left/right variant in the original to reproduce. The field
    // stays on the type because the interior pages #92 covers are not audited
    // yet and may still need it.
    <section className="section-split" aria-labelledby={headingId}>
      <div className="section-split__head">
        <div className="section-split__copy">
          {section.eyebrow ? (
            <p className="section-split__eyebrow">{section.eyebrow}</p>
          ) : null}
          <h2 id={headingId} className="section-split__title">
            {section.title}
          </h2>
          <p className="section-split__body">{section.body}</p>
        </div>
        {section.action ? (
          <div className="section-split__actions">
            <ActionButton action={section.action} />
          </div>
        ) : null}
      </div>
      {image ? (
        <SectionImage src={image} className="section-split__image" />
      ) : null}
    </section>
  );
}

function Steps({ section }: { section: StepsSection }) {
  return (
    <section className="section-steps" aria-labelledby="section-steps-heading">
      <h2 id="section-steps-heading" className="section-steps__title">
        {section.title}
      </h2>
      {/* The original numbers each step inside the label text itself ("1.
          Request an Appointment") rather than rendering a separate numeral, so
          the standalone `__number` badge is gone — it duplicated the number for
          sighted users and was aria-hidden from everyone else. */}
      <ol className="section-steps__list">
        {section.steps.map((step) => (
          <li key={step.label} className="section-steps__item">
            {step.icon ? (
              <Image
                className="section-steps__icon"
                src={step.icon}
                alt=""
                width={133}
                height={133}
              />
            ) : null}
            <div className="section-steps__item-text">
              <h3 className="section-steps__item-title">{step.label}</h3>
              <p className="section-steps__item-body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      {section.action ? (
        <div className="section-steps__cta">
          <ActionButton action={section.action} />
        </div>
      ) : null}
    </section>
  );
}

function Testimonials({ section }: { section: TestimonialsSection }) {
  return (
    <section
      className="section-testimonials"
      aria-labelledby="section-testimonials-heading"
    >
      <div className="section-testimonials__intro">
        <h2
          id="section-testimonials-heading"
          className="section-testimonials__title"
        >
          {section.title}
        </h2>
        {section.body ? (
          <p className="section-testimonials__body">{section.body}</p>
        ) : null}
      </div>
      <ul className="section-testimonials__grid">
        {section.stories.map((story) => (
          <li key={story.title} className="section-testimonials__card">
            {/* A story with a playback id gets the original's card: animated
                Mux poster, copy, and a button opening the video in a modal
                (tncld#97). Without one it stays the text-only card — the shape
                every story had while the videos were flattened out. */}
            {story.playbackId ? (
              <StoryVideo story={{ ...story, playbackId: story.playbackId }} />
            ) : (
              <>
                <h3 className="section-testimonials__card-title">
                  {story.title}
                </h3>
                <p className="section-testimonials__card-body">{story.body}</p>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Payments({ section }: { section: PaymentsSection }) {
  return (
    <section
      className="section-payments"
      aria-labelledby="section-payments-heading"
    >
      <div className="section-payments__copy">
        <h2 id="section-payments-heading" className="section-payments__title">
          {section.title}
        </h2>
        <p className="section-payments__body">{section.body}</p>
      </div>
      {/* Each method carries a glyph in the original — a card/cash/check mark or
          a financing partner's logo — above its label. */}
      <ul className="section-payments__methods">
        {section.methods.map((method) => (
          <li key={method.label} className="section-payments__method">
            {method.icon ? (
              <Image
                className="section-payments__method-icon"
                src={method.icon}
                alt=""
                width={121}
                height={81}
              />
            ) : null}
            <span className="section-payments__method-label">{method.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cta({
  section,
  images,
}: {
  section: CtaSection;
  images: Record<string, string>;
}) {
  const image =
    section.variant === 'split' && section.image
      ? images[section.image]
      : undefined;
  return (
    // The split variant is not a two-column layout: the original runs the photo
    // full-bleed (1440x1000) and floats a solid blue card over it on the right
    // (400x312, radius 12, padding 28). The copy therefore sits ON the media,
    // so it renders after the image in source order and above it in z-order.
    <section
      className={`section-cta section-cta--${section.variant ?? 'center'}`}
      aria-labelledby="section-cta-heading"
    >
      {image ? (
        <SectionImage src={image} className="section-cta__image" />
      ) : null}
      <div className="section-cta__copy">
        <h2 id="section-cta-heading" className="section-cta__title">
          {section.title}
        </h2>
        <p className="section-cta__body">{section.body}</p>
        {section.action ? (
          // The split CTA's card is brand-filled, so its action needs the
          // variant built for that surface rather than another blue-on-blue
          // fill. `on-color` deliberately does not flip with the theme.
          <ActionButton
            action={section.action}
            variant={section.variant === 'split' ? 'on-color' : undefined}
          />
        ) : null}
      </div>
    </section>
  );
}
