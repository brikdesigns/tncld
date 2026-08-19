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

  // WCAG 2.1 AA remediation — added 2026-04-20
  initAccessibility();
}

// =============================================
// MODULE: ACCESSIBILITY (WCAG 2.1 AA)
// =============================================
/*
 * Remediates issues flagged by Lighthouse/axe:
 *   - Missing <main> landmark         (landmark-one-main)
 *   - Links without accessible name   (link-name: logo, social icons)
 *   - Heading order violations        (heading-order: eyebrow h6s)
 *   - Untitled review-widget iframe   (frame-title: GHL reviews embed)
 *
 * Runs after DOM ready. Safe to run on every page — each fix
 * checks for existing correct markup before making changes.
 *
 * Audit report: markdown/legal-drafts/README.md
 */

function initAccessibility() {
  try {
    addMainLandmark();
    labelLogoLinks();
    labelSocialIcons();
    demoteEyebrowHeadings();
    labelReviewWidgets();
    initFormErrorAnnouncements();
  } catch (err) {
    console.warn('a11y init error:', err);
  }
}

// Add role="main" to the primary content container if no <main> exists.
// Finds the first non-modal <section> and marks its direct parent (or itself)
// as the main landmark. role="main" is equivalent to a <main> element for AT.
function addMainLandmark() {
  if (document.querySelector('main, [role="main"]')) return;
  var firstSection = document.querySelector(
    'section:not([id^="modal-"]):not(.modal-1):not(.modal-2):not(.modal-3):not(.modal-form-new)'
  );
  if (!firstSection) return;
  firstSection.setAttribute('role', 'main');
}

// Add aria-label to logo links — they wrap an SVG/img with no text node.
function labelLogoLinks() {
  var logos = document.querySelectorAll('a.logo');
  logos.forEach(function(a) {
    if (a.getAttribute('aria-label') || a.textContent.trim()) return;
    a.setAttribute('aria-label', 'Tennessee Center for Laser Dentistry — Home');
  });
}

