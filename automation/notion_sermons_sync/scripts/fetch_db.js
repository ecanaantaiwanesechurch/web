import nWorker from '../src/base/notion.js';
import { argv, exit } from 'node:process';

const databaseId = argv[2];
if (!databaseId) {
  console.log('Missing database id.');
  exit(0);
}

(async () => {
  const notion = await nWorker.createNotionClient();
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [],
  });

  console.log(JSON.stringify(response, null, 2));
})();

