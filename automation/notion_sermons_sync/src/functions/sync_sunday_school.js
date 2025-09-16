import gBase from '../base/google_base.js';
import gWorker from '../base/google_sheets.js';
import nWorker from '../base/notion.js';
import { sleep }  from '../base/utils.js';

const sundaySchoolConfigs = [
//  { // 但以理+約瑟
//    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
//    tab: '2025Q2 信徒班-但以理+約瑟',
//    notionPage: '1baba8467b7a80f2b995c89c9e1d5af7',
//    importedField: 'H'
//  },
//  { // 羅馬書上
//    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
//    tab: '2025Q2 信徒班-羅馬書上',
//    notionPage: '2256f869672640509fde648116bd5b7d',
//    importedField: 'H'
//  },
//  { // 有意思的使徒信經
//    sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
//    tab: '2025Q2 慕道班-有意思的使徒信經',
//    notionPage: '19eba8467b7a80ec8772c9b580cce359',
//    importedField: 'H'
//  },
//  { // 智慧何處尋/雅歌
//    sheet: '1SDvjfNm3ksoy4lUjSxdQWKIKIRv8rObMI6p1mI97RWw',
//    tab: '2025Q2 智慧何處尋/雅歌',
//    notionPage: '1d4ba8467b7a809fb9fdfc3a525eb6ba',
//    importedField: 'I'
//  },
//  { // 聖經老實說
//   sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
//   tab: '2025Q3 信徒/慕道班-聖經老實說',
//   notionPage: '207ba8467b7a80ca969defc77ad8e07a',
//   importedField: 'H'
//  },
//  { // 關係建造課程第四系列：化解衝突，追求和睦
//     sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
//     tab: '2025Q3 關係建造課程第四系列-化解衝突，追求和睦',
//     notionPage: '207ba8467b7a80cf9353c736d30726eb',
//     importedField: 'H'
//  },
   { // 希伯來書
      sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
      tab: '2025Q4 信徒班-希伯來書',
      notionPage: '26fba8467b7a800e9059f87a1e81257d',
      importedField: 'H'
   },
   { // 羅馬書下
      sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
      tab: '2025Q4 信徒班-羅馬書下',
      notionPage: '26fba8467b7a80babf4ac0ba55959f2a',
      importedField: 'H'
   },
   { // 登山寶訓
      sheet: '1MBCCmEcH1Or-xb6cQxdJSZIMvNxcY1yxsj44CYkn8k8',
      tab: '2025Q4 慕道班-登山寶訓',
      notionPage: '26fba8467b7a8046aa58c33dd8d46100',
      importedField: 'H'
   }
];

async function syncSundaySchools(body = {}) {
  const auth = await gBase.authorize();
  const notion = await nWorker.createNotionClient();
  var targetConfigs;
  if (body.tab && body.sheet) {
    targetConfigs = sundaySchoolConfigs.filter((config) => config.tab === body.tab && config.sheet === body.sheet);
  } else {
    targetConfigs = sundaySchoolConfigs;
  }
  for (const config of targetConfigs) {
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
          if (!r.handoutLink && !r.audioLink) {
            continue;
          }

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
