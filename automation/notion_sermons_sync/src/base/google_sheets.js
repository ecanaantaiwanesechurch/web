import { google } from 'googleapis';

const arrayKeys = {
  tags: 1,
  speakers: 1,
  verses: 1
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
async function fetchSheetRecords(auth, spreadsheetId, tab, lastCol = 'R') {
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
    .filter(n => n)
    .filter(n => n.topic && n.ministry && n.videoLink && !n.imported);
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

export default {
  fetchSheetRecords,
  fetchSundaySchoolSheetRecords,
  markRecordIsImported,
  fetchSchoolConfigSheet
}
