import Link from 'next/link';
import './content-page.css';

/**
 * Reusable content-page template (tncld#59) — one layout for the standard
 * marketing pages (about, services, and the pages that gain content under
 * tncld#56). A page route maps its migrated content into these props; the
 * template renders whatever it is given and never hardcodes copy, so real
 * content flows in as tncld#56 lands with no template change.
 */
export interface ContentSection {
  title: string;
  description: string;
  /** When set, the section title links here (e.g. a service detail page). */
  href?: string;
}

export interface ContentPageProps {
  title: string;
  lede: string;
  image?: string;
  imageAlt?: string;
  sections?: ContentSection[];
}

export function ContentPage({
  title,
  lede,
  image,
  imageAlt,
  sections,
}: ContentPageProps) {
  return (
    <>
      <section className="content-page__intro">
        <div className="content-page__intro-copy">
          <h1 className="content-page__title">{title}</h1>
          <p className="content-page__lede">{lede}</p>
        </div>
        {image ? (
          // Migrated Webflow CDN asset; asset localization is tncld#56.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="content-page__image"
            src={image}
            alt={imageAlt ?? ''}
            loading="lazy"
          />
        ) : null}
      </section>

      {sections && sections.length > 0 ? (
        <ul className="content-page__sections">
          {sections.map((section) => (
            <li key={section.title} className="content-page__section">
              <h2 className="content-page__section-title">
                {section.href ? (
                  <Link
                    href={section.href}
                    className="content-page__section-link"
                  >
                    {section.title}
                  </Link>
                ) : (
                  section.title
                )}
              </h2>
              <p className="content-page__section-body">
                {section.description}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
