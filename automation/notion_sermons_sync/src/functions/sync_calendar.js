import gBase from '../base/google_base.js';
import gWorker from '../base/google_sheets.js';
import nWorker from '../base/notion.js';
import { sleep } from '../base/utils.js';
import { calendarHtml } from '../base/calendar.js';

const CONFIG_SHEET_ID = process.env.CONFIG_SHEET_ID || '1yWGbQ_G6Gtujhs6P7hZOd2MUHel9ZbkmPONBQvQFkSA';
const CONFIG_TAB = 'CalendarConfig';

// Fallback config for testing
const defaultCalendarConfig = [{
  eventsSheet: 'YOUR_EVENTS_SHEET_ID',
  eventsTab: '2026 Events',
  metadataTab: 'Metadata',
  notionPage: 'YOUR_NOTION_PAGE_ID'
}];

async function syncCalendar(body = {}) {
  const auth = await gBase.authorizeServiceAccount();
  const notion = await nWorker.createNotionClient();

  // Manual single-record override (for testing) - process just one gcal calendar
  // from the request body and skip the config sheet entirely.
  let configs;
  if (body.calendarId && body.notionPage) {
    configs = [{
      type: 'gcal',
      eventsSheet: body.calendarId, // calendar id
      notionPage: body.notionPage,
      title: body.title || '',
      eventsTab: '',
      metadataTab: ''
    }];
    console.log('Manual override: processing single gcal record from request body');
  } else {
    // Fetch config with fallback
    configs = await gWorker.fetchCalendarConfig(auth, CONFIG_SHEET_ID, CONFIG_TAB);
    if (!configs || configs.length === 0) {
      console.log('No valid config from sheet, using local fallback config');
      configs = defaultCalendarConfig;
    } else {
      console.log('Using config from Google Sheet');
    }
  }

  // Process each config
  for (const config of configs) {
    try {
      console.log(`Processing calendar config for Notion page: ${config.notionPage}`);

      // Google Calendar API source
      if (config.type === 'gcal') {
        const events = await gWorker.fetchGoogleCalendarEvents(auth, config.eventsSheet);
        if (events.length === 0) {
          console.log(`No Google Calendar events found for ${config.eventsSheet}`);
          continue;
        }

        const today = new Date();
        const metadata = {
          title: config.title || 'Event Calendar',
          subtitle: '',
          created: null,
          updated: `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`,
          mode: 'static', // no date filtering (API already windowed) and no auto-scroll script
          padding: 'none', // leading-aligned, matching the sheet-based calendar pages
          monthNotes: {},
          calendarId: config.eventsSheet // drives the "Add to my Google Calendar" footer link
        };

        console.log(`Found ${events.length} Google Calendar events. Generating calendar HTML...`);

        const html = calendarHtml(events, metadata, 'fellowship');
        // Scheduled runs refresh at most once/day; manual override always writes for testing.
        const stamp = body.calendarId ? today.toISOString() : today.toISOString().slice(0, 10);
        await nWorker.updateCalendar(notion, html, metadata, config.notionPage, stamp);

        console.log(`Google Calendar updated successfully for ${config.eventsSheet}\n`);
        await sleep(350);
        continue;
      }

      // Fetch sheet modified time
      const sheetModifiedTime = await gWorker.fetchSheetModifiedTime(auth, config.eventsSheet);
      console.log(`Sheet last modified: ${sheetModifiedTime}`);

      // Fetch events and metadata
      const type = config.type || 'ministry';
      console.log(`Calendar type: ${type}`);

      const events = await gWorker.fetchCalendarEvents(auth, config.eventsSheet, config.eventsTab, type);
      const metadata = await gWorker.fetchCalendarMetadata(auth, config.eventsSheet, config.metadataTab);

      if (events.length === 0) {
        console.log(`No events found in ${config.eventsTab}`);
        continue;
      }

      console.log(`Found ${events.length} events. Generating calendar HTML...`);

      // Generate HTML and update Notion
      const html = calendarHtml(events, metadata, type);
      await nWorker.updateCalendar(notion, html, metadata, config.notionPage, sheetModifiedTime);

      console.log(`Calendar updated successfully for ${config.eventsTab}\n`);
      await sleep(350); // Avoid rate limits
    } catch (error) {
      console.error(`Failed to sync calendar for ${config.eventsTab}: ${error}`);
    }
  }
}

export { syncCalendar };
