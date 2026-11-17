# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the data synchronization functions.

## Development Commands

```bash
# Test functions locally
npm run "test schools"   # Sunday school sync
npm run "test sermons"   # Sermon sync  
npm run "test videos"    # Video testimony sync
npm run "test photos"    # Photo album sync only
npm run "test photos-calendar"  # Photo albums + calendar sync

# Deploy to Google Cloud Functions
npm run "deploy schools|sermons|videos|photos-calendar"
```

## Architecture

**Entry Point**: `index.js` - HTTP Cloud Functions that delegate to sync modules

**Core Services** (`src/base/`):
- `notion.js` - Main Notion API client with CRUD operations
- `google_sheets.js` - Google Sheets data reading/updating
- `google_photos.js` - Photo album management
- `photo_album.js` - fills `cc-photo-album` code blocks with Drive album data
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
- Code blocks containing `<!-- cc-photo-album: <keys> -->` on the configured pages get album JSON from Drive
- A data hash in the block skips unchanged albums; `web/modules/photo-album/` renders it