import gBase from '../base/google_base.js';
import gWorker from '../base/google_sheets.js';
import gDrive from '../base/google_drive.js';
import ytWorker from '../base/youtube.js';

const defaultConfig = {
  playlistId: 'PLCbKBj7iUSEDErpxscgLCIhp7c1L8MCbZ',
  sheet: '1wS5R_yxItbRPVkO2BL0vOwxAq1T9PXnIzOikJTJGvmU',
  tabName: '2026',
  newsletterFolder: '1yC05WV1cNFJw_XrrZ890OBUPu0isufsI',
  ministry: 'MM',
  count: 2,
  dryRun: true,
};

const LABELS = {
  '講員': 'speakers',
  '講道主題': 'topic',
  '講道經節': 'verses',
  '本週金句': 'weeklyVerse',
};

const HEADER_KEYS = {
  'Date': 'date',
  'Topic': 'topic',
  'Speakers': 'speakers',
  'Verses': 'verses',
  'Ministry': 'ministry',
  'Video Link': 'videoLink',
  'Newsletter': 'newsletter',
  'Weekly Verse': 'weeklyVerse',
};

const SHEETS_EPOCH = Date.UTC(1899, 11, 30);
const DAY_MS = 86400000;

async function syncYouTubeSermons(options = {}) {
  const config = { ...defaultConfig, ...options };
  const auth = await gBase.authorizeServiceAccount(['https://www.googleapis.com/auth/youtube.readonly']);

  const [videos, { header, rows }, newsletters] = await Promise.all([
    ytWorker.fetchPlaylistVideos(auth, config.playlistId, config.count),
    gWorker.fetchSheetRows(auth, config.sheet, config.tabName, 'L'),
    gDrive.listFiles(auth, config.newsletterFolder),
  ]);

  const dateCol = header.indexOf('Date');
  const ministryCol = header.indexOf('Ministry');
  const existingDates = new Set(rows
    .filter(r => [config.ministry, 'All'].includes(r[ministryCol]))
    .map(r => toIsoDate(r[dateCol])));

  const results = [];
  // Oldest first so the newest video ends up on the top row
  for (const video of [...videos].reverse()) {
    const record = parseVideo(video, config.ministry);

    if (!record.date) {
      results.push({ status: 'skipped', reason: 'no date in title', record });
      continue;
    }
    if (!record.date.startsWith(config.tabName)) {
      results.push({ status: 'skipped', reason: `date not in tab ${config.tabName}`, record });
      continue;
    }

    record.newsletter = findNewsletter(newsletters, record.date);
    const values = header.map(h => {
      const key = HEADER_KEYS[h];
      if (key === 'date') {
        return toSheetsDate(record.date);
      }
      return record[key] ?? '';
    });

    if (existingDates.has(record.date)) {
      results.push({ status: 'skipped', reason: 'already in sheet', record, values });
      continue;
    }

    if (!config.dryRun) {
      await gWorker.insertRowAtTop(auth, config.sheet, config.tabName, values);
    }
    existingDates.add(record.date);
    results.push({ status: config.dryRun ? 'dry-run' : 'inserted', record, values });
  }

  console.log(JSON.stringify(results, null, 2));
  return results;
}

function parseVideo(video, ministry) {
  const record = {
    date: parseTitleDate(video.snippet.title),
    ministry,
    videoLink: `https://youtu.be/${video.id}`,
    title: video.snippet.title,
  };

  const unlabeled = [];
  const lines = video.snippet.description
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  for (const line of lines) {
    const match = line.match(/^(.+?)\s*[：:]\s*(.*)$/);
    const key = match && LABELS[match[1]];
    if (key) {
      record[key] = match[2];
    } else {
      unlabeled.push(line);
    }
  }

  // Older descriptions put the verses on an unlabeled line
  record.verses ??= unlabeled[0];
  return record;
}

function parseTitleDate(title) {
  const match = title.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) {
    return null;
  }
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function findNewsletter(files, isoDate) {
  const prefix = isoDate.replaceAll('-', '');
  const matches = files.filter(f => f.name.startsWith(prefix));
  const file = matches.find(f => /final/i.test(f.name)) || matches[0];
  return file ? `https://drive.google.com/file/d/${file.id}/view?usp=sharing` : undefined;
}

function toSheetsDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return (Date.UTC(year, month - 1, day) - SHEETS_EPOCH) / DAY_MS;
}

function toIsoDate(value) {
  if (typeof value === 'number') {
    return new Date(SHEETS_EPOCH + value * DAY_MS).toISOString().slice(0, 10);
  }
  return String(value ?? '').trim();
}

export { syncYouTubeSermons }
