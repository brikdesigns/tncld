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

  // Add additional module initializations here
  // Example: initSmoothScroll();
  // Example: initFormEnhancements();
  // Example: initAccessibility();
}

// =============================================
// MODULE 1: STICKY NAV - SCROLL ANIMATION
// =============================================
/*
 * Pattern: Hide on scroll-down, show on scroll-up
 * Based on brik-bds animation library patterns
 *
 * Behavior:
 * - Nav hides when scrolling down (user reading content)
 * - Nav shows when scrolling up (user wants to navigate)
 * - Nav always visible at top of page
 * - Adds shadow when scrolled past threshold
 */

function initStickyNav() {
  // Target the MAIN nav (has data-doc-height), not the utility nav
  const nav = document.querySelector('.navigation[data-doc-height="1"]');
  if (!nav) {
    console.warn('Sticky nav: Main .navigation element not found');
    return;
  }

  let lastScrollY = 0;

  // Threshold before hiding nav (prevents jitter at top)
  const scrollThreshold = 100;
  // Minimum scroll delta to trigger show/hide
  const scrollDelta = 10;

  function getScrollY() {
    // Support both GSAP ScrollSmoother and regular scrolling
    if (window.ScrollTrigger) {
      return window.ScrollTrigger.scrollerProxy
        ? ScrollTrigger.scrollerProxy().scrollTop
        : window.scrollY;
    }
    return window.scrollY || document.documentElement.scrollTop;
  }

  function updateNav() {
    const currentScrollY = getScrollY();
    const scrollDiff = currentScrollY - lastScrollY;

    // Always show nav when near top of page
    if (currentScrollY < scrollThreshold) {
      nav.classList.remove('nav-hidden');
      nav.classList.remove('nav-scrolled');
    } else {
      // Add scrolled state (for shadow)
      nav.classList.add('nav-scrolled');

      // Only toggle if scroll delta is significant
      if (Math.abs(scrollDiff) > scrollDelta) {
        if (scrollDiff > 0) {
          // Scrolling DOWN - hide nav
          nav.classList.add('nav-hidden');
        } else {
          // Scrolling UP - show nav
          nav.classList.remove('nav-hidden');
        }
      }
    }

    lastScrollY = currentScrollY;
  }

  // Check if GSAP ScrollTrigger is available
  if (window.ScrollTrigger) {
    // Use GSAP ScrollTrigger for scroll events (works with ScrollSmoother)
    ScrollTrigger.create({
      onUpdate: updateNav,
      start: 0,
      end: 'max'
    });
    console.log('Sticky nav initialized (GSAP mode)');
  } else {
    // Fallback to vanilla scroll events
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateNav();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    console.log('Sticky nav initialized (vanilla mode)');
  }

  // Initialize state on load
  updateNav();
}

// =============================================
// MODULE 2: SMOOTH SCROLL (Example)
// =============================================

function initSmoothScroll() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// =============================================
// MODULE 2: FORM ENHANCEMENTS
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
