# Vendored from Super

Forked 2026-09-06 from Super's v2 snippets:

- `carousel.css` ← https://sites.super.so/snippets/v2/carousel.css
- `carousel.js`  ← https://sites.super.so/snippets/v2/carousel.js

## Why we forked

Super injected both files from site settings, unpinned. Any change on their side
shipped straight to production with no review and no way to roll back. Ours are
pinned to a git tag through jsDelivr like the rest of `web/static`.

**Both snippet tags must stay removed from Super's code injection.** Their CSS
loaded *after* our `component.css` and both use `!important`, so if the tag comes
back it wins and our fixes silently stop applying.

## How it is wired up

The carousel activates on a brown callout wrapping a database gallery view in
Notion — `.notion-callout.bg-brown-light`. That colour is the only hook; there is
no other marker, so any brown-light callout containing a gallery becomes a carousel.

## Changes from upstream

`carousel.js`:

- wrapped as `'use strict'` + arrow IIFE to match `js/album.js`, `js/video_player.js`
- `innerHTML` template literals → plain strings
- removed `onMove`, which upstream defines as a no-op (`if (!isDragging) return;`
  and nothing else) along with its `touchmove` listener. No functional change.
- marks cards whose image is portrait with `.portrait`, adds `.carousel-cover` to
  the image wrapper and passes the image as `--cover-url` for the blurred backdrop.

`carousel.css` — vendored rules kept in section 1, our fixes in section 2:

- caption background was a flat `rgba(50,50,50,.7)` bar. Event flyers print their
  own title and date into the artwork and it bled through, colliding with the
  Notion caption. Replaced with a grey gradient held near max across the text
  block, fading only above it.
- non-active captions are `visibility:hidden`. The JS is loaded async, so before
  it runs no card has `.active` and every caption would otherwise stack at
  `bottom:0`.
- `super:hide_title` (checkbox, `property-6b646f3e`) hides the whole caption for
  events whose flyer already carries the text. Super only emits properties the
  gallery view shows, so the checkbox stays visible in Notion and is hidden here.
- `.carousel-indicators` moved to the bar's right edge; centred dots landed on
  top of the caption text.
- 16:9 on desktop (16:11 kept on mobile); 16:11 took most of a laptop screen.
- portrait posters are shown whole (`contain`) instead of cropped. With
  `super:hide_title` checked they sit on a blurred copy of themselves; unchecked,
  desktop splits the slide into poster left and title, date and a
  "Learn more →" / "詳細資訊 →" label right.

## Property hashes

Super derives these per property. **They change if a property is deleted and
recreated**, so re-read them from the rendered DOM if the caption rules stop
matching.

| property | class |
|---|---|
| `super:hide_title` | `property-6b646f3e` |
| date | `property-414e7644` |
