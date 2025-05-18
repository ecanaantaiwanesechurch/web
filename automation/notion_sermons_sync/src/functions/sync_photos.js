import gBase from '../base/google_base.js';
// import gPhotos from '../base/google_photos.js';
import gDrive from '../base/google_drive.js';
import nWorker from '../base/notion.js';
import { sleep }  from '../base/utils.js';

const defaultConfig = {
  albums: [
    {
      albumTitle: 'CTCC All',
      target: 'allgallery',
      fileId: '1ESKhwp6tK3l1Cvg2FQNpRLp4Y4p2nefa',
    },
    {
      albumTitle: 'CTCC TM',
      target: 'tmgallery',
      fileId: '1ttEfmu82UpxRkfFgLJFedIoizpfhV5DZ',
    },
    {
      albumTitle: 'CTCC MM',
      target: 'mmgallery',
      fileId: '1A_DPq12jlowHz9ay_sAydOZHmH2oKsYH',
    },
    {
      albumTitle: 'CTCC EM',
      target: 'emgallery',
      fileId: '125qRKrhjupMwKT0SGlPqIeaJ2GHwIkVq',
    },
    {
      albumTitle: 'CTCC YM',
      target: 'ymgallery',
      fileId: '1OhGNI87vvYR2QVsj2hf5hd_mgXpIZKHi',
    },
    {
      albumTitle: 'CTCC CM',
      target: 'cmgallery',
      fileId: '1jBazHd2J-Da1sGHooOApPhUbIXW9ZaOu',
    },
    {
      albumTitle: 'CTCC Dance Team',
      target: 'ccdancegallery',
      fileId: '1zzqHz6o0GqqMiVeyT9_oZJh9HDXEZomt',
    }
  ],
  pageId: '140ba8467b7a80b4ada4c51047ad9b67'
};

async function syncPhotos(options = {}) {
  const config = { ...defaultConfig, ...options };
  try {
    console.log(`Fetcing albums: ${config.albums.map(n => n.albumTitle)}`);
    const auth = await gBase.authorize();
    const albums = await gDrive.listAlbumFiles(auth, config.albums);
    // const albums = await gPhotos.fetchAlumbs(auth, config.albums);

    console.log(`Updating page: ${config.pageId}`);
    const notion = await nWorker.createNotionClient();
    for (const album of albums) {
      await nWorker.updateAlumb(notion, album, config.pageId);
      await sleep(350); // avoid rate limits
    }
    console.log(`Sync Photos Done`);
  } catch(error) {
    console.error(error);
  }
}

export { syncPhotos }
