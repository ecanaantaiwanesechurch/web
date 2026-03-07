import gBase from '../base/google_base.js';
import gWorker from '../base/google_sheets.js';
import nWorker from '../base/notion.js';
import { sleep }  from '../base/utils.js';

const defaultConfig = {
  sheet: '1wS5R_yxItbRPVkO2BL0vOwxAq1T9PXnIzOikJTJGvmU',
  tabName: '2026',
  importedField: 'L',
  database: '5b3cd3c02a3b4b34890c19ce0a1492ce',
  // database: '223d59a574244c0b991871c3351bb714', // test
  mmPage: 'ee2db5d6dc2d4027be6eb65bf5ff0a66'
};

/// Sermon
async function syncSermons(options = {}) {
  const config = { ...defaultConfig, ...options };
  try {
    const auth = await gBase.authorizeServiceAccount();
    const records = await gWorker.fetchSheetRecords(auth, config.sheet, config.tabName, 'L');

    if (records.length == 0) {
      console.log('No New Records');
      return;
    }

    console.log(`Importing ${records.length}`);

    const notion = await nWorker.createNotionClient();

    for (const r of records) {
      try {
        console.log(`Importing Sermon: ${JSON.stringify(r)}`);
        const pageId = await nWorker.createSermonRecord(notion, config.database, r, false);
        await gWorker.markRecordIsImported(auth, config.sheet, config.tabName, r.rowIndex, config.importedField, pageId);
        console.log(`Importing: ${r.rowIndex} done.\n`);
        await sleep(350); // avoid rate limits
      } catch(error) {
        console.error(`Fail to create sermon record ${r.rowIndex}: ${error}\n`);
      }
    }

    console.log('Update highligt sermons.');
    const mmRecord = await nWorker.updateSermonHighlight(notion, config.database, 'MM');
    await nWorker.updateMMPage(notion, config.mmPage, mmRecord);

    console.log('Done');
  } catch(error) {
    console.error(error);
  }
}

export { syncSermons }
