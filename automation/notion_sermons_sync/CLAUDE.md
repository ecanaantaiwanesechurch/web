# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the data synchronization functions.

## Development Commands

```bash
# Test functions locally
npm run "test schools"   # Sunday school sync
npm run "test sermons"   # Sermon sync  
npm run "test videos"    # Video testimony sync
npm run "test photos"    # Photo gallery sync

# Deploy to Google Cloud Functions
npm run "deploy schools|sermons|videos|photos"
```

## Architecture

**Entry Point**: `index.js` - HTTP Cloud Functions that delegate to sync modules

**Core Services** (`src/base/`):
- `notion.js` - Main Notion API client with CRUD operations
- `google_sheets.js` - Google Sheets data reading/updating
- `google_photos.js` - Photo album management
- `gallery.js` - HTML generation for embedded galleries
- `notion_blocks.js` - Notion block builders (titles, columns, etc.)

**Sync Functions** (`src/functions/`):
- `sync_sermons.js` - Sheets → Notion, auto-highlights latest per ministry
- `sync_sunday_school.js` - Educational content sync
- `sync_videos.js` - Video testimony records
- `sync_photos.js` - Google Photos → Notion HTML galleries

## Key Patterns

**Ministry Mapping**: 
- MM (Mandarin), EM (English), TM (Taiwanese), All (combined)

**Rate Limiting**: 
- 350ms delays between API calls to avoid limits

**Authentication**:
- Google OAuth2 with local credential files
- Notion API tokens in `notion_token.json`
- Cloud Functions expect JWT Authorization headers

**Highlight System**:
- Automatically promotes latest sermon from each ministry
- Updates Mandarin ministry page with weekly verse and video

**Photo Galleries**:
- Generate HTML embedded in Notion code blocks
- Track last item metadata to detect updates