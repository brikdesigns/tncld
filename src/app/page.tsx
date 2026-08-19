import { Button } from '@brikdesigns/bds';

/**
 * Placeholder home. Proves the theme + component pipeline end to end: renders a
 * real BDS component under the `.theme-tncld` body class (layout.tsx). No real
 * content — real pages land in later tickets.
 */
export default function Home() {
  return (
    <main style={{ padding: 'var(--padding-xl, 60px)' }}>
      <h1>Tennessee Center for Laser Dentistry</h1>
      <p>Scaffold placeholder — Next.js + BDS + Supabase.</p>
      <Button variant="primary">Request an appointment</Button>
    </main>
  );
}
