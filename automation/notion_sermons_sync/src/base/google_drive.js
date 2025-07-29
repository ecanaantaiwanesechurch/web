import { google } from 'googleapis';

async function listAlbumFiles(auth, albums) {
  return await Promise.all(albums.map(async album => {
    const items = await listFiles(auth, album.fileId);
    return { album, items }
  }));
}

async function listFiles(auth, fileId) {
  const drive = google.drive({version: 'v3', auth });
  const res = await drive.files.list({
    q: `'${fileId}' in parents and trashed = false`,
    fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink, imageMediaMetadata, modifiedTime)',
    orderBy: 'modifiedTime desc',
    spaces: 'drive',
    pageSize: 50,
  });

  if (res.error) {
    throw res.error;
  }

  return res.data.files || [];
}


export default {
  listAlbumFiles,
  listFiles
}
