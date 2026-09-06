import nWorker from '../src/base/notion.js';
import { argv, exit } from 'node:process';

const pageId = argv[2];
if (!pageId) {
  console.log('Missing page id.');
  exit(0);
}

(async () => {
  const notion = await nWorker.createNotionClient();
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });

  console.log(JSON.stringify(blocks, null, 2));

  const database = blocks.results.filter((block) => block.type === 'child_database')[0];
  if (database) {
    console.log(`\nDatabase id: ${database.id}`);
  }
})();
