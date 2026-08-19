/**
 * Named compliance officers required by TNCLD's Compliance Profile (CLAUDE.md).
 *
 * HIPAA (45 CFR § 164.530) requires a *named individual* as Privacy Officer;
 * ADA Title III expects a named Accessibility Coordinator as the point of
 * contact for auxiliary-aids requests and disability grievances.
 *
 * The individuals are a TNCLD client decision (tncld#7 /
 * markdown/legal-drafts/NEXT-STEPS.md §1.1–1.2) and are not yet designated, so
 * these carry the drafts' interim placeholder. The legal drafts reference the
 * fields with {{HIPAA_PRIVACY_OFFICER}} / {{ACCESSIBILITY_COORDINATOR}} tokens;
 * src/lib/legal.ts substitutes these values at render, so swapping the real
 * name here is the single edit that updates every page that renders the field.
 */
export const HIPAA_PRIVACY_OFFICER = 'The Practice Manager';
export const ACCESSIBILITY_COORDINATOR = 'The Practice Manager';
