# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Church website repository with three main components:
- `web/` - Frontend website (Tailwind CSS + vanilla JS)
- `automation/` - Data sync functions (Google APIs ↔ Notion)
- `tools/` - Desktop configuration editor (Electron app)

## Repository Structure

```
├── web/                   # Frontend code (see web/CLAUDE.md)
│   ├── js/               # JavaScript modules
│   ├── src/css/          # Tailwind source
│   ├── config/           # navbar-config.json for navigation
│   ├── dist/             # Vite build output
│   └── static/           # Generated CSS and bundle.min.js
├── automation/
│   └── notion_sermons_sync/  # Sync functions (see automation/notion_sermons_sync/CLAUDE.md)
│       ├── src/base/     # API clients (Notion, Google Sheets, Photos)
│       └── src/functions/    # Sync implementations
│       └── index.js      # Cloud Functions HTTP endpoints
├── tools/                 # Desktop navbar configuration editor
│   ├── main.js           # Electron main process
│   ├── navbar-editor.js  # Editor logic
│   └── navbar-config.json # Default configuration
└── README.md
```

## Quick Start Commands

### Frontend Development
```bash
cd web/
npm run build       # Compile Tailwind CSS
npm run build-js    # Bundle JavaScript with Vite
npm run build-all   # Build both CSS and JS
```

### Automation Development
```bash
cd automation/notion_sermons_sync/
npm run "test schools"    # Test Sunday school sync locally
npm run "test sermons"    # Test sermon sync locally
npm run "test videos"     # Test video testimony sync locally
npm run "test photos"     # Test photo gallery sync locally
npm run "test calendar"   # Test calendar sync locally

# Deploy to Google Cloud Functions
npm run "deploy schools|sermons|videos|photos|calendar"
```

### Configuration Editor
```bash
cd tools/
npm start           # Run Electron app
npm run dev         # Run with DevTools
npm run build       # Package for distribution
```

## Cross-Component Architecture

### Navbar Configuration System
The navigation menu configuration flows between components:

1. **Source of Truth**: `web/config/navbar-config.json`
2. **Build Process**: Vite plugin (`web/vite.config.js`) injects config into `navbar.js` during build
3. **Editor**: Electron app (`tools/`) provides GUI for editing configuration
4. **Runtime**: `web/js/navbar.js` handles bilingual navigation with hash-based language switching

**Key Pattern**: Navbar config embedded at build time for performance, allowing zero-runtime config loading.

### Deployment Workflow
1. Frontend: Build CSS/JS → Copy to website hosting
2. Automation: Deploy Cloud Functions → Configure JWT auth → Set up scheduled triggers
3. Tools: Build Electron app → Distribute to content managers

## Authentication & Credentials

**Local Development**:
- `automation/notion_sermons_sync/credentials.json` - Google OAuth2 credentials
- `automation/notion_sermons_sync/token.json` - Google API tokens
- `automation/notion_sermons_sync/notion_token.json` - Notion API token

**Cloud Functions**: Expect JWT Authorization headers for authentication

**Important**: All credential files are gitignored. Never commit credentials.

## Project Context

This is a bilingual (Chinese/English) church website with automated content management. The frontend displays sermons, photos, and events while the automation layer syncs data from Google Workspace tools to Notion databases.

### Bilingual Architecture
- Language switching via URL hash (`#en` for English)
- Path translations between `/zh` and `/en` routes
- Menu item ordering differs by language using `enOrder` property
- Content synced from Google Sheets supports both languages