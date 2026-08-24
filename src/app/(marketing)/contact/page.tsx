import type { Metadata } from 'next';
import { FormPage, type FormField } from '@/components/form/FormPage';
import { getContactContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
};

// NO-PHI (tncld#45, Path A): name + phone only. No free-text "message" field —
// a visitor would type symptoms into it, which is PHI, and Brik holds no BAA.
// See FormPage.tsx header before adding any field here.
const FIELDS: FormField[] = [
  {
    kind: 'text',
    name: 'name',
    label: 'Name',
    required: true,
    autoComplete: 'name',
  },
  {
    kind: 'tel',
    name: 'phone',
    label: 'Phone',
    required: true,
    autoComplete: 'tel',
  },
];

/**
 * Contact page (tncld#62). Callback-request layout on the shared FormPage
 * template; the submit composes a mailto the visitor's own mail client sends to
 * the practice (tncld#45 Path A — no PHI stored, no BAA needed). Practice
 * details come from the migrated `contact` content (empty until tncld#56) and
 * render only when present; the submit is disabled until a practice email lands.
 */
export default function ContactPage() {
  return (
    <FormPage
      title="Contact us"
      lede="Have a question about laser dentistry? Leave your name and number and our team will call you back."
      formLabel="Contact form"
      fields={FIELDS}
      submitLabel="Request a call"
      emailSubject="Website contact — callback request"
      contact={getContactContent()}
    />
  );
}
