// Shows which chunks retrieval picks for a question, with similarity scores.
// Usage:  node scripts/ask.js "What did Manju build at Ddesigny?"

import { readFile } from 'node:fs/promises';
import { embedQuery } from '../lib/embed.js';
import { search } from '../lib/retrieve.js';

process.loadEnvFile('.env.local');

const question = process.argv[2];
const index = JSON.parse(await readFile('data/index.json', 'utf8'));

const hits = search(index, await embedQuery(question));

console.log(`\nQ: ${question}\n`);
for (const h of hits) {
  console.log(`${h.score.toFixed(3)}  ${h.title} › ${h.heading}`);
}