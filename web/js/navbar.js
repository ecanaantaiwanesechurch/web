'use strict';

(() => {
  const getLogoUrl = (isEn) => {
    if (isEn) {
      return 'https://cdn.jsdelivr.net/gh/ecanaantaiwanesechurch/web@main/web/static/logo_en.png';
    }
    return 'https://cdn.jsdelivr.net/gh/ecanaantaiwanesechurch/web@main/web/static/logo_zh.png';
  };
  const navbarItems = [
    {
      en: 'About Us',
      zh: '關於我們',
      items: [
        {
          en: 'Our Story',
          zh: '我們的故事',
          enLink: '/en/about-us/our-story',
          zhLink: '/about-us/our-story'
        },
        {
          en: 'Careers',
          zh: '徵人啟事',
          enLink: '/about-us/careers'
        },
        {
          en: 'Resources',
          zh: '教會資源',
          enLink: '/en/about-us/resources',
          zhLink: '/about-us/resources'
        }
      ]
    },
    {
      en: 'Worship Services',
      zh: '聚會與敬拜',
      items: [
        {
          en: 'Worship Gathering',
          zh: '時間與地點',
          enLink: '/en/gatherings/service-information',
          zhLink: '/worship/locations'
        },
        {
          en: 'Sermon Recordings',
          zh: '主日信息',
          enLink: '/en/gatherings/sermons',
          zhLink: '/sermons'
        },
        {
          en: '2025 All Church Retreat',
          zh: '2025 全教會退修會',
          enLink: 'https://retreat.ecanaan.org/'
        }
      ]
    },
    {
      en: 'Ministries',
      zh: '教會事工',
      items: [
        {
          en: 'Taiwanese Ministry',
          zh: '台語事工',
          enLink: '/ministries/taiwanese-ministry',
          enOrder: 1,
        },
        {
          en: 'Mandarin Ministry',
          zh: '華語事工',
          enLink: '/ministries/mandarin-ministry',
          enOrder: 2,
        },
        {
          en: 'English Ministry',
          zh: '英語事工',
          enLink: '/ministries/english-ministry',
          enOrder: 0,
          items: [
            {
              en: 'Home',
              zh: '主頁',
              enLink: '/ministries/english-ministry',
            },
            {
              en: 'Announcements',
              zh: '最新公告',
              enLink: '/ministries/english-ministry/announcements',
            }
          ]
        },
        {
          en: 'Youth Ministry',
          zh: '青少事工',
          enLink: '/ministries/youth-ministry',
        },
        {
          en: 'Children\'s Ministry',
          zh: '兒童事工',
          items: [
            {
              en: 'Home',
              zh: '主頁',
              enLink: '/ministries/childrens-ministry',
            },
            {
              en: 'Sunday Programs',
              zh: '主日崇拜',
              enLink: '/ministries/childrens-ministry/sunday-programs',
            },
            {
              en: 'Announcements',
              zh: '最新公告',
              enLink: '/ministries/childrens-ministry/announcements',
            },
            {
              en: '2025 VBS Summer Camp',
              zh: '2025 VBS 聖經夏令營',
              enLink: '/events/2025-vps-summer-camp',
            }
          ]
        },
        {
          en: 'Family Ministry',
          zh: '家庭事工',
          enLink: '/en/ministries/family-ministry',
          zhLink: '/ministries/family-ministry',
        },
        {
          en: 'Missions',
          zh: '宣教事工',
          items: [
            {
              en: 'Mission Support',
              zh: '宣教支持',
              enLink: '/missions/mission-support'
            },
            {
              en: '2025 STM Directory',
              zh: '2025 短宣名錄',
              enLink: '/missions/2025-stm-directory'
            },
            {
              en: '2025 STM Support Letters',
              zh: '2025 短宣代禱',
              enLink: '/missions/2025-stm-support-letters'
            },
            {
              en: '2025 STM Updates',
              zh: '2025 STM 最新消息',
              enLink: '/missions/2025-stm-updates'
            }
          ]
        }
      ]
    },
    {
      en: 'Growth',
      zh: '靈命成長',
      items: [
        {
          en: 'Sunday School',
          zh: '主日學',
          enLink: '/en/growth/sunday-school',
          zhLink: '/growth/sunday-school'
        },
        {
          en: 'Basic Christianity',
          zh: '基要真理',
          enLink: '/growth/basic-christianity'
        },
        {
          en: 'Discipleship',
          zh: '門徒訓練',
          enLink: '/growth/discipleship'
        },
        {
          en: 'Blog',
          zh: '文章分享',
          enLink: '/growth/blog'
        },
        {
          en: 'Testimony (Video)',
          zh: '見證分享 (影音)',
          enLink: '/growth/videos'
        },
        {
          en: 'Special Events',
          zh: '特別聚會',
          enLink: '/growth/special-events'
        }
      ]
    },
    {
      en: 'Fellowships',
      zh: '團契生活',
      items: [
        {
          en: 'Taiwanese Fellowships',
          zh: '台語團契',
          enLink: '/en/fellowships/tm',
          zhLink: '/fellowships/tm',
          enOrder: 1,
        },
        {
          en: 'Mandarin Fellowships',
          zh: '華語團契',
          zhLink: '/fellowships/mm',
          enOrder: 2,
        },
        {
          en: 'English Fellowships',
          zh: '英語團契',
          enLink: '/en/fellowships/en',
          enOrder: 0,
        },
        {
          en: 'Event Highlights',
          zh: '活動花絮',
          enLink: '/photos'
        }
      ]
    },
    {
      en: '中文',
      zh: 'English',
      language: true
    }
  ];

  // Path mappings for language switching
  const zhEnPaths = [
    ['/zh', '/en'],
    ['/fellowships/tm/cupertino', '/en/fellowships/tm/cupertino'],
    ['/fellowships/tm/fremont', '/en/fellowships/tm/fremont'],
    ['/fellowships/tm/mid-peninsula', '/en/fellowships/tm/mid-peninsula'],
    ['/fellowships/tm/milpitas', '/en/fellowships/tm/milpitas'],
    ['/fellowships/tm/palo-alto', '/en/fellowships/tm/palo-alto'],
    ['/fellowships/tm/saratoga', '/en/fellowships/tm/saratoga'],
    ['/fellowships/tm/living-springs', '/en/fellowships/tm/living-springs'],
    ['/fellowships/tm/living-stones', '/en/fellowships/tm/living-stones'],
    ['/fellowships/tm/tyfm', '/en/fellowships/tm/tyfm'],
  ];

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
            <a href="${subUrl || '#'}" class="px-6 py-2 text-gray-600 hover:bg-gray-50 block border-l-2 border-gray-200 ml-4">
              ${subText}
            </a>
          </li>
        `;
      }).join('');

      return `
        <li class="relative group/nested">
          <div class="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between desktop-nested-dropdown-toggle">
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
        <a href="${url || '#'}" class="px-4 py-2 text-gray-700 hover:bg-gray-100 block whitespace-nowrap">
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
             class="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-sm lg:text-base">
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
          <button class="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-sm lg:text-base">
            ${text}
          </button>
          <ul class="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-max">
            ${dropdownItems}
          </ul>
        </li>
      `;
    }

    const url = getItemUrl(item, isEn);
    return `
      <li>
        <a href="${url || '#'}"
           class="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 text-sm lg:text-base">
          ${text}
        </a>
      </li>
    `;
  }

  function createMobileNavItem(item, isEn) {
    const text = isEn ? item.en : item.zh;

    if (item.language) {
      const url = getItemUrl(item, isEn);
      return `
        <li>
          <a href="${url || '#'}"
             class="block px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 text-base">
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
              <button class="w-full px-6 py-2 text-left text-gray-600 hover:bg-gray-50 flex items-center justify-between mobile-nested-dropdown-toggle bg-gray-50">
                ${subText}
                <svg class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
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
        <li class="border-b border-gray-100">
          <button class="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center justify-between mobile-dropdown-toggle text-base">
            ${text}
            <svg class="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
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
           class="block px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100 text-base">
          ${text}
        </a>
      </li>
    `;
  }

  function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const closeIcon = document.querySelector('.close-icon');

    state.mobileMenuOpen = !state.mobileMenuOpen;

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
      toggle.addEventListener('click', function(e) {
        e.preventDefault();

        const submenu = this.nextElementSibling;
        const icon = this.querySelector('svg');

        if (submenu.classList.contains('dropdown-closed')) {
          // Expand submenu
          submenu.classList.remove('dropdown-closed');
          submenu.classList.add('dropdown-open');
          icon.style.transform = 'rotate(180deg)';
        } else {
          // Collapse submenu
          submenu.classList.remove('dropdown-open');
          submenu.classList.add('dropdown-closed');
          icon.style.transform = 'rotate(0deg)';
        }
      });
    });

    // Handle mobile nested dropdown toggles
    const mobileNestedDropdownToggles = document.querySelectorAll('.mobile-nested-dropdown-toggle');
    mobileNestedDropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();

        const submenu = this.nextElementSibling;
        const icon = this.querySelector('svg');

        if (submenu.classList.contains('dropdown-closed')) {
          // Expand nested submenu
          submenu.classList.remove('dropdown-closed');
          submenu.classList.add('dropdown-open');
          icon.style.transform = 'rotate(180deg)';
        } else {
          // Collapse nested submenu
          submenu.classList.remove('dropdown-open');
          submenu.classList.add('dropdown-closed');
          icon.style.transform = 'rotate(0deg)';
        }
      });
    });

    // Handle desktop nested dropdown toggles
    const desktopNestedDropdownToggles = document.querySelectorAll('.desktop-nested-dropdown-toggle');
    desktopNestedDropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();

        const submenu = this.nextElementSibling;
        const icon = this.querySelector('svg');

        if (submenu.classList.contains('dropdown-closed')) {
          // Expand nested submenu
          submenu.classList.remove('dropdown-closed');
          submenu.classList.add('dropdown-open');
          icon.style.transform = 'rotate(180deg)';
        } else {
          // Collapse nested submenu
          submenu.classList.remove('dropdown-open');
          submenu.classList.add('dropdown-closed');
          icon.style.transform = 'rotate(0deg)';
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
    const mobileNavItems = navbarItems.map(item => createMobileNavItem(item, isEn)).join('');

    const navbarHTML = `
      <nav class="bg-white relative pb-2">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <div class="flex-shrink-0">
              <a href="${homeUrl}" class="flex items-center">
                <img src="${logoUrl}" alt="Logo" class="h-10 w-auto object-contain">
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
              <button id="mobile-menu-toggle" class="p-2 text-gray-700 hover:text-blue-600 focus:outline-none">
                <svg class="w-6 h-6 hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                <svg class="w-6 h-6 close-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div id="mobile-menu" class="hidden md:hidden absolute top-full right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-y-auto transform transition-all duration-200 ease-in-out opacity-0 scale-95 w-80 max-w-[calc(100vw-2rem)] max-h-[80vh]">
          <ul class="py-2">
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
    }

    setupDropdowns();

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
