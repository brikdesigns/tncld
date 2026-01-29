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

  // Add additional module initializations here
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

  // Get utility nav height (or 0 if not present)
  const utilityNavHeight = utilityNav ? utilityNav.offsetHeight : 0;

  let hideTimer = null;
  let lastDirection = 0;

  // Configuration
  const hideDelay = 2000; // 2 seconds before hiding on scroll down

  // Set initial position below utility nav
  mainNav.style.top = utilityNavHeight + 'px';

  function hideNav() {
    mainNav.classList.add('nav-hidden');
  }

  function showNav() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    mainNav.classList.remove('nav-hidden');
  }

  function handleScroll(self) {
    const scrollY = self.scroll();
    const direction = self.direction; // 1 = down, -1 = up

    // Calculate main nav top position based on scroll
    // As user scrolls, main nav moves up until it reaches top: 0
    if (scrollY < utilityNavHeight) {
      // Utility nav still partially visible - position main nav below it
      mainNav.style.top = (utilityNavHeight - scrollY) + 'px';
      mainNav.classList.remove('nav-scrolled');
      showNav();
      lastDirection = 0;
    } else {
      // Utility nav scrolled out - fix main nav at top
      mainNav.style.top = '0px';
      mainNav.classList.add('nav-scrolled');

      // Handle hide/show based on scroll direction
      if (direction !== lastDirection) {
        lastDirection = direction;

        if (direction === 1) {
          // Scrolling DOWN - schedule hide after delay
          if (hideTimer) clearTimeout(hideTimer);
          hideTimer = setTimeout(hideNav, hideDelay);
        } else if (direction === -1) {
          // Scrolling UP - show immediately
          showNav();
        }
      }
    }
  }

  // Wait for GSAP ScrollTrigger to be ready
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: handleScroll
    });

    console.log('Sticky nav initialized (GSAP), utility nav height:', utilityNavHeight);
  } else {
    // Fallback for vanilla JS (no GSAP)
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 1 : -1;

      handleScroll({
        scroll: () => scrollY,
        direction: direction
      });

      lastScrollY = scrollY;
    }, { passive: true });

    console.log('Sticky nav initialized (vanilla), utility nav height:', utilityNavHeight);
  }
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
