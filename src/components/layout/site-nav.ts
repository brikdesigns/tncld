/**
 * Primary navigation for the TNCLD marketing shell. Single source of truth so
 * the header and the footer "Explore" column stay in sync. Routes match the
 * template map in tncld#39 (Phase 0 decision record); pages that don't exist
 * yet still get their link here so the nav is complete at shell time and the
 * pages fill in under tncld#59 / #60 / #61.
 */
export interface NavLink {
  label: string;
  href: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Patient Resources', href: '/patient-resources' },
  { label: 'Patient Stories', href: '/patient-stories' },
  { label: 'Contact', href: '/contact' },
];

/** The primary call to action, repeated in header and footer. */
export const APPOINTMENT_CTA: NavLink = {
  label: 'Request an Appointment',
  href: '/request-appointment',
};

/** Practice name — used as the home link label and footer brand line. */
export const PRACTICE_NAME = 'Tennessee Center for Laser Dentistry';
