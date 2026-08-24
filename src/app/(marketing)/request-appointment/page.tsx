import type { Metadata } from 'next';
import { FormPage, type FormField } from '@/components/form/FormPage';
import { getContactContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Request an Appointment',
  description:
    'Request an appointment at Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
};

// NO-PHI (tncld#45, Path A): name + phone + a non-clinical time preference only.
// Dropped from the #62 draft — "new patient?" status, "reason for your visit",
// and a specific date — all reveal health information (PHI), and Brik holds no
// BAA. A morning/afternoon preference carries no clinical detail. See
// FormPage.tsx header before adding any field here.
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
  {
    kind: 'select',
    name: 'preferredTime',
    label: 'Best time to call',
    placeholder: 'No preference',
    options: [
      { label: 'Morning', value: 'morning' },
      { label: 'Afternoon', value: 'afternoon' },
    ],
  },
];

/**
 * Request-appointment page (tncld#62). Callback-request layout on the shared
 * FormPage template; the submit composes a mailto the visitor's own mail client
 * sends to the practice (tncld#45 Path A — no PHI stored, no BAA needed).
 * Practice details come from the migrated `contact` content (empty until
 * tncld#56) and render only when present; the submit is disabled until a
 * practice email lands.
 */
export default function RequestAppointmentPage() {
  return (
    <FormPage
      title="Request an appointment"
      lede="Leave your name and number and the best time to reach you. We'll call to schedule your visit."
      formLabel="Appointment request form"
      fields={FIELDS}
      submitLabel="Request a call"
      emailSubject="Website appointment — callback request"
      contact={getContactContent()}
    />
  );
}
