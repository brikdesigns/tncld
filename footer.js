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
  // Fix FA icon ligatures for Safari (run first for fastest visual fix)
  initIconFix();

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
 * - Waits for the mux-player custom element to be registered
 *   (embeds load the script; this code just waits for it)
 * - Uses MutationObserver to detect Webflow IX2 interaction
 *   show/hide (style or class changes on the modal)
 * - Modal opens → auto-play after 300ms (animation settle)
 * - Modal closes → pause + reset to start
 *
 * Live structure (patient-stories page):
 * - modal-1, modal-2, modal-3 (section elements)
 * - Each contains: .modal-container > .video-frame-wide > .vid > mux-player
 * - Webflow IX2 toggles display on the modal section
 */

function initVideoModals() {
  // Target modals that contain mux-player embeds
  var modals = document.querySelectorAll('[class*="modal-"]');
  if (!modals.length) return;

  // Filter to only modals that actually contain a mux-player
  var videoModals = [];
  modals.forEach(function(modal) {
    var player = modal.querySelector('mux-player');
    if (player) videoModals.push({ modal: modal, player: player });
  });

  if (!videoModals.length) return;

  // Wait for mux-player custom element to be registered
  // (the embeds load the script; we just need to wait for it)
  function setupObservers() {
    videoModals.forEach(function(item) {
      var modal = item.modal;
      var player = item.player;
      var wasVisible = false;

      var observer = new MutationObserver(function() {
        var style = window.getComputedStyle(modal);
        var isVisible = style.display !== 'none' &&
                        style.visibility !== 'hidden' &&
                        style.opacity !== '0';

        if (isVisible && !wasVisible) {
          wasVisible = true;
          // Delay to let modal animation settle + mux-player render
          setTimeout(function() {
            try { player.play(); } catch(e) {}
          }, 400);
        } else if (!isVisible && wasVisible) {
          wasVisible = false;
          try {
            player.pause();
            player.currentTime = 0;
          } catch(e) {}
        }
      });

      observer.observe(modal, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    });

    console.log('Video modals initialized:', videoModals.length, 'player(s)');
  }

  // mux-player is a custom element — wait for it to be defined
  if (window.customElements && customElements.get('mux-player')) {
    setupObservers();
  } else if (window.customElements && customElements.whenDefined) {
    customElements.whenDefined('mux-player').then(setupObservers);
    // Fallback timeout in case script never loads
    setTimeout(function() {
      if (!customElements.get('mux-player')) {
        console.warn('Video modals: mux-player not defined after 10s');
        setupObservers(); // Set up observers anyway
      }
    }, 10000);
  } else {
    // No customElements API — set up immediately
    setupObservers();
  }
}

// =============================================
// MODULE 5: FA ICON LIGATURE FIX (SAFARI)
// =============================================
/*
 * Safari doesn't render Font Awesome ligature icons in web fonts.
 * This replaces ligature text (e.g. "arrow-up-right") with Unicode
 * codepoints (e.g. "\ue09f") which render correctly in all browsers.
 *
 * Only targets elements with .icon-sm, .icon-md, .icon-lg, .icon-xl
 *
 * To add a new icon: find its Unicode at fontawesome.com/icons,
 * then add to the map below as 'ligature-name': '\uXXXX'
 */

function initIconFix() {
  // FA6 Pro ligature name → Unicode codepoint
  var icons = {
    'arrow-up-right': '\ue09f',
    'xmark':          '\uf00d',
    'phone':          '\uf095',
    'map-pin':        '\uf3c5',
    'message':        '\uf27a',
    'star':           '\uf005'
  };

  var els = document.querySelectorAll('.icon-sm, .icon-md, .icon-lg, .icon-xl');
  var count = 0;

  els.forEach(function(el) {
    var text = el.textContent.trim();
    if (!text) return;
    var unicode = icons[text.toLowerCase()];
    if (unicode) {
      el.textContent = unicode;
      count++;
    }
  });

  if (count) {
    console.log('FA icon fix: replaced ' + count + ' ligature(s) with Unicode');
  }
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
