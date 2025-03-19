import gBase from '../base/google_base.js';
import gWorker from '../base/google_sheets.js';
import nWorker from '../base/notion.js';
import { sleep }  from '../base/utils.js';

const sundaySchoolConfigs = [
//  { // 2024 Q1 約書亞記
//    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
//    tab: '2024 Q1 約書亞記',
//    notionPage: '6c2ea71bcbbd418abdf9511875de40ad',
//    importedField: 'H'
//  },
//  { // 舊約聖經人物
//    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
//    tab: '2024 Q4 舊約聖經人物',
//    notionPage: '7246406bc3db431f8d412e87e5dde435',
//    importedField: 'H'
//  },
//  { // 基督徒生活造就
//    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
//    tab: '2024 Q4 基督徒生活造就',
//    notionPage: '0f82d566bb7449c4a2ad210574a3f97f',
//    importedField: 'H'
//  },
  // { // 2025 Q1 聖經人物
  //   sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
  //   tab: '2025Q1 慕道班-聖經人物',
  //   notionPage: 'ac83c938aee4416cb3b61b1c2f709b07',
  //   importedField: 'H'
  // },
  // { // 登山寶訓
  //   sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
  //   tab: '2025Q1 信徒班-登山寶訓',
  //   notionPage: '1acba8467b7a8074861ec2ff0b91fb14',
  //   importedField: 'H'
  // },
  // { // 以弗所書
  //   sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
  //   tab: '2025Q1 信徒班-以弗所書',
  //   notionPage: 'fd7555a59b21416b9e93d34ec9a5bae5',
  //   importedField: 'H'
  // },
  //   { // 聖經人物
  //   sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
  //   tab: '2025Q1 慕道班-聖經人物',
  //   notionPage: 'ac83c938aee4416cb3b61b1c2f709b07',
  //   importedField: 'H'
  // },
  { // 但以理+約瑟
    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
    tab: '2025Q2 信徒班-但以理+約瑟',
    notionPage: '1baba8467b7a80f2b995c89c9e1d5af7',
    importedField: 'H'
  },
  { // 羅馬書上
    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
    tab: '2025Q2 信徒班-羅馬書上',
    notionPage: '2256f869672640509fde648116bd5b7d',
    importedField: 'H'
  },
  { // 有意思的使徒信經
    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
    tab: '2025Q2 慕道班-有意思的使徒信經',
    notionPage: '19eba8467b7a80ec8772c9b580cce359',
    importedField: 'H'
  },
];

async function syncSundaySchools() {
  const auth = await gBase.authorize();
  const notion = await nWorker.createNotionClient();
  for (const config of sundaySchoolConfigs) {
    try {
      // const tabName = '2024';
      const records = await gWorker.fetchSundaySchoolSheetRecords(auth, config.sheet, config.tab);

      if (records.length == 0) {
        console.log(`${config.tab} are all imported.`)
        continue;
      }

      console.log(`Processing ${config.tab}. ${records.length}`)

      const blocks = await notion.blocks.children.list({
        block_id: config.notionPage,
        page_size: 50,
      });
      const database = blocks.results.filter((block) => block.type === 'child_database')[0];
      if (!database) {
        console.log(`Database for ${config.tab} not found.`)
        continue;
      }

      for (const r of records) {
        try {
          console.log(`Importing Sermon: ${JSON.stringify(r)}`);
          const pageId = await nWorker.createSundaySchoolRecord(notion, database.id, r, config.isEnglish);
          await gWorker.markRecordIsImported(auth, config.sheet, config.tab, r.rowIndex, config.importedField, pageId);
          console.log(`Importing: ${r.rowIndex} done.\n`);
          await sleep(350); // avoid rate limits
        } catch(error) {
          console.error(`Fail to create sermon record ${r.rowIndex}: ${error}\n`);
        }
      }
    } catch(error) {
      console.error(error);
    }
  }
}

export { syncSundaySchools }
