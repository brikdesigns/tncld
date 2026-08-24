import { Button } from '@brikdesigns/bds';
import { getHomeContent, getServicesContent } from '@/lib/content';
import { APPOINTMENT_CTA } from '@/components/layout/site-nav';
import './home.css';

/**
 * TNCLD home. Composed from the migrated file-based content
 * (`json/cms-data.json` via `@/lib/content`): a hero, a grid of service
 * highlights, and a closing CTA. The marketing shell
 * (`(marketing)/layout.tsx`) owns the header, footer, and <main> landmark, so
 * this renders page content only. Placeholder copy still present in the source
 * is tracked in tncld#56 — the template renders whatever the source holds.
 */
export default function Home() {
  const home = getHomeContent();
  const services = getServicesContent();
  const heroImage = home.images.location1;

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__copy">
          <h1 className="home-hero__title">{home.hero.title}</h1>
          <p className="home-hero__lede">{home.hero.description}</p>
          <Button href={APPOINTMENT_CTA.href} variant="primary">
            {APPOINTMENT_CTA.label}
          </Button>
        </div>
        {heroImage ? (
          // Migrated Webflow CDN asset; localizing assets is tracked in tncld#56.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="home-hero__image"
            src={heroImage}
            alt="Tennessee Center for Laser Dentistry patient care"
            loading="eager"
          />
        ) : null}
      </section>

      <section className="home-services" aria-labelledby="home-services-heading">
        <h2 id="home-services-heading" className="home-services__heading">
          {services.hero.title}
        </h2>
        <ul className="home-services__grid">
          {services.serviceList.map((service) => (
            <li key={service.title} className="home-services__card">
              <h3 className="home-services__card-title">{service.title}</h3>
              <p className="home-services__card-body">{service.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-cta">
        <h2 className="home-cta__title">{home.cta.title}</h2>
        <p className="home-cta__body">{home.cta.description}</p>
        <Button href={APPOINTMENT_CTA.href} variant="primary">
          {APPOINTMENT_CTA.label}
        </Button>
      </section>
    </>
  );
}
