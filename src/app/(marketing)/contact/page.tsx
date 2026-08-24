import type { Metadata } from 'next';
import { FormPage, type FormField } from '@/components/form/FormPage';
import { getContactContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
};

const FIELDS: FormField[] = [
  {
    kind: 'text',
    name: 'name',
    label: 'Name',
    required: true,
    autoComplete: 'name',
  },
  {
    kind: 'email',
    name: 'email',
    label: 'Email',
    required: true,
    autoComplete: 'email',
  },
  { kind: 'tel', name: 'phone', label: 'Phone', autoComplete: 'tel' },
  { kind: 'textarea', name: 'message', label: 'How can we help?', required: true },
];

/**
 * Contact page (tncld#62). Static layout on the shared FormPage template; the
 * submit is wired to a BAA-covered handler under tncld#45. Practice details
 * come from the migrated `contact` content (empty until tncld#56) and render
 * only when present.
 */
export default function ContactPage() {
  return (
    <FormPage
      title="Contact us"
      lede="Have a question about laser dentistry or your care? Send us a message and our team will follow up."
      formLabel="Contact form"
      fields={FIELDS}
      submitLabel="Send message"
      contact={getContactContent()}
    />
  );
}
