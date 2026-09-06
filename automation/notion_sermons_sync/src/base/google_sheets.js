import { google } from 'googleapis';

const arrayKeys = {
  tags: 1,
  speakers: 1,
  verses: 1,
  ministry: 1
};

async function fetchSundaySchoolSheetRecords(auth, spreadsheetId, tab) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A1:R` // skip header
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log(`No data found in ${tab}.`);
    throw new Error(`No data found in ${tab}`);
  }

  const valueMap = createHeaderMap(rows.shift());
  return rows
    .map((row, index) => { return rowToRecord(row, index, valueMap) })
    .filter(n => n)
    .filter(n => n.title && !n.imported);
}

// Example record:
// {
//    date: '8/18/2024',
//    topic: '戲劇性的轉變',
//    speakers: [ '許司提 牧師' ],
//    verses: [ '使徒行傳 9:1-22' ],
//    ministry: 'MM',
//    videoLink: 'https://youtu.be/GL9S2sq2XUM?si=6KrHX5uQFo2XlTAH',
//    audioLink: 'https://drive.google.com/file/d/1akUTOPiR77QXPcmVLKtqStDFHT8sBJwf/view',
//    tags: ['any tags'],
//    rowIndex: 2
//  }
//
async function fetchAllSheetRecords(auth, spreadsheetId, tab, lastCol = 'R') {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A1:${lastCol}` // skip header
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log(`No data found in ${tab}.`);
    throw new Error(`No data found in ${tab}`);
  }

  const valueMap = createHeaderMap(rows.shift());
  return rows
    .map((row, index) => { return rowToRecord(row, index, valueMap) })
    .filter(n => n);
}

async function fetchSheetRecords(auth, spreadsheetId, tab, lastCol = 'R') {
  const records = await fetchAllSheetRecords(auth, spreadsheetId, tab, lastCol);
  return records
    .filter(n => n.topic && n.ministry?.length && n.videoLink && !n.imported);
}

async function markRecordIsImported(auth, spreadsheetId, tab, index, lastCol, pageId) {
  const sheets = google.sheets({ version: 'v4', auth });
  const values = [ [ pageId || 1 ] ];
  const resource = { values };

  const lastPos = `${lastCol || 'R'}${index}`;
  const range = `${tab}!${lastPos}:${lastPos}`;
  const params = {
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource
  };
  const result = await sheets.spreadsheets.values.update(params);

  console.log('%d cells updated.', result.data.updatedCells);
  return result;
}

function rowToRecord(row, index, valueMap) {
  if (row.length == 0) {
    return null;
  }

  return {
    ...Object.fromEntries(row.map((value, index) => {
      const key = [valueMap[index]];
      if (arrayKeys[key]) {
        if (!value) {
          return [];
        }
        return [key, value.split(',').map(n => n.trim())];
      }
      return [key, value.trim()];
    })),
    rowIndex: index + 2
  }
}

function toCamelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
            index === 0 ? match.toLowerCase() : match.toUpperCase()
        )
        .replace(/\s+/g, '');
}

function createHeaderMap(headerRow) {
  return Object.fromEntries(headerRow.map((value, index) => [index, toCamelCase(value)]));
}

