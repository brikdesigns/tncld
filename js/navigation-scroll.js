/**
 * =============================================
 *     NAVIGATION SCROLL FUNCTIONALITY
 * =============================================
 * Handles sticky navigation behavior to prevent
 * the main navigation from overlapping the
 * utility navigation bar.
 * =============================================
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    utilityNavSelector: '.navbar',
    mainNavSelector: '.navigation',
    stickyClass: 'is-sticky',
    transitionDuration: 300 // ms
  };

  // State
  let utilityNav = null;
  let mainNav = null;
  let utilityNavHeight = 0;
  let mainNavOriginalTop = 0;
  let isSticky = false;
  let ticking = false;

  /**
   * Initialize the navigation scroll functionality
   */
  function init() {
    // Get navigation elements
    utilityNav = document.querySelector(CONFIG.utilityNavSelector);
    mainNav = document.querySelector(CONFIG.mainNavSelector);

    if (!utilityNav || !mainNav) {
      console.warn('⚠️ Navigation elements not found');
      return;
    }

    // Calculate initial positions
    calculateDimensions();

    // Set up scroll listener with throttling
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Apply initial state
    handleScroll();

    console.log('✅ Navigation scroll functionality initialized');
  }

  /**
   * Calculate and cache element dimensions
   */
  function calculateDimensions() {
    utilityNavHeight = utilityNav.offsetHeight;

    // Get the original top position of the main nav
    const mainNavRect = mainNav.getBoundingClientRect();
    mainNavOriginalTop = mainNavRect.top + window.pageYOffset;

    console.log(`📐 Utility nav height: ${utilityNavHeight}px`);
    console.log(`📐 Main nav original top: ${mainNavOriginalTop}px`);
  }

  /**
   * Handle scroll event with throttling
   */
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  /**
   * Handle resize event
   */
  function onResize() {
    calculateDimensions();
    handleScroll();
  }

  /**
   * Main scroll handling logic
   */
  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Check if we should make the main nav sticky
    // It becomes sticky when we've scrolled past the utility nav
    const shouldBeSticky = scrollTop >= utilityNavHeight;

    if (shouldBeSticky && !isSticky) {
      makeSticky();
    } else if (!shouldBeSticky && isSticky) {
      removeSticky();
    }
  }

  /**
   * Make the main navigation sticky
   */
  function makeSticky() {
    isSticky = true;
    mainNav.classList.add(CONFIG.stickyClass);

    // Set top position to be right below the utility nav
    mainNav.style.position = 'fixed';
    mainNav.style.top = `${utilityNavHeight}px`;
    mainNav.style.left = '0';
    mainNav.style.right = '0';
    mainNav.style.zIndex = '999';
    mainNav.style.transition = `top ${CONFIG.transitionDuration}ms ease-in-out`;

    // Add spacer to prevent content jump
    const spacer = document.createElement('div');
    spacer.className = 'nav-sticky-spacer';
    spacer.style.height = `${mainNav.offsetHeight}px`;
    mainNav.parentNode.insertBefore(spacer, mainNav.nextSibling);

    console.log('📌 Main navigation is now sticky');
  }

  /**
   * Remove sticky state from main navigation
   */
  function removeSticky() {
    isSticky = false;
    mainNav.classList.remove(CONFIG.stickyClass);

    // Reset styles
    mainNav.style.position = '';
    mainNav.style.top = '';
    mainNav.style.left = '';
    mainNav.style.right = '';
    mainNav.style.zIndex = '';
    mainNav.style.transition = '';

    // Remove spacer
    const spacer = document.querySelector('.nav-sticky-spacer');
    if (spacer) {
      spacer.remove();
    }

    console.log('📌 Main navigation is no longer sticky');
  }

  /**
   * Alternative approach: Make utility nav fixed and adjust main nav top position
   * This keeps the utility nav always visible at the top
   */
  function initFixedUtility() {
    // Make utility nav fixed
    utilityNav.style.position = 'fixed';
    utilityNav.style.top = '0';
    utilityNav.style.left = '0';
    utilityNav.style.right = '0';
    utilityNav.style.zIndex = '1001';

    // Add padding to body to prevent content from going under utility nav
    document.body.style.paddingTop = `${utilityNavHeight}px`;

    // Make main nav sticky with offset
    mainNav.style.position = 'sticky';
    mainNav.style.top = `${utilityNavHeight}px`;
    mainNav.style.zIndex = '1000';

    console.log('✅ Fixed utility navigation initialized');
  }

  // Choose initialization method
  // Comment/uncomment based on desired behavior:

  // Option 1: Sticky main nav that stops at utility nav
  document.addEventListener('DOMContentLoaded', init);

  // Option 2: Fixed utility nav with sticky main nav
  // document.addEventListener('DOMContentLoaded', initFixedUtility);

})();
