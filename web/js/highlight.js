'use strict';

(() => {

  const allowedPaths = {
    '/zh': 1,
    '/en': 1,
    '/ministries/youth-ministry': 1,
    '/ministries/mandarin-ministry': 1,
    '/ministries/family-ministry': 1,
    '/en/ministries/family-ministry': 1,
    'srcdoc': 1
  }

  // DOM observation

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

  function bootstrap() {
    window.addEventListener('popstate', updateGallery);

    (function(history) {
      var _pushState = history.pushState;
      history.pushState = function() {
        const ret = _pushState.apply(history, arguments);
        updateGallery()
        return ret;
      };
    })(window.history);

    if (MutationObserver) {
      const root = document.getElementsByClassName('super-root')[0];
      if (root) {
        const rootObserver = new MutationObserver(() => {
          updateGallery();
        });
        rootObserver.observe(root, {
          childList: true,
          subtree: true
        })
      }
    }

    updateGallery();
  }

  function updateGallery() {
    if (!allowedPaths[window.location.pathname]) { return; }

    const targetClassName = 'notion-collection-gallery large';
    const gallery = Array.from(document.getElementsByClassName(targetClassName));

    if (gallery.length === 0) { return; }

    gallery.forEach((item) => {
      const className = item.className.replace(targetClassName, 'carousel rounded-box w-full items-center');
      item.className = className;
      updateGalleryItems(item);
    })
  }

  function updateGalleryItems(gallery) {
    if (!gallery) { return; }

    const itemTargetClassName = 'notion-collection-card gallery';
    const galleryItems = Array.from(gallery.getElementsByClassName(itemTargetClassName));

    if (galleryItems.length === 0) { return; }

    galleryItems.forEach((item) => {
      const className = item.className.replace(itemTargetClassName, 'carousel-item px-1');
      item.className = className;
      updateGalleryItemLink(item);
    });
  }

  function updateGalleryItemLink(item) {
    if (!item) { return; }

    const targetClassName = 'notion-collection-card__anchor';
    const items = Array.from(item.getElementsByClassName(targetClassName));

    if (items.length === 0) { return; }

    items.forEach((link) => {
      const className = link.className.replace(targetClassName, '');
      link.className = className;
      const image = findGalleryItemImage(item);
      if (image) {
        link.innerText = '';
        link.appendChild(image);
      }
    });
  }

  function findGalleryItemImage(item) {
    if (!item) { return; }

    const items = Array.from(item.getElementsByTagName('img'));

    if (items.length === 0) { return; }

    var ret;
    items.forEach((image) => {
      image.className = '';
      image.style = '';
      ret = image;
    });
    return ret;
  }
})();
