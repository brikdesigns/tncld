import type { Metadata } from 'next';
import { getSectionPage } from '@/lib/content';
import { PageSections } from '@/components/sections/PageSections';

export const metadata: Metadata = {
  title: 'Meet the Doctors',
  description:
    'Meet the doctors of Tennessee Center for Laser Dentistry — experienced clinicians in restorative, cosmetic, laser, and implant dentistry.',
};

/**
 * Meet the Doctors (tncld#92), at `/about/meet-the-doctors` — the original's
 * own URL, under the Webflow `about` folder.
 *
 * The heaviest of the five: hero, an image split, three portrait doctor cards
 * whose "Read Bio" opens the original's `modal-1..3` biography, the shared
 * philosophy list, the reviews band, Related Pages, and the closing CTA. The
 * old ResourcePage rendering carried none of the photography — the previous
 * note called the headshots client-blocked, but they are in the checked-in
 * Webflow export, and are now in `public/images`.
 */
export default function MeetTheDoctorsPage() {
  const page = getSectionPage('meet-the-doctors');
  return <PageSections sections={page.sections} images={page.images} />;
}
