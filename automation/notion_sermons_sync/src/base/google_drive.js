import { google } from 'googleapis';

async function listAlbumFiles(auth, albums) {
  return await Promise.all(albums.map(async album => {
    const items = await listFiles(auth, album.fileId, album.limit);
    // Bulk uploads share one modified time; capture time keeps an event in order.
    if (album.sort === 'taken') {
      const taken = item => item.imageMediaMetadata?.time || item.modifiedTime || '';
      items.sort((a, b) => taken(a).localeCompare(taken(b)));
    }
    return { album, items }
  }));
}

async function listFiles(auth, fileId, limit = 50) {
  const drive = google.drive({version: 'v3', auth });
  const files = [];
  let pageToken;
  do {
    const res = await drive.files.list({
      q: `'${fileId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink, imageMediaMetadata, videoMediaMetadata, modifiedTime)',
      orderBy: 'modifiedTime desc',
      spaces: 'drive',
      pageSize: Math.min(limit - files.length, 100),
      pageToken,
    });

    if (res.error) {
      throw res.error;
    }

    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken;
  } while (pageToken && files.length < limit);

  return files;
}


export default {
  listAlbumFiles,
  listFiles
}
