import type { Metadata } from 'next';
import { FormPage, type FormField } from '@/components/form/FormPage';
import { getContactContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Request an Appointment',
  description:
    'Request an appointment at Tennessee Center for Laser Dentistry — laser dentistry in Franklin, TN.',
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
  {
    kind: 'tel',
    name: 'phone',
    label: 'Phone',
    required: true,
    autoComplete: 'tel',
  },
  {
    kind: 'select',
    name: 'patientStatus',
    label: 'Are you a current patient?',
    required: true,
    placeholder: 'Select one',
    options: [
      { label: 'New patient', value: 'new' },
      { label: 'Current patient', value: 'current' },
    ],
  },
  { kind: 'date', name: 'preferredDate', label: 'Preferred date' },
  {
    kind: 'select',
    name: 'preferredTime',
    label: 'Preferred time',
    placeholder: 'No preference',
    options: [
      { label: 'Morning', value: 'morning' },
      { label: 'Afternoon', value: 'afternoon' },
    ],
  },
  {
    kind: 'textarea',
    name: 'reason',
    label: 'Reason for your visit',
    rows: 4,
  },
];

/**
 * Request-appointment page (tncld#62). Static layout on the shared FormPage
 * template; the submit is wired to a BAA-covered handler under tncld#45 (no DB
 * store, per the tncld#39 decision record). Practice details come from the
 * migrated `contact` content (empty until tncld#56) and render only when
 * present.
 */
export default function RequestAppointmentPage() {
  return (
    <FormPage
      title="Request an appointment"
      lede="Tell us when works best and a bit about what you need. We'll confirm your visit by phone or email."
      formLabel="Appointment request form"
      fields={FIELDS}
      submitLabel="Request appointment"
      contact={getContactContent()}
    />
  );
}
