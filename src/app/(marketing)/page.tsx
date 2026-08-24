import { Button } from '@brikdesigns/bds';

/**
 * Placeholder home body. The marketing shell (`(marketing)/layout.tsx`) now
 * owns the <main> landmark, header, and footer, so this renders only the page
 * content. Real home content lands under tncld#58.
 */
export default function Home() {
  return (
    <section style={{ padding: 'var(--padding-xl, 60px)' }}>
      <h1>Tennessee Center for Laser Dentistry</h1>
      <p>Scaffold placeholder — real home content lands under #58.</p>
      <Button variant="primary">Request an appointment</Button>
    </section>
  );
}
