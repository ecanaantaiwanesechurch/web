'use strict';

(() => {
  const getLogoUrl = (isEn) => {
    if (isEn) {
      return 'https://cdn.jsdelivr.net/gh/ecanaantaiwanesechurch/web@main/web/static/logo_en.png';
    }
    return 'https://cdn.jsdelivr.net/gh/ecanaantaiwanesechurch/web@main/web/static/logo_zh.png';
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

  // Utility functions
  const utils = {
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    getElement: (selector) => {
      if (!state.cachedElements[selector]) {
        state.cachedElements[selector] = document.querySelector(selector);
      }
      return state.cachedElements[selector];
    },

    // Calculate optimal height for mobile menu based on content
    calculateMobileMenuHeight: () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (!mobileMenu) return null;

      const ul = mobileMenu.querySelector('ul');
      const contentHeight = ul ? ul.scrollHeight : 0;
      const padding = parseInt(getComputedStyle(document.documentElement).fontSize) * 0.5; // py-2 = 0.5rem top + 0.5rem bottom
      const neededHeight = contentHeight + padding;
      const viewportHeight = window.innerHeight;
      const maxAllowed = viewportHeight * 0.8;

      // Get default min height from CSS custom property or fallback
      const minHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--mobile-menu-min-height')) ||
                       Math.min(24 * parseInt(getComputedStyle(document.documentElement).fontSize), viewportHeight * 0.6);

      return Math.max(Math.min(neededHeight, maxAllowed), minHeight);
    }
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
    window.addEventListener('hashchange', updateNavbar);

    // Override history.pushState to detect navigation
    const originalPushState = history.pushState;
    history.pushState = function() {
      const ret = originalPushState.apply(history, arguments);
      updateNavbar();
      return ret;
    };

    updateNavbar();
  }

  function getCurrentLanguage() {
    // Always check current URL for language, don't cache this
    return window.location.hash === '#en' || window.location.pathname.startsWith('/en');
  }

  function getItemUrl(item, isEn) {
    if (item.language) {
      const currentPath = window.location.pathname;
      // Language button shows opposite language
      // If currently English (isEn=true), button shows "中文" and should go to Chinese (no hash)
      // If currently Chinese (isEn=false), button shows "English" and should go to English (#en)
      const mapping = isEn ? toZhPaths : toEnPaths;
      let url = mapping[currentPath] || currentPath;
      const finalUrl = isEn ? url : `${url}#en`;
      return finalUrl;
    }

    let url = isEn ? item.enLink || item.zhLink : item.zhLink || item.enLink;
    if (isEn && url && !url.startsWith('http')) {
      url = `${url}#en`;
    }
    return url;
  }

  function createDropdownItem(item, isEn) {
    const text = isEn ? item.en : item.zh;

    if (item.items && item.items.length > 0) {
      // Handle nested dropdown items with inline expansion
      const nestedItems = item.items.map(subItem => {
        const subUrl = getItemUrl(subItem, isEn);
        const subText = isEn ? subItem.en : subItem.zh;
        return `
          <li>
            <a href="${subUrl || '#'}" class="px-6 py-3 text-gray-600 hover:bg-gray-50 block border-l-2 border-gray-200 ml-4 text-base">
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
    return `
      <li>
        <a href="${url || '#'}" class="px-4 py-3 text-gray-700 hover:bg-gray-100 block whitespace-nowrap text-base">
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
          <a href="${url || '#'}"
             class="px-2 lg:px-4 py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-base lg:text-lg whitespace-nowrap">
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
          <div role="button" tabindex="0" aria-expanded="false" aria-haspopup="true" class="px-2 lg:px-4 py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-base lg:text-lg cursor-pointer whitespace-nowrap">
            ${text}
          </div>
          <ul class="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-32 w-max">
            ${dropdownItems}
          </ul>
        </li>
      `;
    }

    const url = getItemUrl(item, isEn);
    return `
      <li>
        <a href="${url || '#'}"
           class="px-2 lg:px-4 py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-base lg:text-lg whitespace-nowrap">
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
          <a href="${url || '#'}"
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
            return `
              <li>
                <a href="${nestedUrl || '#'}"
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
        return `
          <li>
            <a href="${subUrl || '#'}"
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
    return `
      <li>
        <a href="${url || '#'}"
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

    updateFooterIcons();

    // Handle language button clicks
    navContainer.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        // Check if this is a language toggle button
        const isLanguageButton = link.textContent.trim() === 'English' || link.textContent.trim() === '中文';

        if (isLanguageButton) {
          e.preventDefault(); // Prevent default navigation

          const targetUrl = new URL(link.href);
          const currentUrl = new URL(window.location.href);

          // Only update if URL is different
          if (targetUrl.pathname !== currentUrl.pathname || targetUrl.hash !== currentUrl.hash) {
            // Check if only hash is different (same page)
            if (targetUrl.pathname === currentUrl.pathname) {
              // Just update the hash without page reload
              window.location.hash = targetUrl.hash;
            } else {
              // Different page, navigate normally
              window.location.href = link.href;
            }
          }
        }
      }
    });

    // Close mobile menu when clicking outside (with event delegation)
    document.addEventListener('click', function(e) {
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
  }

  function updateFooterIcons() {
    const footerIconContainer = document.getElementsByClassName('super-footer__icons')[0];
    if (!footerIconContainer) { return; }

    const icons = footerIconContainer.getElementsByTagName('a');
    if (icons.length == 0) { return; }

    const lastIcon = icons[icons.length - 1];
    const href = lastIcon.href || '';
    if (href.includes('tithe.ly')) { return; }

    const giving = document.createElement('a');
    giving.href = 'https://tithe.ly/give_new/www/#/tithely/give-one-time/775254';
    giving.innerHTML = '<svg data-v-c759af74="" viewBox="0 0 43 45" height="24" width="24" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-aquamarine"><path xmlns="http://www.w3.org/2000/svg" d="M21.5592 22.6139C25.2962 21.076 28.1132 17.7722 28.4582 13.8987L28.5157 13.0443C28.5157 7.8038 25.8136 3.13291 21.6167 0C17.4199 3.13291 14.5453 7.8038 14.5453 13.0443L14.6028 13.8987C14.9477 17.7722 17.7648 21.076 21.5592 22.6139ZM19.777 28.7089C19.547 27.9114 19.2596 27.1709 18.8571 26.4304C18.0523 24.7215 16.8449 23.2405 15.3502 22.1013C13.1655 20.3924 10.3484 19.424 7.58885 19.424H0C0 20.3924 0 21.3038 0 22.2722C0.0574913 23.924 0.517421 25.5759 1.20732 27.057C2.01219 28.7658 3.21951 30.2468 4.71429 31.3861C6.84146 33.0949 9.60104 34.1772 12.3606 34.1772H19.9495C19.9495 32.1835 20.0645 29.7342 19.777 28.7089ZM23.9164 26.4304C23.5714 27.1709 23.2265 27.9114 22.9965 28.7089C22.824 29.5063 22.824 31.1582 22.824 32.8101C22.824 33.2658 22.824 33.7215 22.824 34.1772V36.7975L22.4791 44.5443H23.9164C23.9164 44.3165 23.9739 44.0316 23.9739 43.8038C24.0888 41.6392 24.2613 39.3038 24.5488 37.3671C24.8937 35.2025 27.2509 34.2911 28.9756 34.2342H30.4129C33.1725 34.2342 35.8746 33.1519 38.0592 31.443C39.554 30.3038 40.7613 28.8228 41.5662 27.1139C42.3136 25.6329 42.716 23.981 42.7735 22.3291C42.7735 21.9873 42.7735 21.7025 42.7735 21.3608C42.7735 20.7342 42.7735 20.1076 42.7735 19.481H35.1847C32.4251 19.481 29.608 20.4494 27.4233 22.1582C25.9286 23.2975 24.7213 24.7785 23.9164 26.4304Z" fill="rgb(91, 217, 164"></path></svg>';
    //giving.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(91, 217, 164)" stroke-width="2"><path d="M11 20a7 7 0 0 1-7-7v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a7 7 0 0 0 7 7"/><path d="M13 20a7 7 0 0 0 7-7v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3a7 7 0 0 1-7 7"/><path d="M16 7.5c0-1.38-1.12-2.5-2.5-2.5S11 6.12 11 7.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5z"/></svg>';
    giving.target = '_blank';
    giving.rel = 'noopener noreferrer';

    footerIconContainer.insertBefore(giving, lastIcon.nextSibling);
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
