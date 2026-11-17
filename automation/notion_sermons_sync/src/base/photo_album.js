import { createHash } from 'crypto';
import { sleep } from './utils.js';

// Editor-owned line in a Notion code block, e.g. `super-embed: <!-- cc-photo-album: all,tm -->`
const MARKER = /<!--\s*cc-photo-album:\s*([^|>]+?)\s*(?:\|\s*(\w+)\s*)?-->/;
const SIG = /<!--\s*cc-photo-album-sig:\s*(\w+)\s*-->/;
const CONTAINERS = new Set(['column_list', 'column', 'toggle', 'callout']);

async function listChildren(notion, blockId) {
  const results = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({ block_id: blockId, page_size: 100, start_cursor: cursor });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function findMarkedBlocks(notion, blockId) {
  const found = [];
  for (const block of await listChildren(notion, blockId)) {
    if (block.type === 'code') {
      const text = block.code.rich_text.map(t => t.plain_text).join('');
      if (MARKER.test(text)) { found.push({ block, text }); }
    } else if (block.has_children && CONTAINERS.has(block.type)) {
      found.push(...await findMarkedBlocks(notion, block.id));
    }
  }
  return found;
}

function photo(item) {
  const meta = item.imageMediaMetadata || item.videoMediaMetadata || {};
  let w = meta.width || 1920;
  let h = meta.height || 1080;
  // Drive reports the stored size; Google's image server applies the rotation.
  if (meta.rotation % 2 === 1) { [w, h] = [h, w]; }
  const p = { id: item.id, w, h };
  if (item.mimeType.startsWith('video/')) { p.v = 1; }
  return p;
}

function payload(keys, layout, albumsByKey) {
  const albums = keys.map(key => {
    const { album, items } = albumsByKey[key];
    const photos = items
      .filter(item => /^(image|video)\//.test(item.mimeType || ''))
      .map(photo);
    return { key, zh: album.zh, en: album.en, photos };
  });
  return { layout: layout || (albums.length > 1 ? 'tabs' : 'wall'), albums };
}

function blockText(header, data) {
  // Super runs every <script> in an embed as JavaScript, so the data rides in an inert <template>.
  const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/&/g, '\\u0026');
  const body = `<div class="cc-photo-album" data-layout="${data.layout}"><template>${json}</template></div>`;
  const sig = createHash('sha1').update(body).digest('hex').slice(0, 16);
  const head = header.trim().startsWith('super-embed:') ? header.trim() : `super-embed: ${header.trim()}`;
  return { sig, text: `${head}\n<!-- cc-photo-album-sig: ${sig} -->\n${body}` };
}

function chunk(str, size) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push({ text: { content: str.slice(i, i + size) } });
  }
  return chunks;
}

async function syncPhotoAlbums(notion, pageIds, albums) {
  const albumsByKey = Object.fromEntries(albums.filter(a => a.album.key).map(a => [a.album.key, a]));

  for (const pageId of pageIds) {
    const blocks = await findMarkedBlocks(notion, pageId);
    console.log(`cc-photo-album: ${blocks.length} block(s) on ${pageId}`);

    for (const { block, text } of blocks) {
      const header = text.split('\n').find(line => MARKER.test(line));
      const [, keyList, layout] = MARKER.exec(header);
      const keys = keyList.split(',').map(k => k.trim()).filter(Boolean);
      const unknown = keys.filter(k => !albumsByKey[k]);
      if (unknown.length) {
        console.error(`cc-photo-album: unknown album key(s) ${unknown.join(',')} in block ${block.id}. skipped.`);
        continue;
      }

      const next = blockText(header, payload(keys, layout, albumsByKey));
      if (SIG.exec(text)?.[1] === next.sig) {
        console.log(`cc-photo-album: ${keyList} unchanged. skipped.`);
        continue;
      }

      await notion.blocks.update({ block_id: block.id, code: { rich_text: chunk(next.text, 2000) } });
      console.log(`cc-photo-album: ${keyList} updated (${next.text.length} chars) ${block.id}`);
      await sleep(350);
    }
  }
}

export default { syncPhotoAlbums };
