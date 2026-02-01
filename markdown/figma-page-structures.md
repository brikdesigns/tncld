# TNCLD Website - Figma Page Structures

Pre-flight analysis for Webflow rebuild. Source: [Figma Design](https://www.figma.com/design/miiXvGWZPBfFFtWCciv78K/TNCLD-Website-Redesign?node-id=0-1)

Last updated: 2026-01-24

---

## Section Components Identified

| Component Name | Type | Description |
|----------------|------|-------------|
| `top-navigation` | Instance | Global navigation with utility bar + mega-menus |
| `1-column-hero` | Frame/Instance | Hero section with full-width content |
| `1-column-center` | Frame | Centered content (social proof/ratings) |
| `1-column-content-center` | Instance | Centered text block with CTA |
| `2-column-cta-split` | Instance | Split CTA with image |
| `2-column-cta-right` | Frame | CTA with content left, image right |
| `2-column-img` | Frame | Alternating image/content layout |
| `2-column-tabbed-stacked` | Frame | Tabs with image content |
| `3-column-card` | Frame | Three-column card grid |
| `footer` | Instance | Global footer with 5 columns |
| `text-button` | Instance | Primary/secondary CTA buttons |
| `tab-button` | Instance | Tab navigation items |
| `Star Rating` | Instance | 5-star rating display |

---

## Home Page Structure

**Page ID:** `557:3888`
**Frame ID:** `427:2022`
**Dimensions:** 1440 x 9841px

### Section Order (top to bottom)

| # | Section | Component | Height | Notes |
|---|---------|-----------|--------|-------|
| 1 | Navigation | `top-navigation` | 121px | Global component |
| 2 | Hero | `1-column-hero` | 800px | Full-width hero with CTA |
| 3 | Social Proof | `1-column-center` | 434px | Star rating + testimonial snippet |
| 4 | Primary CTA | `2-column-cta-split` | 860px | Split layout with image |
| 5 | Services Cards | `3-column-card` | 1000px | 3 service highlight cards |
| 6 | Feature Image | `2-colum-img` | 856px | Large image with headline |
| 7 | Tabbed Services | `2-column-tabbed-stacked` | 1000px | 3 tabs with image display |
| 8 | Service 1 | `2-colum-img` | 744px | Alternating (content left) |
| 9 | Service 2 | `2-colum-img` | 744px | Alternating (content right) |
| 10 | Service 3 | `2-colum-img` | 744px | Alternating (content left) |
| 11 | Service 4 | `2-colum-img` | 744px | Alternating (content right) |
| 12 | Reviews CTA | `1-column-content-center` | 480px | Centered testimonial CTA |
| 13 | Final CTA | `2-column-cta-right` | 810px | Appointment booking |
| 14 | Footer | `footer` | 504px | Global component |

---

## Services Navigation Grid

**Frame ID:** `8120:2782`
**Dimensions:** 1440 x 691px

### Structure
```
Container (1280px)
├── Column 1: "Services" (456px)
│   ├── Heading: "Services"
│   ├── Description
│   └── list-wrapper
│       ├── list-item: Dental Implants
│       ├── list-item: Hybrid Dentures
│       └── list-item: Invisalign
│
├── Column 2: "Advanced Dentistry" (456px)
│   ├── Heading: "Advanced dentistry"
│   ├── Description
│   └── list-wrapper
│       ├── list-item: Restorative Dentistry
│       ├── list-item: Cosmetic Dentistry
│       └── list-item: Preventative Dentistry
│
└── Feature Column (272px)
    ├── Image (346x195px)
    ├── Heading
    ├── Description
    └── CTA Button
```

### Services List
1. **Services Category**
   - Dental Implants
   - Hybrid Dentures
   - Invisalign

2. **Advanced Dentistry Category**
   - Restorative Dentistry
   - Cosmetic Dentistry
   - Preventative Dentistry

3. **Technologies (Hidden in design)**
   - Laser Dentistry
   - Same-Day Crowns (CEREC)
   - Oral Cancer Detection
   - Digital Imaging

---

## About Navigation Dropdown

**Frame ID:** `8244:6494`
**Dimensions:** 1440 x ~645px

This is the mega-menu dropdown for "About" in the navigation.

### Structure
```
Container (80px padding)
├── Column 1: "Our Practice" (456px)
│   ├── Heading: "Our Practice"
│   ├── Description text
│   └── list-wrapper (24px gap)
│       ├── list-item: Meet the Doctors
│       │   ├── Image (140x104px, rounded-48px)
│       │   └── Content (title + description)
│       └── list-item: Tour Our Office
│           ├── Image (140x104px, rounded-48px)
│           └── Content (title + description)
│
├── Column 2: "Laser Dentistry" (456px)
│   ├── Heading: "Laser Dentistry"
│   ├── Description text
│   └── list-wrapper (24px gap)
│       ├── list-item: Our Technology
│       │   ├── Image (140x104px, rounded-48px)
│       │   └── Content (title + description)
│       └── list-item: Why Laser Dentistry is Our Standard
│           ├── Image (140x104px, rounded-48px)
│           └── Content (title + description)
│
└── Feature Column (272px, bg-secondary, rounded-12px)
    ├── Hero Image (346x195px, full bleed top)
    ├── Heading: "Accepting New Patients"
    ├── Description text
    └── CTA Button (primary)
```

### About Sub-Pages
1. **Meet the Doctors** - Team bios and credentials
2. **Tour Our Office** - Facility photos and virtual tour
3. **Our Technology** - Equipment and capabilities
4. **Why Laser Dentistry** - Educational content on laser benefits

---

## Services Mega-Menu Grid

**Frame ID:** `8120:2880`
**Dimensions:** 1440 x ~710px

Alternative services dropdown showing all 6 services in a grid.

### Structure
```
Container (80px padding)
├── Header
│   ├── Heading: "Services"
│   └── Subtext: "What we offer our patients. All done with laser tech."
│
├── Services Grid (6 columns, 200px cards)
│   ├── Dental Implants
│   │   ├── Image (200x200px, bg-secondary)
│   │   ├── Title (uppercase label)
│   │   └── Description
│   ├── Hybrid Dentures
│   ├── Invisalign
│   ├── Restorative Dentistry
│   ├── Cosmetic Dentistry
│   └── Preventative Dentistry
│
└── Feature Banner (full-width, bg-secondary, rounded)
    ├── Content (left)
    │   ├── Heading: "Accepting New Patients"
    │   └── Description
    └── CTA Button (right, outline style)
```

### Service Cards Layout
- Card size: 200x200px image + content below
- Background: surface/secondary (#181818)
- Images: centered, 140x104px dental implant illustrations
- Typography: label/md (uppercase) + body/tiny

---

## Service Detail Page Template

Based on Figma annotations, each service page should include:

### Required Sections
1. **Hero** - Service-specific hero with title and intro
2. **Benefits** - 3-4 key benefits of the treatment
3. **Process/How It Works** - Step-by-step explanation
4. **Before/After or Gallery** - Visual results
5. **Testimonials** - Video or Google reviews (minimum 3)
6. **FAQs** - 3-6 relevant questions and answers
7. **Why Choose Us** - Doctor expertise, technology highlights
8. **Related Services** - 3 related service links
9. **CTA** - Appointment booking

### Content Notes from Figma
- "Could be video testimonials or Google reviews or a combination of both"
- "A minimum of 3 will be showcased"
- "3-6 FAQs relevant to the procedure"
- "Connect 3 different related services for SEO and deeper engagement"

---

## Webflow Build Checklist

### Global Components Needed
- [ ] top-navigation
- [ ] footer
- [ ] text-button (primary)
- [ ] text-button (secondary)
- [ ] Star Rating component
- [ ] tab-button

### Section Components Needed
- [ ] 1-column-hero
- [ ] 1-column-center
- [ ] 1-column-content-center
- [ ] 2-column-cta-split
- [ ] 2-column-cta-right
- [ ] 2-column-img (alternating variant)
- [ ] 2-column-tabbed-stacked
- [ ] 3-column-card

### CMS Collections Needed
- [ ] Services
- [ ] Team Members
- [ ] Testimonials
- [ ] FAQs (or embed per-page)

---

## Image Assets Required

### Home Page
- Hero background/image
- 3x Service card images
- Feature section large image
- 3x Tab content images
- 4x Service showcase images (alternating sections)
- Team/practice images for CTA

### Service Pages
- Per-service hero image
- Before/after gallery images
- Testimonial photos/videos
- Related service thumbnails

---

## Global Navigation Component

**Node ID:** `4023:796`
**Height:** 121px (41px utility + 80px main nav)

### Structure
```
top-navigation
├── utility-navigation (41px, bg-black)
│   └── container-lg (right-aligned)
│       ├── Phone: 615-595-8070 (with icon)
│       ├── Address: 204 Miller Springs Ct. Suite 200, Franklin, TN
│       └── "Laser dentistry" (accent color, with bolt icon)
│
└── main-navigation (80px, bg-black)
    └── container-lg
        ├── logo-wrapper (600x184px logo)
        ├── nav-wrapper (pill shape, 32px padding)
        │   ├── Services (mega-menu dropdown)
        │   ├── About (mega-menu dropdown)
        │   ├── [Nav Item 3]
        │   ├── [Nav Item 4]
        │   └── Contact
        └── button-wrapper
            ├── text-button (outline/secondary)
            └── text-button (filled/primary)
```

### Navigation Items
- **Services** → Services mega-menu (8120:2782)
- **About** → About mega-menu (8244:6494)
- **Contact** → Contact page/section
- 2 additional nav items TBD

---

## Global Footer Component

**Node ID:** `427:2032`
**Height:** 504px

### Structure
```
footer (bg-black)
├── footer-grid (80px side padding, 40px bottom padding)
│   ├── Column 1: Brand
│   │   ├── Logo (600x184px)
│   │   ├── Address
│   │   │   ├── "1204 Miller Springs Ct"
│   │   │   ├── "Suite 200"
│   │   │   └── "Franklin, TN 37064"
│   │   ├── Phone: (319) 668-1554
│   │   └── Social Icons
│   │       ├── LinkedIn
│   │       ├── Yelp
│   │       ├── Instagram
│   │       └── YouTube
│   │
│   ├── Column 2: About
│   │   ├── "About" (heading)
│   │   └── Links
│   │       ├── Meet Our Doctors
│   │       ├── Visit Our Office
│   │       ├── Our Technologies
│   │       └── Patient Stories
│   │
│   ├── Column 3: Services
│   │   ├── "Services" (heading)
│   │   └── Links
│   │       ├── Dental Implants
│   │       ├── Hybrid Dentures
│   │       ├── Invisalign
│   │       ├── Restorative Dentistry
│   │       ├── Cosmetic Dentistry
│   │       └── Preventative Dentistry
│   │
│   ├── Column 4: Patient Resources
│   │   ├── "Patient Resources" (heading)
│   │   └── Links
│   │       ├── New Patients
│   │       ├── Membership Plan
│   │       ├── Payment & Insurance
│   │       ├── FAQs
│   │       └── Refer a Friend
│   │
│   └── Column 5: Hours
│       ├── "Hours" (heading)
│       └── Schedule Grid
│           ├── Mon-Fri: 10:00 AM - 7:00 PM
│           ├── Saturday: Closed
│           └── Sunday: Closed
│
└── sub-footer (40px height)
    ├── Left: © 2025 Tennessee Centers for Laser Dentistry • Terms • Privacy
    └── Right: "Site by Brik Designs"
```

---

## Full Site Page List

Based on navigation and footer analysis:

### Primary Pages
1. **Home** (fully designed)
2. **Contact** (referenced in nav)

### About Section
1. Meet Our Doctors
2. Visit Our Office (Tour)
3. Our Technologies
4. Patient Stories/Testimonials

### Services Section
1. Dental Implants
2. Hybrid Dentures
3. Invisalign
4. Restorative Dentistry
5. Cosmetic Dentistry
6. Preventative Dentistry

### Patient Resources
1. New Patients
2. Membership Plan
3. Payment & Insurance
4. FAQs
5. Refer a Friend

---

## Notes

- All sections use 1440px viewport width
- Container widths: 1272px (standard), 1360px (large)
- Consistent 84px side margins
- Grid uses 16px gutters
- All service list items: 456px width, 140px height
- Primary accent color: #0065ff
- Surface colors: primary (#000), secondary (#181818)
- Typography: Inter font family (Label: Extra Bold, Body: Regular, Heading: Bold)
