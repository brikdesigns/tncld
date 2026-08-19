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
 * Anti-FOUC script: reads localStorage/prefers-color-scheme and sets
 * data-theme on <html> before React hydrates, so the dark-mode token block in
 * theme-tncld.css resolves without a flash of the wrong theme.
 */
const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    // localStorage / matchMedia unavailable (e.g. private mode) — leave the
    // default (light) theme rather than blocking first paint.
    console.warn('theme init skipped', e);
  }
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
