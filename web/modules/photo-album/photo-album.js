'use strict';

/* Photo album: `.cc-photo-album` blocks written by the photos sync (Drive -> Notion code block)
 * become ministry tabs over a justified photo grid with a full-screen viewer.
 * Coupled to photo-album.css - this builds the markup, that styles it. */

(() => {

  const PAGE = 12;
  const GAP = 8;
  const COPY = {
    zh: { more: '顯示更多', play: '播放影片', close: '關閉', prev: '上一張', next: '下一張' },
    en: { more: 'Show more', play: 'Play video', close: 'Close', prev: 'Previous', next: 'Next' },
  };
  const ARROW = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="14 6 8 12 14 18"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="10 6 16 12 10 18"/></svg>',
  };
  const PLAY = '<span class="cc-photo-album__play" aria-hidden="true"><svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg></span>';

  // Same rule as navbar.js: a stored choice wins, otherwise the browser language.
  function currentLang() {
    const stored = localStorage.getItem('lang');
    if (stored) { return stored === 'en' ? 'en' : 'zh'; }
    return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  const url = (id, size) => `https://lh3.googleusercontent.com/d/${id}=s${size}`;
  const fullUrl = (p) => url(p.id, Math.min(Math.max(p.w, p.h), 2880));
  const srcset = (p) => [400, 800, 1200]
    .map((s) => `${url(p.id, s)} ${Math.round(s * Math.min(1, p.w / p.h))}w`)
    .join(', ');

  // Google's image server rejects some referrers, so photos never send one.
  function image(src) {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.alt = '';
    if (src) { img.src = src; }
    return img;
  }

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

  // One full-screen viewer shared by every album on the page.
  let viewer = null;
  let active = null;

  function ensureViewer() {
    if (viewer && viewer.el.isConnected) { return viewer; }
    const t = COPY[currentLang()];
    const el = document.createElement('div');
    el.className = 'cc-photo-album__viewer';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    const img = image();
    const prev = button('cc-photo-album__viewer-nav cc-photo-album__viewer-nav--prev', t.prev, ARROW.prev);
    const next = button('cc-photo-album__viewer-nav cc-photo-album__viewer-nav--next', t.next, ARROW.next);
    const close = button('cc-photo-album__viewer-close', t.close, '×');
    const play = button('cc-photo-album__viewer-play', t.play, '<svg viewBox="0 0 10 12" aria-hidden="true"><path d="M0 0l10 6-10 6z"/></svg>');
    const counter = document.createElement('div');
    counter.className = 'cc-photo-album__viewer-counter';
    el.append(img, play, prev, next, close, counter);
    document.body.append(el);

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    close.addEventListener('click', closeViewer);
    play.addEventListener('click', playVideo);
    img.addEventListener('click', () => { if (viewer.el.classList.contains('is-video')) { playVideo(); } });
    el.addEventListener('click', (e) => { if (e.target === el) { closeViewer(); } });
    onSwipe(el, go);

    viewer = { el, img, counter, frame: null };
    return viewer;
  }

  function paintViewer() {
    const { photos, index } = active;
    const p = photos[index];
    stopVideo();
    viewer.img.src = url(p.id, 1200);
    if (!p.v) {
      const full = image(fullUrl(p));
      full.onload = () => { if (active && active.photos[active.index] === p) { viewer.img.src = full.src; } };
    }
    [-1, 1].forEach((d) => image(fullUrl(photos[(index + d + photos.length) % photos.length])));
    viewer.counter.textContent = `${index + 1} / ${photos.length}`;
    viewer.el.classList.toggle('is-video', !!p.v);
    viewer.el.classList.toggle('is-single', photos.length < 2);
  }

  // Drive's player loads only on demand; files are shared "anyone with the link".
  function playVideo() {
    if (!active || viewer.frame) { return; }
    const p = active.photos[active.index];
    const frame = document.createElement('iframe');
    frame.className = 'cc-photo-album__viewer-frame';
    frame.src = `https://drive.google.com/file/d/${p.id}/preview?autoplay=1`;
    frame.allow = 'autoplay; fullscreen';
    frame.allowFullscreen = true;
    frame.style.aspectRatio = `${p.w} / ${p.h}`;
    frame.style.width = `min(94vw, ${(80 * p.w / p.h).toFixed(2)}vh)`;
    viewer.el.prepend(frame);
    viewer.frame = frame;
    viewer.el.classList.add('is-playing');
  }

  function stopVideo() {
    if (viewer && viewer.frame) {
      viewer.frame.remove();
      viewer.frame = null;
    }
    if (viewer) { viewer.el.classList.remove('is-playing'); }
  }

  function openViewer(state, index) {
    ensureViewer();
    active = { state, photos: state.album.photos, index };
    paintViewer();
    viewer.el.classList.add('is-open');
    document.documentElement.classList.add('cc-photo-album-lock');
  }

  function go(step) {
    if (!active) { return; }
    active.index = (active.index + step + active.photos.length) % active.photos.length;
    paintViewer();
  }

  function closeViewer() {
    if (!viewer || !active) { return; }
    viewer.el.classList.remove('is-open');
    stopVideo();
    document.documentElement.classList.remove('cc-photo-album-lock');
    const { state, index } = active;
    active = null;
    if (!state.root.isConnected) { return; }
    state.reveal(index);
  }

  document.addEventListener('keydown', (e) => {
    if (!active) { return; }
    if (e.key === 'ArrowLeft') { go(-1); }
    if (e.key === 'ArrowRight') { go(1); }
    if (e.key === 'Escape') { closeViewer(); }
  });

  function build(root) {
    let data;
    try {
      data = JSON.parse(root.querySelector(':scope > template').content.textContent);
    } catch (e) {
      console.error('cc-photo-album: unreadable data', e);
      return;
    }
    const albums = (data.albums || []).filter((a) => a.photos && a.photos.length);
    if (albums.length === 0) { return; }
    root.classList.add('is-ready', 'cc-photo-album--tabs');

    const tabs = document.createElement('div');
    tabs.className = 'cc-photo-album__tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.hidden = albums.length < 2;
    const grid = document.createElement('div');
    grid.className = 'cc-photo-album__grid';
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'cc-photo-album__more';
    root.append(tabs, grid, more);

    const tiles = new Map();

    function tile(p, i) {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'cc-photo-album__tile' + (p.v ? ' is-video' : '');
      t.setAttribute('aria-label', `${i + 1} / ${state.album.photos.length}`);
      const img = image();
      img.loading = i < 4 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.width = p.w;
      img.height = p.h;
      img.srcset = srcset(p);
      img.src = url(p.id, 800);
      img.addEventListener('load', () => t.classList.add('is-loaded'), { once: true });
      img.addEventListener('error', () => state.drop(p), { once: true });
      t.append(img);
      if (p.v) { t.insertAdjacentHTML('beforeend', PLAY); }
      t.addEventListener('click', () => openViewer(state, state.album.photos.indexOf(p)));
      return t;
    }

    function layout() {
      const width = grid.clientWidth;
      if (!width) { return; }
      const target = width < 640 ? 150 : 230;
      const items = [...grid.children].map((el) => ({ el, p: el.cc }));
      let row = [];
      let ratio = 0;
      const flush = (fill) => {
        const h = fill ? (width - GAP * (row.length - 1) - 1) / ratio : target;
        row.forEach(({ el, p }) => {
          const w = h * p.w / p.h;
          el.style.width = `${w}px`;
          el.style.height = `${h}px`;
          el.firstChild.sizes = `${Math.ceil(w)}px`;
        });
        row = [];
        ratio = 0;
      };
      items.forEach((item) => {
        row.push(item);
        ratio += item.p.w / item.p.h;
        if (ratio * target + GAP * (row.length - 1) >= width) { flush(true); }
      });
      if (row.length) { flush(false); }
    }

    const state = {
      root,
      album: albums[0],
      shown: PAGE,
      render() {
        const photos = this.album.photos.slice(0, this.shown);
        const current = [...grid.children];
        const tilesFor = photos.map((p, i) => {
          if (!tiles.has(p)) {
            const t = tile(p, i);
            t.cc = p;
            tiles.set(p, t);
          }
          return tiles.get(p);
        });
        // Growing the same album only appends, so the page never jumps.
        if (current.every((el, i) => tilesFor[i] === el)) {
          grid.append(...tilesFor.slice(current.length));
        } else {
          grid.replaceChildren(...tilesFor);
        }
        layout();
        more.hidden = this.shown >= this.album.photos.length;
        this.label();
        requestAnimationFrame(autoMore);
      },
      more() {
        if (this.shown >= this.album.photos.length) { return; }
        this.shown += PAGE;
        this.render();
      },
      label() {
        const lang = currentLang();
        if (root.dataset.lang !== lang) {
          root.dataset.lang = lang;
          tabs.querySelectorAll('.cc-photo-album__tab').forEach((b) => {
            b.firstChild.textContent = b.cc[lang] || b.cc.en || b.cc.key;
          });
        }
        more.textContent = `${COPY[lang].more} (${this.album.photos.length - Math.min(this.shown, this.album.photos.length)})`;
      },
      select(album) {
        this.album = album;
        this.shown = PAGE;
        tabs.querySelectorAll('.cc-photo-album__tab').forEach((b) => {
          const on = b.cc === album;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on);
        });
        this.render();
        // A shorter album shrinks the page; keep the tabs on screen.
        if (!tabs.hidden && root.getBoundingClientRect().top < 0) {
          root.scrollIntoView({ block: 'start' });
        }
      },
      reveal(index) {
        if (index >= this.shown) {
          this.shown = Math.ceil((index + 1) / PAGE) * PAGE;
          this.render();
        }
        const t = tiles.get(this.album.photos[index]);
        if (t) { t.scrollIntoView({ block: 'nearest' }); }
      },
      drop(p) {
        const album = albums.find((a) => a.photos.includes(p));
        album.photos.splice(album.photos.indexOf(p), 1);
        tiles.delete(p);
        const count = tabs.querySelector(`[data-key="${album.key}"] .cc-photo-album__count`);
        if (count) { count.textContent = album.photos.length; }
        if (album === this.album) { this.render(); }
      },
    };

    albums.forEach((album) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cc-photo-album__tab';
      b.setAttribute('role', 'tab');
      b.dataset.key = album.key;
      b.cc = album;
      b.append(document.createTextNode(''));
      const count = document.createElement('span');
      count.className = 'cc-photo-album__count';
      count.textContent = album.photos.length;
      b.append(count);
      b.addEventListener('click', () => state.select(album));
      tabs.append(b);
    });

    more.addEventListener('click', () => state.more());

    // Load the next page before the visitor reaches the end of the grid.
    const AHEAD = 600;
    function autoMore() {
      if (more.hidden || !root.isConnected || active) { return; }
      if (more.getBoundingClientRect().top < window.innerHeight + AHEAD) { state.more(); }
    }
    new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { autoMore(); }
    }, { rootMargin: `0px 0px ${AHEAD}px 0px` }).observe(more);

    let width = 0;
    new ResizeObserver(() => {
      if (grid.clientWidth !== width) {
        width = grid.clientWidth;
        layout();
      }
    }).observe(grid);

    root.cc = state;
    state.select(albums[0]);
  }

  function apply() {
    document.querySelectorAll('.cc-photo-album:not(.is-ready)').forEach(build);
    document.querySelectorAll('.cc-photo-album.is-ready').forEach((root) => root.cc && root.cc.label());
  }

  // Super runs on Next.js: a soft navigation swaps the page content in place,
  // and the language toggle re-renders without a reload.
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) { return; }
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (active && !active.state.root.isConnected) { closeViewer(); }
      apply();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  apply();
})();
