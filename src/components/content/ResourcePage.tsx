import Link from 'next/link';
import { Prose } from '@brikdesigns/bds';
import type { RenderedPage } from '@/lib/content';
import './resource-page.css';

/**
 * Patient-resource template (tncld#60). One layout for the resource hub and its
 * child pages (new patients, membership plan, payment & insurance, FAQs). Each
 * section body is pre-rendered, sanitized HTML (markdown → marked → sanitize in
 * src/lib/content.ts, same pipeline as the legal pages) so the migrated Notion
 * copy keeps its lists, sub-headings, and emphasis. The template renders
 * whatever the source holds and never hardcodes copy.
 */
export function ResourcePage({ page }: { page: RenderedPage }) {
  return (
    <>
      <section className="resource-page__intro">
        <h1 className="resource-page__title">{page.title}</h1>
        <p className="resource-page__lede">{page.lede}</p>
      </section>

      {page.sections.length > 0 ? (
        <div className="resource-page__sections">
          {page.sections.map((section) => (
            <section key={section.title} className="resource-page__section">
              <h2 className="resource-page__section-title">
                {section.href ? (
                  <Link
                    href={section.href}
                    className="resource-page__section-link"
                  >
                    {section.title}
                  </Link>
                ) : (
                  section.title
                )}
              </h2>
              <Prose html={section.html} />
            </section>
          ))}
        </div>
      ) : null}
    </>
  );
}
