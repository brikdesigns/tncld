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

  // Prevent Google Maps embeds from hijacking scroll
  initMapScrollFix();

  // Add additional module initializations here
  // Example: initFormEnhancements();
  // Example: initAccessibility();
}

// =============================================
// MODULE 1: STICKY NAV - HIDE/SHOW ON SCROLL
// =============================================
/*
 * Behavior (desktop only, JS skips tablet/mobile):
 * - Utility nav: Static in document flow, scrolls away naturally
 * - Main nav: position:sticky (CSS), sticks at top:0 when scrolled
 *   - Overlap is impossible — sticky respects document flow
 *   - No JS positioning needed, no spacer div needed
 * - Scrolling down: after 2s delay, nav slides up (hidden via transform)
 * - Scrolling up: nav slides down immediately (visible)
 * - At top of page: nav always visible, sitting below utility nav
 *
 * JS only controls: .nav-hidden, .nav-scrolled, .nav-animate classes
 */

function initStickyNav() {
  // Prevent double initialization
  if (window._stickyNavInitialized) return;
  window._stickyNavInitialized = true;

  // Skip on tablet/mobile - let Webflow handle it
  var TABLET_BREAKPOINT = 991;
  if (window.innerWidth <= TABLET_BREAKPOINT) {
    console.log('Sticky nav: Skipping on mobile/tablet');
    return;
  }

  var utilityNav = document.querySelector('.navigation.w-nav:not([data-doc-height])');
  var mainNav = document.querySelector('.navigation[data-doc-height="1"]');

  if (!mainNav) {
    console.warn('Sticky nav: main nav not found');
    return;
  }

  // Calculate threshold: scroll position where utility nav is fully off-screen
  var utilityNavHeight = utilityNav ? utilityNav.offsetHeight : 0;

  var lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  var lastDirection = 0;
  var hideTimer = null;
  var isHidden = false;
  var HIDE_DELAY = 2000;

  function showNav() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (isHidden) {
      mainNav.classList.add('nav-animate');
      mainNav.classList.remove('nav-hidden');
      isHidden = false;
    }
  }

  function hideNav() {
    if (!isHidden) {
      mainNav.classList.add('nav-animate');
      mainNav.classList.add('nav-hidden');
      isHidden = true;
    }
  }

  function handleScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var direction = scrollY > lastScrollY ? 1 : (scrollY < lastScrollY ? -1 : 0);

    // When utility nav is still visible, always show nav, no shadow
    if (scrollY < utilityNavHeight) {
      mainNav.classList.remove('nav-scrolled');
      showNav();
      lastDirection = 0;
    }
    // Past utility nav — handle hide/show behavior
    else {
      mainNav.classList.add('nav-scrolled');

      if (direction !== 0 && direction !== lastDirection) {
        lastDirection = direction;

        if (direction === 1) {
          // Scrolling DOWN - hide after delay
          if (hideTimer) clearTimeout(hideTimer);
          hideTimer = setTimeout(hideNav, HIDE_DELAY);
        } else {
          // Scrolling UP - show immediately
          showNav();
        }
      }
    }

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Recalculate utility nav height on resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > TABLET_BREAKPOINT && utilityNav) {
      utilityNavHeight = utilityNav.offsetHeight;
    }
  });

  // Run initial check
  handleScroll();
  console.log('Sticky nav initialized (position:sticky), utility nav height:', utilityNavHeight);
}

// =============================================
// MODULE 2: GOOGLE MAPS SCROLL FIX
// =============================================
/*
 * Prevents Google Maps iframes from capturing scroll events.
 * CSS sets pointer-events: none by default. Click to activate,
 * click outside or mouse-leave to deactivate.
 */

function initMapScrollFix() {
  var mapWrappers = document.querySelectorAll('.card-tour, .card-video');

  mapWrappers.forEach(function(wrapper) {
    var iframe = wrapper.querySelector('iframe[src*="google.com/maps"]');
    if (!iframe) return;

    // Click on wrapper activates the map
    wrapper.addEventListener('click', function() {
      wrapper.classList.add('map-active');
    });

    // Mouse leaving the wrapper deactivates
    wrapper.addEventListener('mouseleave', function() {
      wrapper.classList.remove('map-active');
    });
  });

  console.log('Map scroll fix initialized');
}

// =============================================
// MODULE 3: SMOOTH SCROLL
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
