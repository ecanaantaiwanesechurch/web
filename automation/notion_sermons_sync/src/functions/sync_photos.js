import gBase from '../base/google_base.js';
// import gPhotos from '../base/google_photos.js';
import gDrive from '../base/google_drive.js';
import nWorker from '../base/notion.js';
import photoAlbum from '../base/photo_album.js';

const defaultConfig = {
  albums: [
    {
      key: 'all',
      zh: '最新花絮',
      en: 'Recent Events',
      fileId: '1ESKhwp6tK3l1Cvg2FQNpRLp4Y4p2nefa',
    },
    {
      key: 'tm',
      zh: '台語事工',
      en: 'Taiwanese Ministry',
      fileId: '1ttEfmu82UpxRkfFgLJFedIoizpfhV5DZ',
    },
    {
      key: 'mm',
      zh: '華語事工',
      en: 'Mandarin Ministry',
      fileId: '1A_DPq12jlowHz9ay_sAydOZHmH2oKsYH',
    },
    {
      key: 'em',
      zh: '英語事工',
      en: 'English Ministry',
      fileId: '125qRKrhjupMwKT0SGlPqIeaJ2GHwIkVq',
    },
    {
      key: 'ym',
      zh: '青少事工',
      en: 'Youth Ministry',
      fileId: '1OhGNI87vvYR2QVsj2hf5hd_mgXpIZKHi',
    },
    {
      key: 'cm',
      zh: '兒童事工',
      en: 'Children\'s Ministry',
      fileId: '1jBazHd2J-Da1sGHooOApPhUbIXW9ZaOu',
    },
    {
      key: 'dance',
      zh: '兒童舞蹈團',
      en: 'Children Dance Team',
      fileId: '1zzqHz6o0GqqMiVeyT9_oZJh9HDXEZomt',
    },
    {
      key: 'gospel2026',
      zh: '2026 福音晚會',
      en: '2026 Gospel Night',
      fileId: '1oGmZgqdseg3-OxfKDhgYpti4dXNgTatX',
      limit: 300,
      sort: 'taken',
    },
    {
      key: 'mmgospel2025',
      zh: '2025 華語福音晚會',
      en: '2025 Mandarin Gospel Night',
      fileId: '1qokEYRfo316dqqzDtYHO2dqmqd1_OCpZ',
      limit: 300,
      sort: 'taken',
    }
  ],
  // Pages scanned for `<!-- cc-photo-album: ... -->` code blocks
  pages: [
    '140ba8467b7a80b4ada4c51047ad9b67', // /photos
    '3c9ba8467b7a808dbd93ffa736104a6c', // /events/2026-gospel-night
    '264ba8467b7a807faf7ef1505c3723a9', // /events/2025-mm-gospel-night
  ],
};

async function syncPhotos(options = {}) {
  const config = { ...defaultConfig, ...options };
  try {
    console.log(`Fetching albums: ${config.albums.map(n => n.key)}`);
    const auth = await gBase.authorizeServiceAccount();
    const albums = await gDrive.listAlbumFiles(auth, config.albums);
    // const albums = await gPhotos.fetchAlumbs(auth, config.albums);

    const notion = await nWorker.createNotionClient();
    await photoAlbum.syncPhotoAlbums(notion, config.pages, albums);
    console.log(`Sync Photos Done`);
  } catch(error) {
    console.error(error);
  }
}

export { syncPhotos }
