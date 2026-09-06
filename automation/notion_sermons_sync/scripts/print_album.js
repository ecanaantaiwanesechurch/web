import gBase from '../src/base/google_base.js';
import gDrive from '../src/base/google_drive.js';

// CTCC All folder
const albumTitle = 'CTCC All';
const fileId = '1ESKhwp6tK3l1Cvg2FQNpRLp4Y4p2nefa';

async function main() {
  const auth = await gBase.authorizeServiceAccount();
  const items = await gDrive.listFiles(auth, fileId);

  console.log(`\n${albumTitle} (${fileId}) — ${items.length} files\n`);
  console.log('idx | modifiedTime              | photo taken (metadata)   | name                          | url');
  console.log('----+---------------------------+--------------------------+-------------------------------+------------------------------');
  items.forEach((f, i) => {
    const taken = f.imageMediaMetadata && f.imageMediaMetadata.time
      ? f.imageMediaMetadata.time
      : '-';
    const url = `https://drive.google.com/uc?id=${f.id}`;
    console.log(
      `${String(i).padStart(3)} | ${(f.modifiedTime || '-').padEnd(25)} | ${String(taken).padEnd(24)} | ${(f.name || '').padEnd(29)} | ${url}`
    );
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
