'use strict';

(() => {

  const allowedPrefix = [
    '/sermons',
    '/en/gatherings/sermons',
    '/growth/videos',
    '/fellowships/mm/nfl/nfl-videos',
    '/events/2024-mm-gospel-night',
    '/events/2023-mm-gospel-night',
    'srcdoc'
  ];

  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry) { return; }

      if (entry.intersectionRatio > 0 && entry.target) {
        createVideoPlayer(entry.target);
      }
    });
  });

  // DOM observation

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

  function bootstrap() {
    if (MutationObserver) {
      const root = document.getElementsByClassName('super-root')[0];
      if (root) {
        const rootObserver = new MutationObserver(() => {
          updatePlayer();
        });
        rootObserver.observe(root, {
          childList: true,
          subtree: true
        })
      }
    }

    updatePlayer();
  }

  function vimeoHref(href) {
    if (/player/.test(href)) {
      return href;
    }
    const url = new URL(href);
    if (url.pathname) {
      const paths = url.pathname.split('/');
      if (paths.length > 2) {
        return `https://player.vimeo.com/video/${paths[1]}?h=${paths[2]}`;
      }
    }
    return `https://player.vimeo.com/video${url.pathname}`;
  }

  function youtubeHref(href) {
    if (/embed/.test(href)) {
      return href;
    }
    const url = new URL(href);

    if (url.host === 'youtu.be') {
      return `https://www.youtube.com/embed${url.pathname}`
    }

    const v = url.searchParams.get('v');
    if (!v) { return null; }

    return `https://www.youtube.com/embed/${v}`
  }

  function playerData(card) {
    if (!card) { return {}; }

    const image = card.getElementsByTagName('img')[0];
    const prop = card.getElementsByClassName('notion-property__url')[0]

    if (!image || !prop) { return { image }; }

    const link = prop.getElementsByTagName('a')[0];
    if (!link) { return { image }; }

    const href = link.getAttribute('href') || '';

    let url;
    if (/vimeo/i.test(href)) {
      url = vimeoHref(href);
    } else if (/youtu/i.test(href)) {
      url = youtubeHref(href);
    }

    return { image, url }
  }

  function updatePlayer() {
    const allowed = allowedPrefix.some((prefix) => window.location.pathname.startsWith(prefix));
    if (!allowed) { return; }

    const targetClassName = 'notion-collection-card gallery';
    const cards = Array.from(document.getElementsByClassName(targetClassName));

    if (cards.length === 0) { return; }

    cards.forEach((card) => {
      const { image, url } = playerData(card);

      if (!image) { return; }

      if (image.getAttribute('_obs') != null) { return; }

      image.setAttribute('_obs', '1');
      image.className = `${image.className} player`

      if (url) {
        visibilityObserver.observe(card);
      }
    });
  }

  function createVideoPlayer(card) {
    const { image, url } = playerData(card);
    if (!image || !url) { return; }


    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', '1');
    iframe.className = `${image.className} player`;

    image.replaceWith(iframe);

    visibilityObserver.unobserve(card);
  }

})();

