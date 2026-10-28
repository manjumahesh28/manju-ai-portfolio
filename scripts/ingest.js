// Rebuilds data/index.json from every .md file in content/.
// Run it again whenever you add or change a document:  node scripts/ingest.js

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { chunkDocument } from '../lib/chunk.js';
import { embedDocuments, normalize, DIMS } from '../lib/embed.js';

process.loadEnvFile('.env.local');

// 1. Read and chunk every document
const files = (await readdir('content')).filter((f) => f.endsWith('.md'));
const chunks = [];
for (const file of files) {
  const raw = await readFile(`content/${file}`, 'utf8');
  const docChunks = chunkDocument(raw, file.replace('.md', ''));
  chunks.push(...docChunks);
  console.log(`${file}: ${docChunks.length} chunks`);
}

// 2. Embed all chunks
console.log(`\nEmbedding ${chunks.length} chunks...`);
const vectors = await embedDocuments(chunks.map((c) => c.text));

// 3. Save chunks + vectors as JSON
const index = {
  model: 'gemini-embedding-001',
  dims: DIMS,
  builtAt: new Date().toISOString(),
  chunks: chunks.map((c, i) => ({
    ...c,
    // round to 5 decimals: plenty for ranking, and halves the file size
    embedding: normalize(vectors[i]).map((x) => Math.round(x * 1e5) / 1e5),
  })),
};

await mkdir('data', { recursive: true });
await writeFile('data/index.json', JSON.stringify(index));
console.log(`Saved data/index.json with ${chunks.length} chunks`);