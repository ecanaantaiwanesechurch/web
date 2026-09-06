# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the frontend web code.

## Build Commands

```bash
npm run build  # Compiles Tailwind: src/css/input.css → static/component.css
```

## Frontend Architecture

**Technology Stack**: Vanilla JavaScript ES6+, Tailwind CSS, DaisyUI

**Key Files**:
- `js/navbar.js` - Bilingual navigation system (zh/en language switching)
- `js/album.js` - Photo gallery interactions and carousel
- `js/video_player.js` - Video playback functionality
- `js/landing.js` - Homepage interactions
- `js/highlight.js` - Content highlighting features

**CSS Organization**:
- `src/css/input.css` - Tailwind source with custom utilities
- `static/component.css` - Generated output (never edit directly)
- `styles/` - Legacy custom CSS (gallery.css, main.css, directory.css)

**Modules** (`modules/<name>/`):
Features whose CSS and JS must change together live in one folder rather than
split across `js/` and `styles/`. Each is wired up by an `@import` in
`src/css/input.css` and an `import` in `js/main.js`. Code forked from a third
party carries a `VENDOR.md` recording the source and our changes.
- `modules/carousel/` - events carousel, forked from Super's snippet
- `modules/sermon-block/` - Sunday Messages block on the homepages
- `modules/service-times/` - service times grid on the homepages

## Tailwind Configuration

- Uses DaisyUI plugin for component library
- Custom spacing: `smenu` for mobile menu width calculations
- Content paths include both local JS and automation gallery generator
- Theme extensions for church branding

## Navigation System

**Smooth Dropdown Animations**:
- Max-height animations (200ms) with top-to-bottom expansion
- Semantic CSS classes: `dropdown-closed` ↔ `dropdown-open`
- Mobile container height: 80vh to accommodate nested dropdowns
- Dynamic desktop dropdown width with `w-max`

**Language Support**:
- Hash-based language switching (`#en` for English)
- Path translations between `/zh` and `/en` routes
- Dynamic link updates for page navigation
- Menu item ordering: `enOrder` property controls English mode sequence

**Technical Notes**:
- Try to make css change with tailwind css
- no trailing whitespace on edit