'use strict';

/* Sunday Messages block: the sermons DB filtered to Highlight, in a purple callout.
 * Coupled to sermon-block.css - this stamps the hooks, those rules style them. */

(() => {

  const ROOT = '.notion-callout.bg-purple-light';

  // Display copy only. The database keeps "<X> Ministry" because ministryMap in
  // automation/.../src/base/notion.js matches on those exact names.
  const LABEL = {
    'English Ministry': 'English',
    'Mandarin Ministry': '華語',
    'Taiwanese Ministry': '台語',
  };

  // Super derives a property's class from Notion's property id: property-<hex of its bytes>.
  const classForId = (id) => 'property-' + [...id]
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

  // A page can carry several collections - the homepage has the events carousel too -
  // and each ships its own schema. Pick the one describing the sermons collection.
  const SCHEMA_MARKER = 'Ministry';

  // Fallback ids, used when the schema is not on the page. Keep in step with the
  // property-<id> selectors in sermon-block.css.
  const FALLBACK = {
    Ministry: '.property-453b497d',
    Date: '.property-47583d56',
  };

  const find = (root, name, within = '') =>
    root.querySelectorAll(`${within}[data-prop="${name}"], ${within}${FALLBACK[name]}`);

  function schemaAt(html, at) {
    const chunk = html.slice(at, at + 4000).replace(/\\"/g, '"');
    return [...chunk.matchAll(/\{"id":"(.*?)","name":"(.*?)","type":"(.*?)"/g)]
      .filter(m => m[1] !== 'title')
      .map(m => [ classForId(m[1]), m[2] ]);
  }

  // The page embeds the view's schema, which is the only place property names appear.
  function propertyNames() {
    const html = document.documentElement.innerHTML;

    for (const match of html.matchAll(/visibleColumns/g)) {
      const entries = schemaAt(html, match.index);
      if (entries.some(([ , name ]) => name === SCHEMA_MARKER)) {
        return Object.fromEntries(entries);
      }
    }

    return {};
  }

  const byClass = propertyNames();

  function stamp(root) {
    root.querySelectorAll('.notion-collection-card__property').forEach(prop => {
      if (prop.hasAttribute('data-prop')) { return; }

      const known = [...prop.classList].find(c => byClass[c]);
      if (known) {
        prop.setAttribute('data-prop', byClass[known]);
      } else if (prop.classList.contains('notion-property__title')) {
        prop.setAttribute('data-prop', 'Name');
      }
    });
  }

  function relabel(root) {
    find(root, 'Ministry').forEach(prop => prop.querySelectorAll('.notion-pill').forEach(pill => {
      const next = LABEL[pill.textContent.trim()];
      if (next) { pill.textContent = next; }
    }));
  }


  // Notion's date format is a property-level setting shared by both views, so /zh
  // renders in English unless we restate it.
  function localiseDates(root) {
    if (root.closest('.super-content')?.id !== 'page-index') { return; }

    find(root, 'Date').forEach(el => {
      if (el.dataset.localised) { return; }

      const when = new Date(el.textContent.trim());
      if (isNaN(when)) { return; }

      el.dataset.localised = '1';
      el.textContent = `${when.getFullYear()}年${when.getMonth() + 1}月${when.getDate()}日`;
    });
  }

  // The sync picks the latest sermon per ministry independently, so the rows do not
  // always share a Sunday. Only claim a date in the heading when they agree.
  function headingDate(root) {
    const dates = [...find(root, 'Date', '.notion-collection-card ')]
      .map(el => el.textContent.trim());

    const uniform = dates.length > 0 && dates.every(d => d === dates[0]);
    root.classList.toggle('dates-uniform', uniform);
    root.style.setProperty('--sermon-date', uniform ? `"${dates[0]}"` : '""');
  }

  function apply() {
    document.querySelectorAll(ROOT).forEach(root => {
      stamp(root);
      relabel(root);
      localiseDates(root);
      headingDate(root);
    });
  }

  apply();

  // Super runs on Next.js: a soft navigation swaps the DOM and drops the attributes.
  const observer = new MutationObserver(apply);
  observer.observe(document.body, { childList: true, subtree: true });
})();
