const DEFAULT_COVER = 'https://www.notion.so/images/page-cover/gradients_8.png';
const FETCH_TIMEOUT = 5000;
const VIMEO_WIDTH = 640;

function youtubeVideoId(href) {
  const url = new URL(href);
  if (url.host === 'youtu.be') {
    return url.pathname.split('/')[1];
  }

  const param = url.searchParams.get('v') || url.searchParams.get('V');
  if (param) {
    return param;
  }

  return /^\/(?:embed|live|shorts|v)\/([^/?]+)/.exec(url.pathname)?.[1];
}

function youtubeThumbnail(href) {
  const videoId = youtubeVideoId(href);
  if (!videoId) {
    return null;
  }
  // hqdefault is the largest size every upload has; maxresdefault 404s on some.
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

// Vimeo CDN paths are opaque ids, so the thumbnail has to be looked up.
async function vimeoThumbnail(href) {
  const endpoint = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(href)}&width=${VIMEO_WIDTH}`;
  const res = await fetch(endpoint, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });

  if (!res.ok) {
    console.log(`Vimeo oEmbed failed for ${href}: ${res.status}`);
    return null;
  }

  const thumbnail = (await res.json()).thumbnail_url;
  if (!thumbnail) {
    return null;
  }
  // oEmbed picks its own size; the CDN resizes to whatever suffix we ask for.
  return thumbnail.replace(/-d_\d+(\?|$)/, `-d_${VIMEO_WIDTH}$1`);
}

async function videoThumbnailUrl(videoLink) {
  if (!videoLink) {
    return null;
  }

  try {
    if (/youtu/i.test(videoLink)) {
      return youtubeThumbnail(videoLink);
    }
    if (/vimeo/i.test(videoLink)) {
      return await vimeoThumbnail(videoLink);
    }
  } catch(error) {
    console.log(`No thumbnail for ${videoLink}: ${error}`);
  }

  return null;
}

async function videoCover(videoLink) {
  const url = await videoThumbnailUrl(videoLink);
  return { external: { url: url || DEFAULT_COVER } };
}

export { DEFAULT_COVER, youtubeVideoId, videoThumbnailUrl, videoCover };
