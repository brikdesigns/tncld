# Webflow Custom Code Setup

This document describes how custom CSS and JS are managed for the TNCLD Webflow site.

---

## Architecture

```
GitHub Repo (brikdesigns/tncld)
        │
        ▼
   Push to main
        │
        ▼
  GitHub Action runs
  (purge-cdn.yml)
        │
        ▼
  jsDelivr cache purged
        │
        ▼
  Webflow serves updated code
```

---

## Files

| File | Purpose | jsDelivr URL |
|------|---------|--------------|
| `header.css` | Custom CSS overrides | `https://cdn.jsdelivr.net/gh/brikdesigns/tncld@main/header.css` |
| `footer.js` | Custom JS (if needed) | `https://cdn.jsdelivr.net/gh/brikdesigns/tncld@main/footer.js` |

---

## Webflow Configuration

### Head Code
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollSmoother.min.js" defer></script>
<script src="https://kit.fontawesome.com/cd4a011d2b.js" crossorigin="anonymous" defer></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/brikdesigns/tncld@main/header.css">
```

### Footer Code
```html
<script>
// Custom JS initialization (if needed)
</script>
```

---

## Workflow

### Making CSS/JS Changes

1. Edit `header.css` or `footer.js` locally
2. Commit and push to `main` branch
3. GitHub Action automatically purges jsDelivr cache
4. Changes are live within seconds

### Manual Cache Purge (if needed)

If the GitHub Action fails or you need immediate updates:

```bash
# Purge CSS
curl "https://purge.jsdelivr.net/gh/brikdesigns/tncld@main/header.css"

# Purge JS
curl "https://purge.jsdelivr.net/gh/brikdesigns/tncld@main/footer.js"
```

Or visit these URLs in your browser:
- https://purge.jsdelivr.net/gh/brikdesigns/tncld@main/header.css
- https://purge.jsdelivr.net/gh/brikdesigns/tncld@main/footer.js

---

## Troubleshooting

### Changes not appearing on live site

1. **Check GitHub Action ran:** Go to repo → Actions tab → verify "Purge jsDelivr Cache" completed
2. **Manual purge:** Visit the purge URLs above
3. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. **Check jsDelivr directly:** Visit `https://cdn.jsdelivr.net/gh/brikdesigns/tncld@main/header.css` to see what's being served

### CSS not loading at all

1. Verify repo is **public** (jsDelivr only works with public repos)
2. Check the `<link>` tag in Webflow Head Code is correct
3. Check browser console for 404 errors

---

## Current Custom Styles

### Navigation z-index fix
```css
.navigation {
  z-index: 1000 !important;
}
```
**Purpose:** Fixes mega nav dropdown appearing behind hero content.

---

## Related Files

- `.github/workflows/purge-cdn.yml` - GitHub Action for auto-purging CDN
- `header.css` - Custom CSS source file
- `footer.js` - Custom JS source file (if created)
