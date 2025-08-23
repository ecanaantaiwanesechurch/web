# Navbar Configuration Editor - Development Context

## Current Status
The navbar configuration editor has been successfully converted into an Electron desktop application called "Canaan Web Config" with the navbar editor as the first tool.

## Project Structure
```
tools/
├── package.json          # Electron app configuration
├── main.js               # Electron main process
├── preload.js            # Secure IPC bridge
├── index.html            # Main dashboard/launcher
├── navbar-editor.html    # Navbar configuration editor
├── navbar-editor.js      # Editor functionality
├── config-extractor.js   # Extracts config from navbar.js
├── navbar-config.json    # Generated config data
└── NavBarConfig.md       # This documentation
```

## Completed Features

### Navbar Editor Functionality
- ✅ **Visual Editor**: Drag-and-drop interface for reordering menu items
- ✅ **Live Preview**: Toggle between English and Chinese navbar previews with auto-expanded dropdowns
- ✅ **Modal Editor**: Edit individual menu items (bilingual text, links, ordering)
- ✅ **Path Mappings**: Edit zhEnPaths configuration with dropdown quick-select and filtering
- ✅ **Drag & Drop**: Reorder both top-level and sub-items within same parent
- ✅ **Export**: Generate updated navbar.js code
- ✅ **Status Messages**: Visual feedback for operations
- ✅ **Highlight Animation**: Green highlight for successfully moved items

### Technical Implementation
- ✅ **Embedded Config**: Real navbar configuration embedded in JavaScript
- ✅ **File Operations**: Ready for Electron file system access
- ✅ **Error Handling**: Comprehensive error messages and validation
- ✅ **Responsive Design**: Tailwind CSS with proper spacing and mobile support

### Electron App Structure
- ✅ **Main Dashboard**: Landing page with tool cards for future expansion
- ✅ **Application Menu**: File, Tools, View, Help menus with keyboard shortcuts
- ✅ **IPC Bridge**: Secure communication between renderer and main process
- ✅ **Build Configuration**: Ready for packaging on Mac, Windows, Linux

## Key Features Detail

### Drag and Drop System
- **Top-level items**: Can reorder main navigation items (About Us, Ministries, etc.)
- **Sub-items**: Can reorder within same parent (e.g., items within "About Us")
- **Visual feedback**: Drag handle (⋮⋮), drag-over highlighting, success animation
- **Data tracking**: Proper index, level, and parent tracking for complex hierarchies

### Language Handling
- **enOrder property**: Controls ordering in English vs Chinese
- **Preview switching**: Toggle between languages shows different orderings
- **Path mappings**: Manages URL translations between /zh and /en routes

### Configuration Structure
```javascript
{
  navbarItems: [
    {
      en: "About Us",
      zh: "關於我們", 
      items: [
        {
          en: "Our Story",
          zh: "我們的故事",
          enLink: "/en/about-us/our-story",
          zhLink: "/about-us/our-story"
        }
        // ... more items
      ]
    }
    // ... more top-level items
  ],
  zhEnPaths: [
    ["/zh", "/en"],
    ["/fellowships/tm/cupertino", "/en/fellowships/tm/cupertino"]
    // ... more path mappings
  ]
}
```

## Current Issues & Limitations

### Partially Implemented
- **File operations**: HTML has file upload fallback, but Electron native file access not yet connected
- **Save functionality**: Can export/download but not save back to source files
- **Config extraction**: Manual process via Node.js script

### Known Bugs
- None currently identified

## Next Steps for Completion

### Immediate (Electron Integration)
1. **Connect file operations**: Wire up Electron IPC for direct file read/write
2. **Config auto-loading**: Load real navbar-config.json on app start
3. **Save to source**: Save changes back to navbar.js or config files
4. **Menu integration**: Connect application menu to editor functions

### Future Enhancements
1. **Real-time preview**: Live preview of actual website navbar
2. **Validation**: Ensure all required fields are filled
3. **Backup system**: Automatic backups before changes
4. **Undo/Redo**: Change history and reversal
5. **Bulk operations**: Import/export multiple configurations

## Development Commands

### Setup Electron App
```bash
cd tools/
npm install
npm start        # Run in development
npm run dev      # Run with DevTools
npm run build    # Build for production
```

### Extract Current Config
```bash
node config-extractor.js
```

## File Dependencies

### Core Files
- `../web/js/navbar.js` - Source navbar configuration
- `navbar-config.json` - Extracted configuration data

### External Dependencies
- Tailwind CSS (CDN)
- Electron framework
- Node.js file system APIs

## Architecture Notes

### Security Model
- **Context isolation**: Renderer process isolated from Node.js
- **Preload script**: Secure IPC bridge with limited API exposure
- **No direct file access**: All file operations through main process

### Data Flow
1. **Load**: Extract config from navbar.js → JSON → Editor
2. **Edit**: Visual editor modifies in-memory config
3. **Save**: Updated config → JSON → navbar.js regeneration
4. **Deploy**: Manual copy to website directory

## Integration Points

### With Main Website
- **Source**: `/web/js/navbar.js` 
- **Target**: Same file after editing
- **Build process**: Existing npm run build for Tailwind

### Future Tools Integration
- Dashboard ready for additional tools
- Shared Electron infrastructure
- Common file operation patterns
- Consistent UI/UX with Tailwind

## Technical Decisions

### Why Electron
- Direct file system access without browser security restrictions
- Native desktop app experience
- Future expansion to multiple tools
- Keyboard shortcuts and native menus

### Why Embedded Config
- Reliable fallback when JSON files unavailable
- Self-contained tool for offline use
- Easy distribution and setup

### Why Drag and Drop
- Intuitive visual reordering
- Better UX than up/down buttons
- Handles complex nested hierarchies
- Visual feedback for operations

## Outstanding Questions
1. Should we auto-save changes or require manual save?
2. How to handle conflicts if multiple people edit simultaneously?
3. Should we validate navbar structure against website requirements?
4. How to preview changes before deploying to live site?

---

*Last updated: 2024 - Development context saved for future continuation*