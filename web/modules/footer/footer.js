'use strict';

/* Site footer: replaces Super's footer with our own, in the page language.
 * Coupled to footer.css - this renders the markup, that styles it. */

(() => {

  const MAPS = 'https://goo.gl/maps/6na4xr1wNLTtx7BV9';
  const TEL = 'tel:+1-408-942-2822';
  const INSTAGRAM = 'https://www.instagram.com/canaan_tw_church/';
  const FACEBOOK = 'https://www.facebook.com/canaanmandarin/';
  const GIVE = 'https://tithe.ly/give_new/www/#/tithely/give-one-time/775254';

  const COPY = {
    en: { name: 'Canaan', sub: 'Taiwanese Christian Church', owner: 'Canaan Taiwanese Christian Church', give: 'Give' },
    zh: { name: '迦南臺灣基督教會', sub: 'Canaan Taiwanese Christian Church', owner: '迦南臺灣基督教會 Canaan Taiwanese Christian Church', give: '奉獻' },
  };

  const MARK = 'M53.906 51.008L51.3382 55.453C53.5056 57.312 54.7466 59.957 54.7466 62.816C54.7466 68.191 50.3731 72.562 45.0005 72.562C39.6269 72.562 35.2574 68.191 35.2574 62.816C35.2574 59.957 36.4984 57.312 38.6658 55.453L36.098 51.008C34.8181 51.598 33.4645 51.91 32.0551 51.91C26.6826 51.91 22.313 47.539 22.313 42.164C22.313 39.562 23.325 37.113 25.1686 35.273C27.0053 33.434 29.4525 32.422 32.0551 32.422C37.0821 32.422 41.3431 36.34 41.7594 41.348L41.7086 41.437H48.2914L48.2446 41.348C48.6609 36.34 52.9219 32.422 57.9449 32.422C63.3174 32.422 67.691 36.793 67.691 42.164C67.691 47.539 63.3174 51.91 57.9449 51.91C56.5395 51.91 55.1859 51.598 53.906 51.008ZM45.136 36.348C45.0931 36.441 45.0433 36.535 45.0005 36.629C44.9617 36.535 44.9109 36.441 44.868 36.348H45.136ZM72.0526 42.164C72.0526 34.387 65.7218 28.059 57.9449 28.059C53.6689 28.059 49.7814 30.027 47.1748 33.117V24.859H56.1938V20.496H47.1748V13.078H42.8132V20.496H33.7952V24.859H42.8132V33.105C40.2106 30.019 36.3281 28.059 32.0551 28.059C24.2782 28.059 17.9474 34.387 17.9474 42.164C17.9474 49.945 24.2782 56.273 32.0551 56.273C32.2195 56.273 32.3709 56.25 32.5302 56.246C31.4754 58.238 30.8918 60.477 30.8918 62.816C30.8918 70.598 37.2225 76.926 45.0005 76.926C52.7815 76.926 59.1082 70.598 59.1082 62.816C59.1082 60.477 58.5285 58.238 57.4698 56.246C57.6291 56.25 57.7845 56.273 57.9449 56.273C65.7218 56.273 72.0526 49.945 72.0526 42.164Z';

  const ICONS = {
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z"/></svg>',
    tithely: '<svg viewBox="0 0 43 45" fill="currentColor" aria-hidden="true"><path d="M21.5592 22.6139C25.2962 21.076 28.1132 17.7722 28.4582 13.8987L28.5157 13.0443C28.5157 7.8038 25.8136 3.13291 21.6167 0C17.4199 3.13291 14.5453 7.8038 14.5453 13.0443L14.6028 13.8987C14.9477 17.7722 17.7648 21.076 21.5592 22.6139ZM19.777 28.7089C19.547 27.9114 19.2596 27.1709 18.8571 26.4304C18.0523 24.7215 16.8449 23.2405 15.3502 22.1013C13.1655 20.3924 10.3484 19.424 7.58885 19.424H0C0 20.3924 0 21.3038 0 22.2722C0.0574913 23.924 0.517421 25.5759 1.20732 27.057C2.01219 28.7658 3.21951 30.2468 4.71429 31.3861C6.84146 33.0949 9.60104 34.1772 12.3606 34.1772H19.9495C19.9495 32.1835 20.0645 29.7342 19.777 28.7089ZM23.9164 26.4304C23.5714 27.1709 23.2265 27.9114 22.9965 28.7089C22.824 29.5063 22.824 31.1582 22.824 32.8101C22.824 33.2658 22.824 33.7215 22.824 34.1772V36.7975L22.4791 44.5443H23.9164C23.9164 44.3165 23.9739 44.0316 23.9739 43.8038C24.0888 41.6392 24.2613 39.3038 24.5488 37.3671C24.8937 35.2025 27.2509 34.2911 28.9756 34.2342H30.4129C33.1725 34.2342 35.8746 33.1519 38.0592 31.443C39.554 30.3038 40.7613 28.8228 41.5662 27.1139C42.3136 25.6329 42.716 23.981 42.7735 22.3291C42.7735 21.9873 42.7735 21.7025 42.7735 21.3608C42.7735 20.7342 42.7735 20.1076 42.7735 19.481H35.1847C32.4251 19.481 29.608 20.4494 27.4233 22.1582C25.9286 23.2975 24.7213 24.7785 23.9164 26.4304Z"/></svg>',
  };

  // Same rule as navbar.js: a stored choice wins, otherwise the browser language.
  function currentLang() {
    const stored = localStorage.getItem('lang');
    if (stored) { return stored === 'en' ? 'en' : 'zh'; }
    const lang = navigator.language || '';
    return lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  function markup(lang) {
    const t = COPY[lang];
    const external = 'target="_blank" rel="noopener noreferrer"';
    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="canaan-footer__top">
          <a class="canaan-footer__brand" href="${lang === 'en' ? '/en' : '/'}">
            <svg viewBox="0 0 90 90" width="40" height="40" aria-hidden="true"><rect width="90" height="90" rx="14" fill="#563C71"/><path d="${MARK}" fill="#fff"/></svg>
            <span class="canaan-footer__names canaan-footer__names--${lang}">
              <span class="canaan-footer__name">${t.name}</span>
              <span class="canaan-footer__sub">${t.sub}</span>
            </span>
          </a>
          <div class="canaan-footer__icons">
            <a href="${INSTAGRAM}" ${external} aria-label="Instagram">${ICONS.instagram}</a>
            <a href="${FACEBOOK}" ${external} aria-label="Facebook">${ICONS.facebook}</a>
            <a href="${GIVE}" ${external} aria-label="${t.give}">${ICONS.tithely}</a>
          </div>
        </div>
        <div class="canaan-footer__contact">
          <a href="${MAPS}" ${external}>${ICONS.pin}4405 Fortran Court, San Jose, CA 95134</a>
          <a href="${TEL}">${ICONS.phone}(408) 942-2822</a>
        </div>
        <p class="canaan-footer__copy">© ${new Date().getFullYear()} ${t.owner}</p>
      </div>`;
  }

  function apply() {
    const content = document.querySelector('.super-root > .super-content-wrapper');
    if (!content) { return; }

    const lang = currentLang();
    let footer = content.parentElement.querySelector(':scope > .canaan-footer');
    if (!footer) {
      footer = document.createElement('footer');
      footer.className = 'canaan-footer';
      content.after(footer);
    }

    if (footer.dataset.lang !== lang) {
      footer.dataset.lang = lang;
      footer.innerHTML = markup(lang);
    }
    document.documentElement.classList.add('has-canaan-footer');
  }

  apply();

  // Super runs on Next.js: a soft navigation swaps the DOM, and the language toggle
  // re-renders the navbar in place, so re-check on every change.
  const observer = new MutationObserver(apply);
  observer.observe(document.body, { childList: true, subtree: true });
})();
