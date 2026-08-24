import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ResourcePage } from '@/components/content/ResourcePage';
import { getResourcePage } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Patient Resources',
  description:
    'New patient information, payment & insurance, the membership plan, and FAQs for Tennessee Center for Laser Dentistry.',
};

/**
 * Patient Resources hub (tncld#60) — the directory page linking to each child
 * resource. Content is migrated from the Notion "TNCLD Website" DB (tncld#56)
 * and rendered through the shared patient-resource template.
 */
export default function PatientResourcesHubPage() {
  const page = getResourcePage('patient-resources');
  if (!page) notFound();
  return <ResourcePage page={page} />;
}