async function fetchSchoolConfigSheet(auth, spreadsheetId, tab = 'Config') {
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tab}!A1:E`
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log(`No config data found in ${tab}.`);
      return [];
    }

    const valueMap = createHeaderMap(rows.shift());
    const configs = rows
      .map((row) => {
        if (row.length === 0) return null;
        return Object.fromEntries(
          row.map((value, index) => [valueMap[index], value ? value.trim() : ''])
        );
      })
      .filter(config => {
        if (!config || !config.sheet || !config.tab || !config.notionPage || !config.importedField) {
          if (config) {
            console.log(`Skipping invalid config row - missing required fields: ${JSON.stringify(config)}`);
          }
          return false;
        }
        return true;
      })
      .map(config => ({
        sheet: config.sheet,
        tab: config.tab,
        notionPage: config.notionPage,
        importedField: config.importedField,
        isEnglish: config.english?.toLowerCase() === 'true' || config.english === '1'
      }));

    console.log(`Loaded ${configs.length} valid config(s) from sheet`);
    return configs;
  } catch (error) {
    console.log(`Failed to fetch config sheet: ${error.message}`);
    return [];
  }
}

async function fetchCalendarConfig(auth, spreadsheetId, tab = 'CalendarConfig') {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A1:F`
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log(`No config data found in ${tab}.`);
    return [];
  }

  const valueMap = createHeaderMap(rows.shift());
  const configs = rows
    .map((row) => {
      if (row.length === 0) return null;
      return Object.fromEntries(
        row.map((value, index) => [valueMap[index], value ? value.trim() : ''])
      );
    })
    .filter(config => {
      if (!config || !config.eventsSheet || !config.notionPage) {
        if (config) {
          console.log(`Skipping invalid config row - missing required fields: ${JSON.stringify(config)}`);
        }
        return false;
      }
      // gcal rows use the calendar API and leave the tab columns blank
      if (config.type !== 'gcal' && (!config.eventsTab || !config.metadataTab)) {
        console.log(`Skipping invalid config row - missing tab fields: ${JSON.stringify(config)}`);
        return false;
      }
      return true;
    })
    .map(config => ({
      eventsSheet: config.eventsSheet,
      eventsTab: config.eventsTab,
      metadataTab: config.metadataTab,
      notionPage: config.notionPage,
      type: config.type || 'ministry',
      title: config.title || '' // optional display title (used by gcal)
    }));

  console.log(`Loaded ${configs.length} valid calendar config(s) from sheet`);
  return configs;
}

async function fetchCalendarEvents(auth, spreadsheetId, tab, type = 'ministry') {
  const sheets = google.sheets({ version: 'v4', auth });

  // Different ranges for different types
  const range = type === 'fellowship' ? `${tab}!A1:F` : `${tab}!A1:E`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log(`No event data found in ${tab}.`);
    throw new Error(`No event data found in ${tab}`);
  }

  const valueMap = createHeaderMap(rows.shift());
  const events = rows
    .map((row, index) => { return rowToRecord(row, index, valueMap) })
    .filter(n => n);

  // Filter based on type - different required fields
  if (type === 'fellowship') {
    return events.filter(n => n.fellowshipActivity && n.fellowshipActivity !== '-');
  } else {
    return events.filter(n => n.eventName);
  }
}

const LA_TZ = 'America/Los_Angeles';

