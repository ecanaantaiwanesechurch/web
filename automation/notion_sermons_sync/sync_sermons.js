import gWorker from './src/google_sheets.js';
import nWorker from './src/notion.js';

const sermonsSheet = '1wS5R_yxItbRPVkO2BL0vOwxAq1T9PXnIzOikJTJGvmU';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/// Sermon
(async () => {
  try {
    const tabName = '2024';
    const importedField = 'J';
    const auth = await gWorker.authorize();
    const records = await gWorker.fetchSheetRecords(auth, sermonsSheet, tabName);

    if (records.length == 0) { return; }

    const notion = await nWorker.createNotionClient();

    for (const r of records) {
      try {
        console.log(`Importing Sermon: ${JSON.stringify(r)}`);
        const pageId = await nWorker.createSermonRecord(notion, r, false);
        await gWorker.markRecordIsImported(auth, sermonsSheet, tabName, r.rowIndex, importedField, pageId);
        console.log(`Importing: ${r.rowIndex} done.\n`);
        await sleep(350); // avoid rate limits
      } catch(error) {
        console.error(`Fail to create sermon record ${r.rowIndex}: ${error}\n`);
      }
    }
  } catch(error) {
    console.error(error);
  }
})();
