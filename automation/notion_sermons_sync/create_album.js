import gBase from './src/base/google_base.js';
import gDrive from './src/base/google_drive.js';
import { galleryHtml } from './src/base/gallery.js';

import { argv, exit } from 'node:process';

const fileId = argv[2];
if (!fileId) {
  console.log('Missing fileId id.');
  exit(0);
}

const target = argv[3];
if (!target) {
  console.log('Missing target.');
  exit(0);
}

(async () => {
  console.log(`Fetcing albums: ${target} ${fileId}`);
  const auth = await gBase.authorize();
  const items = await gDrive.listFiles(auth, fileId);

  console.log(`File count: ${items.length}`);

  const album = { items,
    album: {
      target: target,
      id: `${fileId}`
    }
  };

  const html = galleryHtml(album);
  console.log(html);
})();
