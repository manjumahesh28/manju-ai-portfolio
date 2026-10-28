import { readdir, readFile } from 'node:fs/promises';
import { chunkDocument } from '../lib/chunk.js';

const files = (await readdir('content')).filter((f) => f.endsWith('.md'));
let total = 0;

for (const file of files) {
  const raw = await readFile(`content/${file}`, 'utf8');
  const chunks = chunkDocument(raw, file.replace('.md', ''));
  total += chunks.length;
  console.log(`\n===== ${file}: ${chunks.length} chunks =====`);
  for (const c of chunks) {
    console.log(`\n--- ${c.id} (${c.text.length} chars)`);
    console.log(c.text);
  }
}

console.log(`\nTOTAL: ${total} chunks`);