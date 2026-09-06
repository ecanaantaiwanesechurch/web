import gBase from '../src/base/google_base.js';
import gWorker from '../src/base/google_sheets.js';
import nWorker from '../src/base/notion.js';
import { DEFAULT_COVER, videoCover } from '../src/base/video_thumbnail.js';
import { sleep } from '../src/base/utils.js';
import { argv } from 'node:process';

const sheet = '1wS5R_yxItbRPVkO2BL0vOwxAq1T9PXnIzOikJTJGvmU';
const args = argv.slice(2).filter(a => !a.startsWith('--'));
const flags = argv.slice(2).filter(a => a.startsWith('--'));

const tabName = args[0] || '2026';
const months = args[1] === 'all' ? null : Number(args[1] || 2);
const apply = flags.includes('--apply');
const force = flags.includes('--force');

function currentCoverUrl(page) {
  return page.cover?.external?.url || page.cover?.file?.url || null;
}

(async () => {
  const auth = await gBase.authorizeServiceAccount();
  const records = await gWorker.fetchAllSheetRecords(auth, sheet, tabName, 'L');
  const notion = await nWorker.createNotionClient();

  let cutoff = null;
  if (months !== null) {
    cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
  }

  const targets = records
    .filter(r => r.topic && r.videoLink && r.date && r.imported?.length > 5)
    .filter(r => !cutoff || new Date(r.date) >= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  console.log(`${targets.length} synced sermon(s) in ${tabName}${cutoff ? ` since ${cutoff.toDateString()}` : ''}`);
  console.log(apply ? 'MODE: apply\n' : 'MODE: dry run (pass --apply to write)\n');

  const counts = { updated: 0, unchanged: 0, custom: 0, noThumbnail: 0, failed: 0 };

  for (const r of targets) {
    console.log(`${r.date}  ${r.ministry}  ${r.topic}`);
    try {
      const page = await notion.pages.retrieve({ page_id: r.imported });
      const current = currentCoverUrl(page);
      const cover = await videoCover(r.videoLink);
      const next = cover.external.url;

      console.log(`  from: ${current || '(none)'}`);
      console.log(`  to:   ${next}`);

      if (next === DEFAULT_COVER) {
        console.log('  skip: no thumbnail resolved\n');
        counts.noThumbnail++;
      } else if (current === next) {
        console.log('  skip: already set\n');
        counts.unchanged++;
      } else if (current && current !== DEFAULT_COVER && !force) {
        console.log('  skip: custom cover, use --force to replace\n');
        counts.custom++;
      } else if (!apply) {
        console.log('  would update\n');
        counts.updated++;
      } else {
        await nWorker.updatePageCover(notion, r.imported, cover);
        console.log('  updated\n');
        counts.updated++;
        await sleep(350);
      }
    } catch(error) {
      console.error(`  failed: ${error}\n`);
      counts.failed++;
    }
    await sleep(120);
  }

  console.log(JSON.stringify(counts));
})();
