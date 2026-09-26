'use strict';

(() => {
  const getLogoUrl = (isEn) => {
    if (isEn) {
      return 'https://cdn.jsdelivr.net/gh/ecanaantaiwanesechurch/web@0.4.2/web/static/logo_en.png';
    }
    return 'https://cdn.jsdelivr.net/gh/ecanaantaiwanesechurch/web@0.4.2/web/static/logo_zh.png';
  };
  // Configuration injected during build time from config/navbar-config.json
  const navbarItems = [];

  // Path mappings injected during build time from config/navbar-config.json
  const zhEnPaths = [];

  const entries = navbarItems
    .concat(navbarItems.flatMap((item) => item.items || []))
    .filter((item) => item.zhLink != null && item.enLink != null)
    .map((item) => [item.zhLink, item.enLink])
    .concat(zhEnPaths);

  const toEnPaths = Object.fromEntries(entries);
  const toZhPaths = Object.fromEntries(entries.map(([key, value]) => [value, key]));

  // State management and caching
  const state = {
    mobileMenuOpen: false,
    lastRenderedLanguage: null,
    cachedElements: {},
    resizeTimeout: null
  };

  // Initialize navbar
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootstrap);
    } else {
      bootstrap();
    }
  }

  function bootstrap() {
    window.addEventListener('popstate', updateNavbar);

    // Override history.pushState to detect navigation
    const originalPushState = history.pushState;
    history.pushState = function() {
      const ret = originalPushState.apply(history, arguments);
      updateNavbar();
      return ret;
    };

    // Handle language button clicks (registered once on document)
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        const isLanguageButton = link.hasAttribute('data-language-toggle');

        if (isLanguageButton) {
          e.preventDefault();
          const isCurrentlyEn = getCurrentLanguage();
          const newLang = isCurrentlyEn ? 'zh' : 'en';
          localStorage.setItem('lang', newLang);

          // Compute target from current path, not stale rendered href
          const currentPath = window.location.pathname;
          const mapping = isCurrentlyEn ? toZhPaths : toEnPaths;
          const targetPath = mapping[currentPath] || currentPath;

          if (targetPath !== currentPath) {
            window.location.href = targetPath;
          } else {
            // Same path, just re-render navbar in new language
            state.lastRenderedLanguage = null;
            updateNavbar();
          }
        }
      }

      // Close mobile menu when clicking outside
      if (state.mobileMenuOpen && !e.target.closest('#mobile-menu') && !e.target.closest('#mobile-menu-toggle')) {
        toggleMobileMenu();
      }
    });

    // Close mobile menu on window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768 && state.mobileMenuOpen) {
        toggleMobileMenu();
      }
    });

    if (window.MutationObserver) {
      // pushState fires before the new markup lands, so watch the DOM as well
      const rootObserver = new MutationObserver(scheduleSync);
      rootObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }

    updateNavbar();
  }

  let syncScheduled = false;

  function scheduleSync() {
    if (syncScheduled) { return; }
    syncScheduled = true;
    requestAnimationFrame(() => {
      syncScheduled = false;
      updateNavbar();
    });
  }

  function getCurrentLanguage() {
    const stored = localStorage.getItem('lang');
    if (stored) return stored === 'en';
    // No preference — detect from browser and persist
    const lang = navigator.language || navigator.userLanguage;
    const isEn = !(lang == null || lang.toLowerCase().startsWith('zh'));
    localStorage.setItem('lang', isEn ? 'en' : 'zh');
    return isEn;
  }

  function getItemUrl(item, isEn) {
    if (item.language) {
      const currentPath = window.location.pathname;
      const mapping = isEn ? toZhPaths : toEnPaths;
      return mapping[currentPath] || currentPath;
    }
    return isEn ? item.enLink || item.zhLink : item.zhLink || item.enLink;
  }

  function createDropdownItem(item, isEn) {
    const text = isEn ? item.en : item.zh;

    if (item.items && item.items.length > 0) {
      // Handle nested dropdown items with inline expansion
      const nestedItems = item.items.map(subItem => {
        const subUrl = getItemUrl(subItem, isEn);
        const subText = isEn ? subItem.en : subItem.zh;
        const targetAttr = subItem.target ? `target="${subItem.target}" rel="noopener noreferrer"` : '';
        return `
          <li>
            <a href="${subUrl || '#'}" ${targetAttr} class="px-6 py-3 text-gray-600 hover:bg-gray-50 block border-l-2 border-gray-200 ml-4 text-base">
              ${subText}
            </a>
          </li>
        `;
      }).join('');

      return `
        <li class="relative group/nested">
          <div role="button" tabindex="0" aria-expanded="false" aria-haspopup="true" class="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between desktop-nested-dropdown-toggle">
            <span>${text}</span>
            <svg class="w-4 h-4 ml-2 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <ul class="dropdown-closed transition-all duration-200 bg-gray-50">
            ${nestedItems}
          </ul>
        </li>
      `;
    }

    const url = getItemUrl(item, isEn);
    const targetAttr = item.target ? `target="${item.target}" rel="noopener noreferrer"` : '';
    return `
      <li>
        <a href="${url || '#'}" ${targetAttr} class="px-4 py-3 text-gray-700 hover:bg-gray-100 block whitespace-nowrap text-base">
          ${text}
        </a>
      </li>
    `;
  }

  function createNavItem(item, isEn) {
    const text = isEn ? item.en : item.zh;

    if (item.language) {
      const url = getItemUrl(item, isEn);
      return `
        <li class="relative">
          <a href="${url || '#'}" data-language-toggle
             class="px-1 lg:px-4 py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-sm lg:text-lg whitespace-nowrap">
            ${text}
          </a>
        </li>
      `;
    }

    if (item.items && item.items.length > 0) {
      let sortedItems = [...item.items];
      if (isEn) {
        sortedItems = sortedItems.sort((a, b) => {
          return a.enOrder - b.enOrder;
        });
      }

      const dropdownItems = sortedItems.map(subItem => createDropdownItem(subItem, isEn)).join('');

      return `
        <li class="relative group">
          <div role="button" tabindex="0" aria-expanded="false" aria-haspopup="true" class="px-1 lg:px-4 py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-sm lg:text-lg cursor-pointer whitespace-nowrap">
            ${text}
          </div>
          <ul class="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-32 w-max">
            ${dropdownItems}
          </ul>
        </li>
      `;
    }

    const url = getItemUrl(item, isEn);
    const targetAttr = item.target ? `target="${item.target}" rel="noopener noreferrer"` : '';
    return `
      <li>
        <a href="${url || '#'}" ${targetAttr}
           class="px-1 lg:px-4 py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-sm lg:text-lg whitespace-nowrap">
          ${text}
        </a>
      </li>
    `;
  }

  function createMobileNavItem(item, isEn, index, totalItems) {
    const text = isEn ? item.en : item.zh;
    const isLastItem = index === totalItems - 1;
    const borderClass = isLastItem ? '' : 'border-b border-gray-100';

    if (item.language) {
      const url = getItemUrl(item, isEn);
      return `
        <li>
          <a href="${url || '#'}" data-language-toggle
             class="block px-4 py-3 text-gray-700 hover:bg-gray-50 ${borderClass} text-base">
            ${text}
          </a>
        </li>
      `;
    }

    if (item.items && item.items.length > 0) {
      let sortedItems = [...item.items];
      if (isEn) {
        sortedItems = sortedItems.sort((a, b) => {
          return a.enOrder - b.enOrder;
        });
      }

      const subItems = sortedItems.map(subItem => {
        const subText = isEn ? subItem.en : subItem.zh;

        if (subItem.items && subItem.items.length > 0) {
          // Handle nested items in mobile
          const nestedItems = subItem.items.map(nestedItem => {
            const nestedUrl = getItemUrl(nestedItem, isEn);
            const nestedText = isEn ? nestedItem.en : nestedItem.zh;
            const targetAttr = nestedItem.target ? `target="${nestedItem.target}" rel="noopener noreferrer"` : '';
            return `
              <li>
                <a href="${nestedUrl || '#'}" ${targetAttr}
                   class="block px-8 py-2 text-gray-600 hover:bg-gray-50">
                  ${nestedText}
                </a>
              </li>
            `;
          }).join('');

          return `
            <li>
              <div role="button" tabindex="0" aria-expanded="false" aria-haspopup="true" class="w-full px-6 py-2 text-left text-gray-600 hover:bg-gray-50 flex items-center justify-between mobile-nested-dropdown-toggle bg-gray-50 cursor-pointer">
                ${subText}
                <svg class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              <ul class="dropdown-closed transition-all duration-200 bg-gray-50">
                ${nestedItems}
              </ul>
            </li>
          `;
        }

        const subUrl = getItemUrl(subItem, isEn);
        const targetAttr = subItem.target ? `target="${subItem.target}" rel="noopener noreferrer"` : '';
        return `
          <li>
            <a href="${subUrl || '#'}" ${targetAttr}
               class="block px-6 py-2 text-gray-600 hover:bg-gray-50">
              ${subText}
            </a>
          </li>
        `;
      }).join('');

      return `
        <li class="${borderClass}">
          <div role="button" tabindex="0" aria-expanded="false" aria-haspopup="true" class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center justify-between mobile-dropdown-toggle text-base cursor-pointer">
            ${text}
            <svg class="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <ul class="dropdown-closed transition-all duration-200">
            ${subItems}
          </ul>
        </li>
      `;
    }

    const url = getItemUrl(item, isEn);
    const targetAttr = item.target ? `target="${item.target}" rel="noopener noreferrer"` : '';
    return `
      <li>
        <a href="${url || '#'}" ${targetAttr}
           class="block px-4 py-3 text-gray-700 hover:bg-gray-50 ${borderClass} text-base">
          ${text}
        </a>
      </li>
    `;
  }

  function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const closeIcon = document.querySelector('.close-icon');

    state.mobileMenuOpen = !state.mobileMenuOpen;

    // Update aria attributes
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', state.mobileMenuOpen);
      mobileToggle.setAttribute('aria-label', state.mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu');
    }

    // Batch DOM updates with animations
    if (state.mobileMenuOpen) {
      // Show menu
      mobileMenu.classList.remove('hidden');
      hamburgerIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');

      // Trigger animation
      requestAnimationFrame(() => {
        mobileMenu.classList.remove('opacity-0', 'scale-95');
        mobileMenu.classList.add('opacity-100', 'scale-100');
      });
    } else {
      // Hide menu with animation
      mobileMenu.classList.remove('opacity-100', 'scale-100');
      mobileMenu.classList.add('opacity-0', 'scale-95');
      hamburgerIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');

      // Wait for animation to complete before hiding
      setTimeout(() => {
        if (!state.mobileMenuOpen) {
          mobileMenu.classList.add('hidden');
        }
      }, 200);
    }
  }

  function setupDropdowns() {
    // Handle mobile main dropdown toggles
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    mobileDropdownToggles.forEach(toggle => {
      const handleToggle = function(e) {
        e.preventDefault();

        const submenu = this.nextElementSibling;
        const icon = this.querySelector('svg');
        const isExpanded = submenu.classList.contains('dropdown-open');

        if (submenu.classList.contains('dropdown-closed')) {
          // Expand submenu
          submenu.classList.remove('dropdown-closed');
          submenu.classList.add('dropdown-open');
          icon.style.transform = 'rotate(180deg)';
          this.setAttribute('aria-expanded', 'true');
        } else {
          // Collapse submenu
          submenu.classList.remove('dropdown-open');
          submenu.classList.add('dropdown-closed');
          icon.style.transform = 'rotate(0deg)';
          this.setAttribute('aria-expanded', 'false');
        }
      };

      toggle.addEventListener('click', handleToggle);

      // Add keyboard support
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          handleToggle.call(this, e);
        }
      });
    });

    // Handle mobile nested dropdown toggles
    const mobileNestedDropdownToggles = document.querySelectorAll('.mobile-nested-dropdown-toggle');
    mobileNestedDropdownToggles.forEach(toggle => {
      const handleNestedToggle = function(e) {
        e.preventDefault();

        const submenu = this.nextElementSibling;
        const icon = this.querySelector('svg');

        if (submenu.classList.contains('dropdown-closed')) {
          // Expand nested submenu
          submenu.classList.remove('dropdown-closed');
          submenu.classList.add('dropdown-open');
          icon.style.transform = 'rotate(180deg)';
          this.setAttribute('aria-expanded', 'true');
        } else {
          // Collapse nested submenu
          submenu.classList.remove('dropdown-open');
          submenu.classList.add('dropdown-closed');
          icon.style.transform = 'rotate(0deg)';
          this.setAttribute('aria-expanded', 'false');
        }
      };

      toggle.addEventListener('click', handleNestedToggle);

      // Add keyboard support
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNestedToggle.call(this, e);
        }
      });
    });

    // Handle desktop nested dropdown toggles
    const desktopNestedDropdownToggles = document.querySelectorAll('.desktop-nested-dropdown-toggle');
    desktopNestedDropdownToggles.forEach(toggle => {
      const handleDesktopToggle = function(e) {
        e.preventDefault();

        const submenu = this.nextElementSibling;
        const icon = this.querySelector('svg');

        if (submenu.classList.contains('dropdown-closed')) {
          // Expand nested submenu
          submenu.classList.remove('dropdown-closed');
          submenu.classList.add('dropdown-open');
          icon.style.transform = 'rotate(180deg)';
          this.setAttribute('aria-expanded', 'true');
        } else {
          // Collapse nested submenu
          submenu.classList.remove('dropdown-open');
          submenu.classList.add('dropdown-closed');
          icon.style.transform = 'rotate(0deg)';
          this.setAttribute('aria-expanded', 'false');
        }
      };

      toggle.addEventListener('click', handleDesktopToggle);

      // Add keyboard support
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          handleDesktopToggle.call(this, e);
        }
      });
    });
  }

  function updateNavbar() {
    const navContainer = document.getElementById('navbar-container');
    if (!navContainer) return;

    const isEn = getCurrentLanguage();
    const currentPath = window.location.pathname;

    // Home page redirect
    if (currentPath === '/') {
      window.location.pathname = isEn ? '/en' : '/zh';
      return;
    }

    // Mapped path redirect — ensure path matches language preference
    if (isEn && toEnPaths[currentPath]) {
      window.location.pathname = toEnPaths[currentPath];
      return;
    } else if (!isEn && toZhPaths[currentPath]) {
      window.location.pathname = toZhPaths[currentPath];
      return;
    }

    // Check if we need to re-render (language changed)
    if (state.lastRenderedLanguage === isEn && navContainer.innerHTML) {
      return; // No changes needed
    }

    state.lastRenderedLanguage = isEn;
    const homeUrl = isEn ? '/en' : '/zh';
    const logoUrl = getLogoUrl(isEn);
    const navItems = navbarItems.map(item => createNavItem(item, isEn)).join('');
    const mobileNavItems = navbarItems.map((item, index) => createMobileNavItem(item, isEn, index, navbarItems.length)).join('');

    const navbarHTML = `
      <nav class="bg-white relative pb-2">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <!-- Logo -->
            <div class="flex-shrink-0">
              <a href="${homeUrl}" class="flex items-center">
                <img src="${logoUrl}" alt="Logo" class="w-auto object-contain" style="height: 48px;">
              </a>
            </div>

            <!-- Desktop Navigation -->
            <div class="hidden md:block">
              <ul class="flex items-center space-x-1">
                ${navItems}
              </ul>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden">
              <div id="mobile-menu-toggle" role="button" tabindex="0" aria-expanded="false" aria-label="Open mobile menu" class="p-2 text-gray-700 hover:text-blue-600 focus:outline-none cursor-pointer">
                <svg class="w-6 h-6 hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                <svg class="w-6 h-6 close-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div id="mobile-menu" class="hidden md:hidden absolute top-full right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-y-auto transform transition-all duration-200 ease-in-out opacity-0 scale-95 w-80 max-w-[calc(100vw-2rem)] max-h-[80vh]">
          <ul>
            ${mobileNavItems}
          </ul>
        </div>
      </nav>
    `;

    navContainer.innerHTML = navbarHTML;

    // Setup event listeners
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', toggleMobileMenu);

      // Add keyboard support for mobile toggle
      mobileToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleMobileMenu();
        }
      });
    }

    setupDropdowns();
  }

  // Public API
  window.NewNavbar = {
    init: init,
    updateNavbar: updateNavbar,
    getCurrentLanguage: getCurrentLanguage,
    toggleMobileMenu: toggleMobileMenu,
    // Cleanup method for memory management
    destroy: () => {
      // Clear cached elements
      state.cachedElements = {};
      // Remove event listeners would go here if we tracked them
    }
  };

  // Auto-initialize
  init();
})();
