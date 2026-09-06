import gBase from '../src/base/google_base.js';
import gWorker from '../src/base/google_sheets.js';
import { videoThumbnailUrl } from '../src/base/video_thumbnail.js';
import { argv } from 'node:process';

const sheet = '1wS5R_yxItbRPVkO2BL0vOwxAq1T9PXnIzOikJTJGvmU';
const tabName = argv[2] || '2026';
const months = Number(argv[3] || 2);

(async () => {
  const auth = await gBase.authorizeServiceAccount();
  const records = await gWorker.fetchAllSheetRecords(auth, sheet, tabName, 'L');

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  const recent = records
    .filter(r => r.topic && r.videoLink && r.date)
    .filter(r => new Date(r.date) >= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  console.log(`${recent.length} sermon(s) in ${tabName} since ${cutoff.toDateString()}\n`);

  for (const r of recent) {
    const url = await videoThumbnailUrl(r.videoLink);
    let status = 'no thumbnail (falls back to gradient cover)';
    if (url) {
      const res = await fetch(url, { method: 'HEAD' });
      status = `${res.status} ${res.headers.get('content-type')} ${res.headers.get('content-length') || '?'}b`;
    }
    console.log(`${r.date}  ${r.ministry}  ${r.topic}`);
    console.log(`  video: ${r.videoLink}`);
    console.log(`  cover: ${url || '-'}`);
    console.log(`  check: ${status}\n`);
  }
})();
