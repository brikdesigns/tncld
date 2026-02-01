# New Patients Page Specification

**Source:** [Notion - New Patients](https://www.notion.so/New-Patients-2bf97d34ed2880c58632e82205a40c56)
**Webflow Page ID:** `69581657de29d5dda67ea5b4`
**Last Updated:** 2026-01-21

---

## Page Structure (Matching Screenshot)

| Order | Component | Component ID | Section |
|-------|-----------|--------------|---------|
| 1 | top-utility-nav | `759d72a5-7b40-0374-3f3e-362840a59fb9` | Navigation |
| 2 | top-navigation | `b78a3ddf-ece7-4294-1d0a-459ba840a081` | Navigation |
| 3 | 1-column-hero-interior | `1e9ae42e-dbf8-0994-5f90-e890e4e7d22e` | Hero |
| 4 | 2-column-combo | `11b2cf5c-d508-e0cd-0979-c9432c188532` | What to Expect |
| 5 | 2-column-combo | `11b2cf5c-d508-e0cd-0979-c9432c188532` | Your Comfort |
| 6 | 2-column-combo | `11b2cf5c-d508-e0cd-0979-c9432c188532` | New Patient Forms |
| 7 | 4-column-cards | `0d47182b-dc9e-cf7c-09de-5ba146e9ebf8` | Features (optional) |
| 8 | 3-column-cards | `62458acc-0662-5511-fcca-319580094b29` | Features (optional) |
| 9 | 2-column-combo | `11b2cf5c-d508-e0cd-0979-c9432c188532` | Insurance & Payment |
| 10 | 3-column-testimonial | `bd164091-d526-374f-b21b-98052b1525b4` | Testimonials |
| 11 | 2-column-combo | `11b2cf5c-d508-e0cd-0979-c9432c188532` | Meet Doctors / Tour |
| 12 | 1-column-cta-new | `9d507ed7-3640-9a39-2e13-66040e97d25c` | CTA |
| 13 | footer | `e0cd512e-e767-d52d-4249-132518814c11` | Footer |

---

## Section Content

### 1. Hero Section
**Component:** `1-column-hero-interior`

| Field | Content |
|-------|---------|
| Subheading | New Patients |
| Heading | Welcome to Tennessee Center for Laser Dentistry |
| Description | We're so glad you're here. Whether you're new to the area, ready for a fresh start, or simply looking for a more comfortable dental experience, our team is here to make your first visit smooth, relaxed, and personalized. |
| Button 1 | Schedule Your First Visit |
| Button 2 | Contact Us |

---

### 2. What to Expect Section
**Component:** `2-column-combo`
**Layout:** Content left, image right

| Field | Content |
|-------|---------|
| Heading | What to Expect at Your First Visit |
| Description | Your first appointment is designed to be both thorough and comfortable. We take time to get to know you, understand your goals, and evaluate your oral health with advanced technology that allows for a more precise and gentle experience. |
| Subheading | Your visit typically includes: |
| List Items | - A warm welcome and guided check-in<br>- Digital imaging and a comprehensive exam<br>- A gentle cleaning (when appropriate)<br>- Time with your doctor to review findings and ask questions<br>- A personalized treatment plan designed around your needs |
| Closing | You'll leave with a clear picture of your oral health — and a team committed to supporting you at every step. |

---

### 3. Your Comfort Section
**Component:** `2-column-combo`
**Layout:** Content right, image left (alternate)

| Field | Content |
|-------|---------|
| Heading | Your Comfort Matters |
| Description | We understand that visiting a new dentist can feel uncertain. Our approach is designed to help you feel at ease from the moment you walk in. |
| Subheading | What makes our experience different: |
| List Items | - A calm, modern, welcoming office<br>- A team that listens and explains everything clearly<br>- Gentle techniques supported by advanced technology<br>- A judgment-free approach to care<br>- Flexible scheduling |
| Closing | Your comfort is our priority — always. |

---

### 4. New Patient Forms Section
**Component:** `2-column-combo` (simplified) or `1-column-content`

| Field | Content |
|-------|---------|
| Heading | New Patient Forms |
| Description | Save time during your visit by completing your forms online. We'll send you specific link to fill out the details we need from you prior to your appointment. |

---

### 5. Insurance & Payment Section
**Component:** `2-column-combo`
**Layout:** Content left, icons right

| Field | Content |
|-------|---------|
| Heading | Insurance & Payment Options |
| Description | We make your first visit simple by helping you understand your benefits and providing clear, upfront information about costs. |
| Subheading | We offer: |
| List Items | - Insurance support and benefits verification<br>- Flexible payment options<br>- Transparent pricing<br>- A Membership Plan for patients without insurance |
| Closing | We're happy to walk you through your options before your appointment. |
| Links | Learn More → Payment & Insurance<br>Learn More → Membership Plan |

---

### 6. Meet Your Doctors Section
**Component:** `2-column-combo`
**Layout:** Image left (doctors photo), content right

| Field | Content |
|-------|---------|
| Heading | Meet Your Doctors |
| Description | Our doctors bring advanced training, modern technology, and a compassionate approach to every visit. Get to know the team who will be caring for you. |
| Button | Meet the Doctors → |

---

### 7. Tour Our Office Section
**Component:** `2-column-gallery` or `3-column-img`

| Field | Content |
|-------|---------|
| Heading | Tour Our Office |
| Description | Take a look inside our state-of-the-art, calming office and see what makes our experience feel different. |
| Button | Take the Tour → |
| Images | Office gallery images |

---

### 8. Testimonials Section
**Component:** `3-column-testimonial`

| Testimonial 1 | "The most welcoming dental experience I've ever had." |
| Testimonial 2 | "I felt cared for from the moment I walked in." |
| Testimonial 3 | "Everything was explained so clearly — I finally feel confident about my dental care." |

**Note:** Replace with real patient testimonials when available.

---

### 9. CTA Section
**Component:** `1-column-cta-new`

| Field | Content |
|-------|---------|
| Heading | Ready for a Better Dental Experience? |
| Description | We'd love to welcome you to our practice. Reach out — we're here to help. |
| Button 1 | Schedule Your First Visit |
| Button 2 | Contact Us |

---

## Implementation Notes

### Option A: Manual Designer Workflow
1. Open Webflow Designer for TNCLD site
2. Navigate to New Patients page
3. Add components in order listed above
4. Copy/paste content from this spec
5. Upload appropriate images
6. Style and adjust spacing as needed

### Option B: html.to.design Workflow
1. Create HTML sections using this content
2. Import to Figma via html.to.design MCP
3. Refine designs in Figma
4. Use Webflow Bridge to import

### API Reference
- **Site ID:** `694f1891a016a6340049f761`
- **Page ID:** `69581657de29d5dda67ea5b4`
- **Hero Property IDs:**
  - Heading: `22d08ec1-2fc6-c8fe-1220-bc8b21de3898`
  - Subheading: `c19e9e24-e47d-0dcf-0b4b-a6abf49d770a`
  - Description: `b2c7462a-2338-7e28-98aa-4f44e99c4b15`
- **CTA Property IDs:**
  - Heading: `10686828-4034-a9ba-b440-cb441cee624d`
  - Description: `464cf5b1-1765-64e0-3322-b4658b33fd77`
  - Label: `c0d3c107-efa7-a984-054b-b4ff1d8e5990`
