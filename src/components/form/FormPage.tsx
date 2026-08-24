import { Button, Form, Select, TextArea, TextInput } from '@brikdesigns/bds';
import type { ContactContent } from '@/lib/content';
import './form-page.css';

/**
 * Reusable form-page template (tncld#62) — one layout for the contact and
 * request-appointment pages. A route describes its fields and the template
 * renders them through BDS form primitives, so the two pages share spacing,
 * labelling, and messaging.
 *
 * STATIC BY DESIGN: the submit is disabled and the form posts nowhere. Wiring
 * the submit to a BAA-covered intake handler is tncld#45 (no DB store, per the
 * tncld#39 decision record); until that handler is chosen, transmitting patient
 * data would have no compliant destination. #45 enables the submit and adds the
 * action — the field layout here does not change.
 */
export type FormField =
  | {
      kind: 'text' | 'email' | 'tel' | 'date';
      name: string;
      label: string;
      required?: boolean;
      autoComplete?: string;
      placeholder?: string;
    }
  | {
      kind: 'textarea';
      name: string;
      label: string;
      required?: boolean;
      rows?: number;
      placeholder?: string;
    }
  | {
      kind: 'select';
      name: string;
      label: string;
      required?: boolean;
      placeholder?: string;
      options: { label: string; value: string }[];
    };

export interface FormPageProps {
  title: string;
  lede: string;
  /** Accessible name for the <form> region. */
  formLabel: string;
  fields: FormField[];
  submitLabel: string;
  /** Practice contact details; only present fields render. */
  contact?: ContactContent;
}

function renderField(field: FormField) {
  switch (field.kind) {
    case 'textarea':
      return (
        <TextArea
          key={field.name}
          name={field.name}
          label={field.label}
          required={field.required}
          rows={field.rows ?? 5}
          placeholder={field.placeholder}
          fullWidth
        />
      );
    case 'select':
      return (
        <Select
          key={field.name}
          name={field.name}
          label={field.label}
          required={field.required}
          placeholder={field.placeholder}
          options={field.options}
          fullWidth
        />
      );
    default:
      return (
        <TextInput
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.kind}
          required={field.required}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          fullWidth
        />
      );
  }
}

function ContactDetails({ contact }: { contact: ContactContent }) {
  const { phone, email, address, hours } = contact;
  if (!phone && !email && !address && !hours) return null;
  return (
    <aside className="form-page__aside">
      <dl className="form-page__details">
        <h2 className="form-page__details-heading">Reach the practice</h2>
        {phone ? (
          <div className="form-page__detail">
            <dt className="form-page__detail-term">Phone</dt>
            <dd className="form-page__detail-value">
              <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`}>{phone}</a>
            </dd>
          </div>
        ) : null}
        {email ? (
          <div className="form-page__detail">
            <dt className="form-page__detail-term">Email</dt>
            <dd className="form-page__detail-value">
              <a href={`mailto:${email}`}>{email}</a>
            </dd>
          </div>
        ) : null}
        {address ? (
          <div className="form-page__detail">
            <dt className="form-page__detail-term">Address</dt>
            <dd className="form-page__detail-value">{address}</dd>
          </div>
        ) : null}
        {hours ? (
          <div className="form-page__detail">
            <dt className="form-page__detail-term">Hours</dt>
            <dd className="form-page__detail-value">{hours}</dd>
          </div>
        ) : null}
      </dl>
    </aside>
  );
}

export function FormPage({
  title,
  lede,
  formLabel,
  fields,
  submitLabel,
  contact = {},
}: FormPageProps) {
  const phone = contact.phone;
  return (
    <div className="form-page">
      <div className="form-page__intro">
        <h1 className="form-page__title">{title}</h1>
        <p className="form-page__lede">{lede}</p>
      </div>

      <div className="form-page__body">
        <div className="form-page__form">
          <p className="form-page__notice" role="note">
            Online submission is being finalized.{' '}
            {phone ? (
              <>
                To reach us now, call{' '}
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`}>{phone}</a>.
              </>
            ) : (
              <>Please call the practice to schedule in the meantime.</>
            )}
          </p>

          <Form
            aria-label={formLabel}
            footer={
              <Button type="submit" variant="primary" disabled>
                {submitLabel}
              </Button>
            }
          >
            {fields.map(renderField)}
          </Form>
        </div>

        <ContactDetails contact={contact} />
      </div>
    </div>
  );
}
