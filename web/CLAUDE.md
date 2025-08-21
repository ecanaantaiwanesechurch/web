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
- `styles/` - Legacy custom CSS (carousel.css, gallery.css, main.css)

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