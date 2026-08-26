import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="theme-tncld">{children}</body>
    </html>
  );
}
