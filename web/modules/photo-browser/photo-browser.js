'use strict';

/* Photo browser: images inside a blue callout become one large photo with arrows,
 * a thumbnail strip and a full-screen view. The first image in Notion is shown first.
 * Coupled to photo-browser.css - this builds the markup, that styles it. */

(() => {

  const ROOT = '.notion-callout.bg-blue-light';

  const ARROW = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="14 6 8 12 14 18"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="10 6 16 12 10 18"/></svg>',
  };

  const button = (cls, label, html) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.setAttribute('aria-label', label);
    b.innerHTML = html;
    return b;
  };

  const onSwipe = (el, go) => {
    let x0 = null;
    el.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (x0 === null) { return; }
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); }
      x0 = null;
    });
  };

  // One full-screen viewer shared by every browser on the page.
  let viewer = null;
  let active = null;

  const paintViewer = () => {
    const { photos, index } = active;
    viewer.img.src = photos[index].full;
    viewer.counter.textContent = (index + 1) + ' / ' + photos.length;
    viewer.el.classList.toggle('is-single', photos.length < 2);
  };

  const closeViewer = () => {
    if (!viewer) { return; }
    viewer.el.classList.remove('is-open');
    document.documentElement.classList.remove('photo-viewer-open');
    active = null;
  };

  const ensureViewer = () => {
    if (viewer && viewer.el.isConnected) { return viewer; }
    const el = document.createElement('div');
    el.className = 'photo-viewer';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    const img = document.createElement('img');
    img.alt = '';
    const counter = document.createElement('div');
    counter.className = 'photo-viewer__counter';
    const close = button('photo-viewer__close', 'Close', '×');
    const prev = button('photo-viewer__nav photo-viewer__nav--prev', 'Previous', ARROW.prev);
    const next = button('photo-viewer__nav photo-viewer__nav--next', 'Next', ARROW.next);
    el.append(img, prev, next, close, counter);
    document.body.append(el);

    prev.addEventListener('click', () => active.go(-1));
    next.addEventListener('click', () => active.go(1));
    close.addEventListener('click', closeViewer);
    el.addEventListener('click', (e) => { if (e.target === el) { closeViewer(); } });
    onSwipe(el, (step) => active && active.go(step));

    viewer = { el, img, counter };
    return viewer;
  };

  document.addEventListener('keydown', (e) => {
    if (!active) { return; }
    if (e.key === 'ArrowLeft') { active.go(-1); }
    if (e.key === 'ArrowRight') { active.go(1); }
    if (e.key === 'Escape') { closeViewer(); }
  });

  function build(callout) {
    const content = callout.querySelector('.notion-callout__content');
    if (!content || content.querySelector(':scope > .photo-browser')) { return; }

    const sources = [...content.querySelectorAll('.notion-image')];
    if (sources.length === 0) { return; }

    const photos = sources.map((block) => {
      const img = block.querySelector('img');
      const span = img.closest('[data-full-size]');
      const src = img.getAttribute('src');
      return { src, full: (span && span.getAttribute('data-full-size')) || src };
    });
    sources.forEach((block) => block.classList.add('photo-browser__source'));

    const root = document.createElement('div');
    root.className = 'photo-browser' + (photos.length < 2 ? ' is-single' : '');

    const stage = document.createElement('div');
    stage.className = 'photo-browser__stage';
    const shown = document.createElement('img');
    shown.alt = '';
    const counter = document.createElement('div');
    counter.className = 'photo-browser__counter';
    const prev = button('photo-browser__nav photo-browser__nav--prev', 'Previous', ARROW.prev);
    const next = button('photo-browser__nav photo-browser__nav--next', 'Next', ARROW.next);
    stage.append(shown, prev, next);

    const strip = document.createElement('div');
    strip.className = 'photo-browser__strip';
    const thumbs = photos.map((p, i) => {
      const t = button('photo-browser__thumb', 'Photo ' + (i + 1), '');
      const img = document.createElement('img');
      img.src = p.src;
      img.alt = '';
      img.loading = 'lazy';
      t.append(img);
      t.addEventListener('click', () => state.show(thumbs.indexOf(t)));
      // iPhone HEIC uploads and dead links never render; drop them from the set.
      img.addEventListener('error', () => state.drop(thumbs.indexOf(t)), { once: true });
      strip.append(t);
      return t;
    });

    root.append(stage, counter, strip);
    content.prepend(root);

    const state = {
      root,
      photos,
      index: 0,
      show(i) {
        this.index = (i + photos.length) % photos.length;
        shown.src = photos[this.index].src;
        counter.textContent = (this.index + 1) + ' / ' + photos.length;
        thumbs.forEach((t, k) => t.classList.toggle('is-active', k === this.index));
        const t = thumbs[this.index];
        strip.scrollTo({ left: t.offsetLeft - (strip.clientWidth - t.clientWidth) / 2, behavior: 'smooth' });
        if (active === this) { paintViewer(); }
      },
      go(step) { this.show(this.index + step); },
      drop(i) {
        if (i < 0) { return; }
        photos.splice(i, 1);
        thumbs.splice(i, 1)[0].remove();
        if (photos.length === 0) { root.remove(); sources.forEach((b) => b.classList.remove('photo-browser__source')); return; }
        root.classList.toggle('is-single', photos.length < 2);
        this.show(this.index > i ? this.index - 1 : Math.min(this.index, photos.length - 1));
      },
    };

    prev.addEventListener('click', () => state.go(-1));
    next.addEventListener('click', () => state.go(1));
    onSwipe(stage, (step) => state.go(step));
    shown.addEventListener('click', () => {
      ensureViewer();
      active = state;
      paintViewer();
      viewer.el.classList.add('is-open');
      document.documentElement.classList.add('photo-viewer-open');
    });

    state.show(0);
  }

  const apply = () => document.querySelectorAll(ROOT).forEach(build);

  // Super runs on Next.js: a soft navigation swaps the page content in place.
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) { return; }
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (active && !active.root.isConnected) { closeViewer(); }
      apply();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  apply();
})();
