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
 * Last Updated: February 9, 2026
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

  // Auto-play/pause videos in modals
  initVideoModals();
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
// MODULE 4: VIDEO MODALS - AUTO-PLAY/PAUSE
// =============================================
/*
 * Auto-play mux-player videos when their parent modal opens,
 * pause and reset when the modal closes.
 *
 * How it works:
 * - Finds all <mux-player> elements inside modal wrappers
 * - Loads the mux-player web component script if not present
 * - Uses MutationObserver to detect Webflow interaction
 *   show/hide (display or class changes on the modal)
 * - Modal opens → auto-play after 300ms (animation settle)
 * - Modal closes → pause + reset to start
 *
 * Requirements in Webflow Designer:
 * - Modal wrapper class must contain "modal" (e.g. modal-video)
 * - Add HTML Embed inside modal with <mux-player> element
 * - Webflow interaction toggles modal display (show/hide)
 */

function initVideoModals() {
  var players = document.querySelectorAll('mux-player');
  if (!players.length) return;

  // Load mux-player web component if not already on page
  if (!document.querySelector('script[src*="mux-player"]')) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mux/mux-player';
    script.async = true;
    document.head.appendChild(script);
  }

  players.forEach(function(player) {
    // Find closest ancestor with "modal" in its class name
    var modal = player.closest('[class*="modal"]');
    if (!modal) return;

    var wasVisible = false;

    var observer = new MutationObserver(function() {
      var style = window.getComputedStyle(modal);
      var isVisible = style.display !== 'none' && style.visibility !== 'hidden';

      if (isVisible && !wasVisible) {
        // Modal just opened — auto-play
        wasVisible = true;
        setTimeout(function() {
          if (typeof player.play === 'function') player.play();
        }, 300);
      } else if (!isVisible && wasVisible) {
        // Modal just closed — pause and reset
        wasVisible = false;
        if (typeof player.pause === 'function') player.pause();
        if (typeof player.currentTime !== 'undefined') player.currentTime = 0;
      }
    });

    observer.observe(modal, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  });

  console.log('Video modals initialized:', players.length, 'player(s)');
}

// =============================================
// MODULE 5: FORM ENHANCEMENTS (PLACEHOLDER)
// =============================================

function initFormEnhancements() {
  // Add form validation and enhancements here
}

// =============================================
// MODULE 6: ACCESSIBILITY HELPERS (PLACEHOLDER)
// =============================================

function initAccessibility() {
  // Add accessibility enhancements here
}

// =============================================
// MODULE 7: ANALYTICS & TRACKING (PLACEHOLDER)
// =============================================

function initAnalytics() {
  // Add analytics event tracking here
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
