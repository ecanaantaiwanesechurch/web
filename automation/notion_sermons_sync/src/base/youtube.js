import { google } from 'googleapis';

// Returns videos in playlist order; private/deleted videos are dropped by videos.list.
async function fetchPlaylistVideos(auth, playlistId, count) {
  const youtube = google.youtube({ version: 'v3', auth });
  const items = await youtube.playlistItems.list({
    part: ['contentDetails'],
    playlistId,
    maxResults: count,
  });

  const ids = (items.data.items || []).map(i => i.contentDetails.videoId);
  if (ids.length === 0) {
    return [];
  }

  const videos = await youtube.videos.list({
    part: ['snippet', 'status', 'liveStreamingDetails'],
    id: ids,
  });
  const byId = Object.fromEntries(videos.data.items.map(v => [v.id, v]));
  return ids.map(id => byId[id]).filter(v => v);
}

export default {
  fetchPlaylistVideos
}