// Convert "YYYY-MM-DD" to "M/D/YYYY" (the format parseDateString expects).
function mdyFromIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${m}/${d}/${y}`;
}

// Build the date string for a Google Calendar event in LA time, reusing the range
// formats parseDateString already supports. GCal all-day end.date is exclusive.
function gcalDateString(event, isAllDay) {
  if (!isAllDay) {
    // Timed event: dateTime already comes back in LA time (events.list timeZone param),
    // so the "YYYY-MM-DD" prefix is the LA calendar date.
    return mdyFromIso(event.start.dateTime.slice(0, 10));
  }

  // All-day: start.date / end.date are plain "YYYY-MM-DD" (no timezone)
  const startIso = event.start.date;
  if (!event.end?.date) {
    return mdyFromIso(startIso);
  }

  // end.date is exclusive -> last actual day is end - 1 (compute in UTC to avoid shift)
  const [ey, em, ed] = event.end.date.split('-').map(Number);
  const lastUTC = new Date(Date.UTC(ey, em - 1, ed));
  lastUTC.setUTCDate(lastUTC.getUTCDate() - 1);
  const lastIso = isoFromUtcDate(lastUTC);

  // Single day
  if (lastIso <= startIso) {
    return mdyFromIso(startIso);
  }

  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ly, lm, ld] = lastIso.split('-').map(Number);

  // Same month/year range -> "M/DD-DD/YYYY"
  if (sy === ly && sm === lm) {
    return `${sm}/${sd}-${ld}/${sy}`;
  }

  // Cross-month range -> "M/D/YYYY -> M/D/YYYY"
  return `${mdyFromIso(startIso)} -> ${mdyFromIso(lastIso)}`;
}

// Format a Date built from UTC parts back to "YYYY-MM-DD" using its UTC fields.
function isoFromUtcDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Format the time portion of a GCal event for display.
// Timed events -> "10:00 AM – 11:30 AM"; all-day -> "All day".
function gcalTimeString(event, isAllDay) {
  if (isAllDay) {
    return 'All day';
  }
  const opts = { hour: 'numeric', minute: '2-digit', timeZone: LA_TZ };
  const start = new Date(event.start.dateTime);
  const startStr = start.toLocaleTimeString('en-US', opts);
  if (event.end?.dateTime) {
    const end = new Date(event.end.dateTime);
    return `${startStr} – ${end.toLocaleTimeString('en-US', opts)}`;
  }
  return startStr;
}

// Fetch events directly from the Google Calendar API and shape them to the
// fellowship event record format used by calendar.js.
async function fetchGoogleCalendarEvents(auth, calendarId) {
  const cal = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString();

  const res = await cal.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
    timeZone: LA_TZ // return all dateTimes in LA time so we can read them directly
  });

  const items = res.data.items || [];
  return items.map(event => {
    const isAllDay = !event.start?.dateTime;
    return {
      churchActivity: (event.summary || 'Event').trim(),
      detail: event.description ? event.description.replace(/<[^>]+>/g, '').trim() : '',
      time: gcalTimeString(event, isAllDay),
      date: gcalDateString(event, isAllDay)
    };
  }).filter(e => e.churchActivity);
}

async function fetchSheetModifiedTime(auth, spreadsheetId) {
  const drive = google.drive({ version: 'v3', auth });
  try {
    const res = await drive.files.get({
      fileId: spreadsheetId,
      fields: 'modifiedTime'
    });
    return res.data.modifiedTime;
  } catch (error) {
    console.log(`Failed to fetch sheet modified time: ${error.message}`);
    throw error;
  }
}

async function fetchCalendarMetadata(auth, spreadsheetId, tab) {
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tab}!A1:B`
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log(`No metadata found in ${tab}.`);
      return { title: 'Event Calendar', created: 'N/A', updated: 'N/A', monthNotes: {} };
    }

    // Skip header row and convert to object
    const metadata = {};
    const monthNotes = {};

    rows.slice(1).forEach(row => {
      if (row.length >= 2) {
        const key = row[0].trim();
        const value = row[1].trim();

        // Check if this is a month note (pattern: "Month YYYY")
        const monthPattern = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/;
        if (monthPattern.test(key)) {
          monthNotes[key] = value;
        } else {
          metadata[key.toLowerCase()] = value;
        }
      }
    });

    // Use current date if Updated is missing
    const today = new Date();
    const currentDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    return {
      title: metadata.title || 'Event Calendar',
      subtitle: metadata.subtitle || '',
      created: metadata.created || null,
      updated: metadata.updated || currentDate,
      mode: metadata.mode || 'all',
      padding: metadata.padding || 'default',
      monthNotes
    };
  } catch (error) {
    console.log(`Failed to fetch metadata: ${error.message}`);
    // Use current date for updated
    const today = new Date();
    const currentDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    return { title: 'Event Calendar', subtitle: '', created: null, updated: currentDate, mode: 'all', padding: 'default', monthNotes: {} };
  }
}

export default {
  fetchSheetRecords,
  fetchAllSheetRecords,
  fetchSundaySchoolSheetRecords,
  markRecordIsImported,
  fetchSchoolConfigSheet,
  fetchCalendarConfig,
  fetchCalendarEvents,
  fetchGoogleCalendarEvents,
  fetchCalendarMetadata,
  fetchSheetModifiedTime
}
