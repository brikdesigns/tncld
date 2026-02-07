// =============================================
//     TNCLD - CUSTOM JAVASCRIPT (FOOTER CODE)
//     Tennessee Centers for Laser Dentistry
// =============================================
//  Copy to Webflow: Settings > Custom Code
//              > Footer Code
//  Wrap in <script> tags when transferring
// =============================================

/*
 * This file contains custom JavaScript for the TNCLD website.
 * Add scripts here for local development, then transfer
 * to Webflow Custom Code > Footer Code when ready.
 *
 * Created: January 16, 2026
 * Last Updated: January 16, 2026
 */

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('TNCLD custom scripts loaded');

  // Initialize all modules
  initializeModules();
});

function initializeModules() {
  // Initialize sticky navigation
  initStickyNav();

  // Initialize smooth scrolling for anchor links
  initSmoothScroll();

  // Fix responsive image sizes attribute
  initResponsiveImages();

  // Add additional module initializations here
  // Example: initFormEnhancements();
  // Example: initAccessibility();
}

// =============================================
// MODULE 1: STICKY NAV - NO OVERLAP FIX
// =============================================
/*
 * Updated Behavior (NO OVERLAP):
 * - Utility nav: Fixed at top, always visible
 * - Main nav: Sticky below utility nav, never overlaps
 *
 * This replaces the previous hide/show behavior with a
 * simpler sticky approach that prevents overlap.
 */

function initStickyNav() {
  // Skip sticky nav on tablet/mobile - let Webflow handle it
  const TABLET_BREAKPOINT = 991;
  if (window.innerWidth <= TABLET_BREAKPOINT) {
    console.log('Sticky nav: Skipping on mobile/tablet viewport');
    return;
  }

  // Get both navigation elements
  const utilityNav = document.querySelector('.navigation.w-nav:not([data-doc-height])');
  const mainNav = document.querySelector('.navigation[data-doc-height="1"]');

  if (!mainNav) {
    console.warn('Sticky nav: .navigation[data-doc-height="1"] not found');
    return;
  }

  // Calculate utility nav height
  const utilityNavHeight = utilityNav ? utilityNav.offsetHeight : 0;

  // Set main nav sticky position to be below utility nav
  mainNav.style.top = utilityNavHeight + 'px';

  // Add body padding to prevent content from going under fixed utility nav
  document.body.style.paddingTop = utilityNavHeight + 'px';

  console.log('Sticky nav initialized (no overlap), utility nav height:', utilityNavHeight);

  // Simple scroll handler - just adds shadow when scrolled
  function handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Add shadow class when scrolled past utility nav
    if (scrollY > utilityNavHeight) {
      mainNav.classList.add('nav-scrolled');
    } else {
      mainNav.classList.remove('nav-scrolled');
    }
  }

  // Use native scroll listener (no GSAP dependency)
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Handle resize - recalculate heights if nav size changes
  window.addEventListener('resize', function() {
    if (window.innerWidth > TABLET_BREAKPOINT && utilityNav) {
      const newHeight = utilityNav.offsetHeight;
      mainNav.style.top = newHeight + 'px';
      document.body.style.paddingTop = newHeight + 'px';
      console.log('Sticky nav: Heights recalculated on resize:', newHeight);
    }
  });

  // Run initial check
  handleScroll();
}

// =============================================
// MODULE 2: SMOOTH SCROLL
// =============================================
/*
 * Smooth scrolling for anchor links with fixed nav offset
 * Uses native CSS scroll-behavior: smooth (set in header.css)
 */

function initSmoothScroll() {
  // Offset for fixed navigation height
  const navOffset = 80;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');

      // Skip if just "#" or empty
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();

      // Calculate position with nav offset
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navOffset;

      // Smooth scroll (uses CSS scroll-behavior: smooth)
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });

  console.log('Smooth scroll initialized');
}

// =============================================
// MODULE 3: RESPONSIVE IMAGES - SIZES FIX
// =============================================
/*
 * Fix: Webflow auto-generates incorrect sizes attribute
 * causing browser to select lower-res srcset variants
 *
 * This overrides the sizes attribute to ensure proper
 * image resolution on large viewports and retina displays
 */

function initResponsiveImages() {
  // Target full-width image frames
  const fullWidthSelectors = [
    '.img-frame-16-9-wide img',
    '.img-frame-portrait img',
    '.img-frame-landscape img',
    '.container-full img'
  ];

  // Target contained images (within container-lg)
  const containedSelectors = [
    '.container-lg .img-frame-landscape.sm img',
    '.mega-nav-wrapper img'
  ];

  // Set full-width images to 100vw
  document.querySelectorAll(fullWidthSelectors.join(', ')).forEach(img => {
    img.setAttribute('sizes', '100vw');
  });

  // Set contained images to container max-width
  // Accounts for ~1200px max-width container
  document.querySelectorAll(containedSelectors.join(', ')).forEach(img => {
    img.setAttribute('sizes', '(max-width: 1200px) 100vw, 1200px');
  });

  console.log('Responsive images sizes fixed');
}

// =============================================
// MODULE 4: FORM ENHANCEMENTS
// =============================================

function initFormEnhancements() {
  // Add form validation and enhancements here
  // Example: Custom validation messages
  // Example: Input formatting (phone numbers, etc.)
}

// =============================================
// MODULE 3: ACCESSIBILITY HELPERS
// =============================================

function initAccessibility() {
  // Add accessibility enhancements here
  // Example: Skip links
  // Example: Focus management
  // Example: ARIA live regions
}

// =============================================
// MODULE 4: ANALYTICS & TRACKING
// =============================================

function initAnalytics() {
  // Add analytics event tracking here
  // Example: Button click tracking
  // Example: Form submission tracking
  // Example: Scroll depth tracking
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for rate limiting
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// =============================================
// END OF FILE
// =============================================
