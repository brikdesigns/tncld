import { getHomeContent } from '@/lib/content';
import { PageSections } from '@/components/sections/PageSections';

/**
 * TNCLD home. Composed from the migrated file-based content
 * (`json/cms-data.json` via `@/lib/content`) as an ordered list of typed
 * sections that mirror the original Webflow homepage's IA — hero, social-proof
 * reviews, feature teasers, a numbered process, a treatments showcase, patient
 * stories, payment options, and closing CTAs (tncld#89). The marketing shell
 * (`(marketing)/layout.tsx`) owns the header, footer, and <main> landmark, so
 * this renders page content only. The section templates in
 * `src/components/sections` render whatever the source holds and never hardcode
 * copy; refining placeholder-adjacent copy is tracked in tncld#56.
 */
export default function Home() {
  const home = getHomeContent();
  return <PageSections sections={home.sections} images={home.images} />;
}
