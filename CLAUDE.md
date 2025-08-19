# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Church website repository with two main components:
- `web/` - Frontend website (Tailwind CSS + vanilla JS)  
- `automation/` - Data sync functions (Google APIs ↔ Notion)

## Repository Structure

```
├── web/                   # Frontend code (see web/CLAUDE.md)
│   ├── js/               # JavaScript modules
│   ├── src/css/          # Tailwind source
│   └── static/           # Generated assets
├── automation/
│   └── notion_sermons_sync/  # Sync functions (see automation/notion_sermons_sync/CLAUDE.md)
│       ├── src/base/     # API clients
│       └── src/functions/    # Sync implementations
└── README.md
```

## Quick Start

Navigate to the specific directory for detailed commands:
- **Frontend work**: `cd web/` (see `web/CLAUDE.md`)
- **Automation work**: `cd automation/notion_sermons_sync/` (see `automation/notion_sermons_sync/CLAUDE.md`)

## Project Context

This is a bilingual (Chinese/English) church website with automated content management. The frontend displays sermons, photos, and events while the automation layer syncs data from Google Workspace tools to Notion databases.