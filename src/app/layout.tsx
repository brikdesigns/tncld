import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

/**
 * The site shipped with NO webfont at all (tncld#158). `globals.css` carried an
 * `@import url("https://fonts.googleapis.com/…Inter…")`, and the bundler drops
 * it — the emitted stylesheet contains zero `googleapis` references and the
 * page issues zero font requests, so `Inter` fell through to the system sans on
 * every route. `document.fonts.check('700 36px Inter')` returns `true` in that
 * state, which is why it went unnoticed: `check()` answers for the resolved
 * fallback. Only measurement catches it —
 *
 *   canvas 700 36px, "Experienced Clinicians. Elevated Care."
 *     export (Inter v20 from gstatic)   677.3px
 *     rebuild, before                   662.3px   == its own `sans-serif`
 *     rebuild, after                    677.3px
 *
 * At 991 that is one wrapped line per heading: `/` bands 4 and 6 measured 94.2%
 * and 93.7% of the original with the split construct already correct, and
 * 100.4% once Inter loads.
 *
 * `next/font` over a `<link>`: it self-hosts the same Inter v20 files at build
 * time, so there is no third-party request from a visitor's browser on a
 * healthcare site, and no layout shift.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Tennessee Center for Laser Dentistry',
    template: '%s | Tennessee Center for Laser Dentistry',
  },
  description:
    'Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
};

/**
 * The site is dark, unconditionally — the Webflow original renders white on
 * black on every section and ships no light scheme or theme switcher
 * (tncld#95). This previously read `prefers-color-scheme` and served a light
 * page to light-OS visitors, so the rebuild had two appearances and neither
 * was the original's. Nothing in the app writes `localStorage.theme`, so that
 * branch was dead anyway.
 *
 * Set as an inline pre-hydration script rather than a static attribute so
 * `colorScheme` is applied before first paint: it is what makes form controls,
 * scrollbars, and the overscroll gutter render dark instead of flashing white.
 */
const themeScript = `
(function() {
  document.documentElement.dataset.theme = 'dark';
  document.documentElement.style.colorScheme = 'dark';
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="theme-tncld">{children}</body>
    </html>
  );
}
