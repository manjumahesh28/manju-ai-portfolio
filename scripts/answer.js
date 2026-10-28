// Full RAG in the terminal: retrieve → prompt → answer.
// Usage:  node scripts/answer.js "Have you worked at Google?"

import { readFile } from 'node:fs/promises';
import { embedQuery } from '../lib/embed.js';
import { search } from '../lib/retrieve.js';
import { SYSTEM_PROMPT, REFUSAL, buildUserPrompt } from '../lib/prompt.js';
import { generateAnswer } from '../lib/llm.js';

process.loadEnvFile('.env.local');

const MIN_SIMILARITY = 0.55;
const question = process.argv[2];
const index = JSON.parse(await readFile('data/index.json', 'utf8'));

// 1. Retrieve
const hits = search(index, await embedQuery(question));
console.log(`\nQ: ${question}`);
console.log(`Top score: ${hits[0].score.toFixed(3)}\n`);

// 2. Nothing relevant at all → refuse without calling the model
if (hits[0].score < MIN_SIMILARITY) {
  console.log(REFUSAL);
  console.log('(refused by similarity threshold, no LLM call)');
  process.exit(0);
}

// 3. Generate an answer from the retrieved chunks only
console.log('Asking the model...');
const { text, provider } = await generateAnswer(SYSTEM_PROMPT, buildUserPrompt(question, hits));
console.log(text || '[EMPTY ANSWER]');
console.log(`\n(answered by ${provider})`);
hits.forEach((h, i) => console.log(`[${i + 1}] ${h.title} › ${h.heading}`));