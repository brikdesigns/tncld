import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourcePage } from '@/components/content/ResourcePage';
import { getResourcePage } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Meet the Doctors',
  description:
    'Meet the doctors of Tennessee Center for Laser Dentistry — experienced clinicians in restorative, cosmetic, laser, and implant dentistry.',
};

/**
 * Meet the Doctors (tncld#73) — the practice's doctor bios and philosophy, its
 * copy migrated from the Notion "TNCLD Website" DB (tncld#56) and rendered
 * through the shared resource template. Rendered text-first: doctor headshots
 * are not yet in the repo/Notion (client-blocked, tncld#73 note).
 */
export default function MeetTheDoctorsPage() {
  const page = getResourcePage('meet-the-doctors');
  if (!page) notFound();
  return <ResourcePage page={page} />;
}
