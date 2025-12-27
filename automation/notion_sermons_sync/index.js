import functions from '@google-cloud/functions-framework';
import { syncSermons } from './src/functions/sync_sermons.js';
import { syncSundaySchools } from './src/functions/sync_sunday_school.js';
import { syncVideos } from './src/functions/sync_videos.js';
import { syncPhotos } from './src/functions/sync_photos.js';
import { syncCalendar } from './src/functions/sync_calendar.js';
import { parseJwt } from './src/base/utils.js';


function logAuth(req, name) {
  const auth = parseJwt(req.header('Authorization'));
  console.log(`Starting ${name} by ${auth}`);
}

functions.http('syncSermons', async (req, res) => {
  logAuth(req, `syncSermons ${req.body}`);
  try {
    await syncSermons(req.body);
    const tabName = req.body?.tab || '';
    res.send(`Sync Sermons Done. ${tabName}`);
  } catch(error) {
    console.log(error);
    res.send('Sync Sermons Failed');
  }
});

functions.http('syncSundaySchools', async (req, res) => {
  logAuth(req, `syncSundaySchools ${req.body?.tab} ${req.body?.sheet}`);
  try {
    await syncSundaySchools(req.body);
    res.send('Sync Sunday Schools Done.');
  } catch(error) {
    console.log(error);
    res.send('Sync Sunday Schools Failed.');
  }
});

functions.http('syncVideos', async (req, res) => {
  logAuth(req, 'syncVideos');
  try {
    await syncVideos();
    res.send('Sync Videos Done.');
  } catch(error) {
    console.log(error);
    res.send('Sync Videos Failed.');
  }
});

functions.http('syncPhotos', async (req, res) => {
  logAuth(req, 'syncPhotos');
  try {
    await syncPhotos();
    res.send('Sync Photos Done.');
  } catch(error) {
    console.log(error);
    res.send('Sync Photos Failed.');
  }
});

functions.http('syncCalendar', async (req, res) => {
  logAuth(req, 'syncCalendar');
  try {
    await syncCalendar(req.body);
    res.send('Sync Calendar Done.');
  } catch(error) {
    console.log(error);
    res.send('Sync Calendar Failed.');
  }
});
