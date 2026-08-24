'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, Form, Select, TextArea, TextInput } from '@brikdesigns/bds';
import type { ContactContent } from '@/lib/content';
import './form-page.css';

/**
 * Reusable form-page template (tncld#62) — one layout for the contact and
 * request-appointment pages. A route describes its fields and the template
 * renders them through BDS form primitives, so the two pages share spacing,
 * labelling, and messaging.
 *
 * NO-PHI BY DESIGN (tncld#45, Path A). TNCLD is a HIPAA covered entity and Brik
 * cannot sign a BAA on its behalf, so no submission may flow through Brik
 * infrastructure (no marketing Supabase, no Brik API route). This template only
 * ever collects non-clinical callback details (name + phone) and submits via a
 * `mailto:` the visitor's own mail client sends directly to the practice —
 * nothing is stored on any Brik surface. Routes MUST NOT add clinical fields
 * (reason for visit, symptoms, new-patient status): that is PHI and would need
 * the BAA-covered handler tracked as tncld#45 Path B.
 *
 * The `mailto:` target is `contact.email`. Until real practice details land
 * (tncld#56) `contact` is empty, so the submit is disabled and the notice falls
 * back to "call the practice".
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
  /** Subject line for the mailto the visitor's mail client composes. */
  emailSubject: string;
  /** Practice contact details; only present fields render. */
  contact?: ContactContent;
}

function renderField(
  field: FormField,
  value: string,
  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void,
) {
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
          value={value}
          onChange={onChange}
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
          value={value}
          onChange={onChange}
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
          value={value}
          onChange={onChange}
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
  emailSubject,
  contact = {},
}: FormPageProps) {
  const { phone, email } = contact;
  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : undefined;
  const [values, setValues] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  /**
   * Compose a mailto the visitor's own mail client sends to the practice. No
   * request leaves the browser to any Brik surface, so no PHI is stored and no
   * BAA is required — see the file header.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    const body = [
      ...fields
        .map((field) => {
          const value = values[field.name]?.trim();
          return value ? `${field.label}: ${value}` : null;
        })
        .filter((line): line is string => line !== null),
      '',
      'Sent from the tncld.com website.',
    ].join('\n');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      emailSubject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <div className="form-page">
      <div className="form-page__intro">
        <h1 className="form-page__title">{title}</h1>
        <p className="form-page__lede">{lede}</p>
      </div>

      <div className="form-page__body">
        <div className="form-page__form">
          {email ? (
            <p className="form-page__notice" role="note">
              Send us your name and number and we&apos;ll call you back. Your
              details go straight to our team by email — nothing is stored on
              this website.{' '}
              {phone ? (
                <>
                  Prefer to talk now? Call{' '}
                  <a href={telHref}>{phone}</a>.
                </>
              ) : null}
            </p>
          ) : (
            <p className="form-page__notice" role="note">
              Online submission is being finalized.{' '}
              {phone ? (
                <>
                  To reach us now, call <a href={telHref}>{phone}</a>.
                </>
              ) : (
                <>Please call the practice to schedule in the meantime.</>
              )}
            </p>
          )}

          {sent ? (
            <p className="form-page__notice" role="status">
              Thanks — your message is ready to send in your email app. We&apos;ll
              call you back to confirm.
            </p>
          ) : null}

          <Form
            aria-label={formLabel}
            onSubmit={handleSubmit}
            footer={
              <Button type="submit" variant="primary" disabled={!email}>
                {submitLabel}
              </Button>
            }
          >
            {fields.map((field) =>
              renderField(field, values[field.name] ?? '', handleChange),
            )}
          </Form>
        </div>

        <ContactDetails contact={contact} />
      </div>
    </div>
  );
}
