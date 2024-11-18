'use strict';
(() => {
  const allowedPaths = {
    '/zh/events-testing': 1,
    'srcdoc': 1
  };

  const targets = [
    'allgallery',
    'tmgallery',
    'mmgallery',
    'emgallery',
    'ymgallery',
    'cmgallery',
  ];

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }

  function bootstrap() {
    if (!allowedPaths[window.location.pathname]) { return; }

    targets.forEach(async n => {
      try {
        await setupAlbum(n);
      } catch(e) {
        console.error(e);
      }
    });
  }

  async function setupAlbum(target) {
    if (typeof Swiper === 'undefined') { return; }

    const swiper = new Swiper(`#swiper-${target}`, {
      spaceBetween: 12,

      scrollbar: {
        el: ".swiper-scrollbar",
        hide: true,
      },

      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    const lightbox = new PhotoSwipeLightbox({
      gallery: `#${target}`,
      children: 'a',
      pswpModule: PhotoSwipe
    });

    lightbox.addFilter('itemData', (itemData) => {
      const actionType = itemData.element.dataset.actionType;
      if (actionType) {
        itemData.actionType = itemData.element.dataset.actionType;
        itemData.targetUrl = itemData.element.getAttribute('href');
      }
      return itemData;
    });

    lightbox.on('imageClickAction', (e) => {
      const itemData = lightbox.pswp.currSlide.data;
      if (itemData.actionType === 'open' && itemData.targetUrl) {
        window.open(itemData.targetUrl, '_blank');
        e.preventDefault();
      }
    });

    lightbox.on('contentActivate', ({ content }) => {
      if (content.data.actionType === 'open' && content.data.targetUrl) {
        content.element.classList.add('link');
      }
    });

    lightbox.on("close", function() {
      // This is index of current photoswipe slide
      var currentIndex = lightbox.pswp.currIndex;
      // Update position of the slider
      swiper.slideTo(currentIndex, 0, false);
    });

    lightbox.init();
  }

})();