// Add aria-labels to social icon links based on their href.
function labelSocialIcons() {
  var map = [
    { match: 'facebook.com', label: 'TNCLD on Facebook' },
    { match: 'linkedin.com', label: 'TNCLD on LinkedIn' },
    { match: 'yelp.com', label: 'TNCLD on Yelp' },
    { match: 'youtube.com', label: 'TNCLD on YouTube' },
    { match: 'instagram.com', label: 'TNCLD on Instagram' },
    { match: 'tiktok.com', label: 'TNCLD on TikTok' },
    { match: 'twitter.com', label: 'TNCLD on Twitter' },
    { match: 'x.com', label: 'TNCLD on X' }
  ];
  var icons = document.querySelectorAll(
    '.social-wrapper a, a.icon-md[target="_blank"], a.icon-sm[target="_blank"]'
  );
  icons.forEach(function(a) {
    if (a.getAttribute('aria-label') || a.textContent.trim()) return;
    var href = a.getAttribute('href') || '';
    var entry = map.find(function(m) { return href.indexOf(m.match) !== -1; });
    if (entry) {
      a.setAttribute('aria-label', entry.label);
    } else if (href) {
      a.setAttribute('aria-label', 'External link: ' + href.replace(/^https?:\/\//, '').split('/')[0]);
    }
  });
}

// Eyebrow/kicker text is styled as <h6 class="text_label-md"> in the theme
// but is not a real heading — it precedes an h2/h3 and breaks heading order.
// role="presentation" removes it from the heading outline while preserving
// the text for screen readers. Proper fix is changing the tag in Webflow
// Designer to <p> or <div>, but this prevents the axe violation in the
// meantime without visual change.
function demoteEyebrowHeadings() {
  var eyebrows = document.querySelectorAll('h6.text_label-md, h6.brand, h4.subtitle');
  eyebrows.forEach(function(h) {
    if (!h.hasAttribute('role')) {
      h.setAttribute('role', 'presentation');
    }
  });
}

// The GoHighLevel review widget embed renders a bare <iframe> with no title,
// which fails WCAG 2.1 AA 4.1.2 (axe: frame-title) — a screen reader announces
// an unlabelled frame. The vendor's review-widget.js only resizes the iframe,
// it never recreates it, so a one-shot label at DOM-ready holds. Proper fix is
// adding title= to the html-embed in Webflow Designer (tncld#25); Webflow's
// Data API cannot write html-embed nodes (secondary-locale only), so this
// closes the violation in the meantime.
function labelReviewWidgets() {
  var frames = document.querySelectorAll('iframe.lc_reviews_widget');
  frames.forEach(function(f) {
    if (f.getAttribute('title')) return;
    f.setAttribute('title', 'Google reviews for Tennessee Center for Laser Dentistry');
  });
}

// Per-field error announcement for /contact + /request-appointment forms.
// Webflow's native form UX shows a single generic .w-form-fail banner
// ("Oops! Something went wrong...") which is too vague for healthcare
// users and not announced by screen readers. This wires:
//   - role="alert" + aria-live="polite" on .w-form-fail and .w-form-done
//   - Per-field error containers linked via aria-describedby
//   - Plain-language messages from HTML5 Constraint Validation
//   - novalidate on the form to suppress duelling browser-native popups
//   - Capture-phase submit handler so validation runs before Webflow's
//     own jQuery submit handler (we preventDefault if invalid, otherwise
//     pass through unchanged)
//   - Focus moves to first invalid field on submit failure
//   - Errors auto-clear when the user starts correcting the field
// Targets only the two known healthcare forms by ID; safe no-op elsewhere.
function initFormErrorAnnouncements() {
  var forms = document.querySelectorAll(
    '#wf-form-Contact-Us-Form, #wf-form-Request-Appointment-Form'
  );
  if (!forms.length) return;
  forms.forEach(enhanceFormErrors);
  console.log('Form error announcements initialized:', forms.length, 'form(s)');
}

function enhanceFormErrors(form) {
  if (form.dataset.a11yEnhanced === 'true') return;
  form.dataset.a11yEnhanced = 'true';

  // Suppress browser-native validity popups so our custom messages win
  form.setAttribute('novalidate', '');

  // Mark Webflow's success + failure regions as live so SR announces them
  var wrapper = form.closest('.w-form');
  if (wrapper) {
    var failDiv = wrapper.querySelector('.w-form-fail');
    if (failDiv) {
      failDiv.setAttribute('role', 'alert');
      failDiv.setAttribute('aria-live', 'polite');
    }
    var doneDiv = wrapper.querySelector('.w-form-done');
    if (doneDiv) {
      doneDiv.setAttribute('role', 'status');
      doneDiv.setAttribute('aria-live', 'polite');
    }
  }

  // Build per-field error containers + wire aria-describedby
  var fields = collectValidatableFields(form);
  fields.forEach(function(field) {
    ensureErrorContainer(form, field);
    field.addEventListener('input', function() { clearFieldError(field); });
    field.addEventListener('change', function() { clearFieldError(field); });
  });

  // Capture-phase submit handler — runs before Webflow's jQuery handler
  form.addEventListener('submit', function(e) {
    var invalid = validateFormFields(form);
    if (invalid.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      invalid.forEach(function(item) {
        showFieldError(item.field, item.message);
      });
      // Move focus to the first invalid field for keyboard + SR users
      try {
        invalid[0].field.focus({ preventScroll: false });
      } catch (err) {
        console.warn('could not focus first invalid field:', err);
      }
    }
  }, true);
}

function collectValidatableFields(form) {
  var nodes = form.querySelectorAll('input, textarea, select');
  var fields = [];
  for (var i = 0; i < nodes.length; i++) {
    var f = nodes[i];
    var type = (f.type || '').toLowerCase();
    if (type === 'submit' || type === 'button' || type === 'hidden' || type === 'reset') continue;
    if (!f.id) continue;
    fields.push(f);
  }
  return fields;
}

function ensureErrorContainer(form, field) {
  var errorId = field.id + '-error';
  var existing = form.querySelector('#' + cssEscape(errorId));
  if (existing) {
    appendDescribedBy(field, errorId);
    return;
  }
  var errorEl = document.createElement('div');
  errorEl.id = errorId;
  errorEl.className = 'field-error';
  errorEl.setAttribute('aria-live', 'polite');
  errorEl.hidden = true;
  // Insert directly after the field — keeps the error inside the field's
  // wrapper for layout, and right after the input in DOM order for SR.
  if (field.nextSibling) {
    field.parentNode.insertBefore(errorEl, field.nextSibling);
  } else {
    field.parentNode.appendChild(errorEl);
  }
  appendDescribedBy(field, errorId);
}

function appendDescribedBy(field, errorId) {
  var current = field.getAttribute('aria-describedby') || '';
  var ids = current.split(/\s+/).filter(Boolean);
  if (ids.indexOf(errorId) === -1) {
    ids.push(errorId);
    field.setAttribute('aria-describedby', ids.join(' '));
  }
}

function validateFormFields(form) {
  var invalid = [];
  collectValidatableFields(form).forEach(function(field) {
    var msg = getFieldErrorMessage(field);
    if (msg) invalid.push({ field: field, message: msg });
  });
  return invalid;
}

// Plain-language messages derived from HTML5 Constraint Validation.
// Healthcare standard wants natural language ("Please enter your email"),
// not browser-default strings like "Invalid value."
function getFieldErrorMessage(field) {
  if (typeof field.checkValidity !== 'function') return null;
  if (field.checkValidity()) return null;

  var v = field.validity;
  var label = getFieldLabelText(field);

  if (v.valueMissing) {
    if (field.type === 'checkbox' || field.type === 'radio') {
      return 'Please check ' + label;
    }
    if (field.tagName === 'SELECT') {
      return 'Please choose ' + label;
    }
    return 'Please enter your ' + label.toLowerCase();
  }
  if (v.typeMismatch && field.type === 'email') {
    return 'Please enter a valid email address';
  }
  if (v.typeMismatch && field.type === 'url') {
    return 'Please enter a valid URL';
  }
  if (v.tooShort) {
    return label + ' must be at least ' + field.minLength + ' characters';
  }
  if (v.tooLong) {
    return label + ' must be no more than ' + field.maxLength + ' characters';
  }
  if (v.patternMismatch) {
    return 'Please match the requested format for ' + label.toLowerCase();
  }
  return 'Please correct ' + label.toLowerCase();
}

// Resolve a human-readable label name in priority order:
//   1. aria-labelledby target text (preferred — matches our Designer wiring)
//   2. aria-label attribute
//   3. .labels collection (native <label for=>)
//   4. The field's name attribute
// Strips a trailing " *" required indicator so messages read naturally.
function getFieldLabelText(field) {
  var labelText = '';
  var labelledBy = field.getAttribute('aria-labelledby');
  if (labelledBy) {
    var lbl = document.getElementById(labelledBy);
    if (lbl) labelText = lbl.textContent;
  }
  if (!labelText) {
    labelText = field.getAttribute('aria-label') || '';
  }
  if (!labelText && field.labels && field.labels.length) {
    labelText = field.labels[0].textContent;
  }
  if (!labelText) labelText = field.name || 'this field';
  return labelText.trim().replace(/\s*\*\s*$/, '');
}

function showFieldError(field, message) {
  var errorEl = document.getElementById(field.id + '-error');
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.hidden = false;
  field.setAttribute('aria-invalid', 'true');
}

function clearFieldError(field) {
  var errorEl = document.getElementById(field.id + '-error');
  if (!errorEl) return;
  if (errorEl.hidden) return;
  errorEl.textContent = '';
  errorEl.hidden = true;
  field.removeAttribute('aria-invalid');
}

// CSS.escape polyfill — Webflow auto-generated IDs can contain
// characters that need escaping in selectors (none in this site
// today, but cheap insurance against future IDs).
function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === 'function') {
    return window.CSS.escape(value);
  }
  return String(value).replace(/([^a-zA-Z0-9_-])/g, '\\$1');
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
            try {
              player.play();
            } catch (e) {
              console.warn('modal video play failed:', e);
            }
          }, 400);
        } else if (!isVisible && wasVisible) {
          wasVisible = false;
          try {
            player.pause();
            player.currentTime = 0;
          } catch (e) {
            console.warn('modal video pause failed:', e);
          }
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
    'star':           '\uf005',
    'check-circle':   '\uf058',
    'circle-check':   '\uf058'
  };

  var els = document.querySelectorAll('.icon-sm, .icon-md, .icon-lg, .icon-xl, .icon-huge');
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
