// Runs every question in eval/questions.json against the chat API and scores it.
// Usage:
//   node scripts/eval.js                                       (local: run npm run dev first)
//   node scripts/eval.js https://manju-ai-portfolio.vercel.app (live site)

import { readFile } from 'node:fs/promises';

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const DELAY_MS = 7000; // ~8 questions per minute, under the 10/minute rate limit
const REFUSAL_TEXT = "don't have information";

const cases = JSON.parse(await readFile('eval/questions.json', 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function score(test, answer) {
  // Normalise odd Unicode the model sometimes uses (non-breaking spaces,
  // non-breaking hyphens, curly apostrophes) so plain-text checks still match.
  const text = answer
    .normalize('NFKC')
    .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, ' ')
    .replace(/[\u2010\u2011\u2012\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .toLowerCase();

  const refused = text.includes(REFUSAL_TEXT);

  if (test.expect === 'refuse') {
    return refused ? [true, 'refused'] : [false, 'should have refused'];
  }
  if (test.expect === 'honest_negative') {
    // Either refuses, or says plainly she hasn't done it. Both are grounded.
    return refused || /\bnot\b|hasn't|has not/.test(text)
      ? [true, 'declined or said not yet']
      : [false, 'claimed work that is not in her documents'];
  }
  if (test.expect === 'answer') {
    if (text.startsWith("i don't have information")) return [false, 'refused a question it can answer'];
    const missing = test.mustInclude.filter((word) => !text.includes(word));
    return missing.length ? [false, `missing: ${missing.join(', ')}`] : [true, 'has the facts'];
  }
  if (test.expect === 'no_invention') {
    const found = test.mustNotInclude.filter((word) => text.includes(word));
    return found.length ? [false, `invented: ${found.join(', ')}`] : [true, 'nothing invented'];
  }
  return [false, 'unknown test type'];
}

console.log(`Running ${cases.length} tests against ${BASE_URL}\n`);
let passed = 0;

for (const test of cases) {
  let answer = '';
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: test.question, previousQuestion: test.previousQuestion }),
    });
    const data = await res.json();
    answer = data.answer || `ERROR: ${data.error}`;
  } catch (err) {
    answer = `ERROR: ${err.message}`;
  }

  const [ok, reason] = answer.startsWith('ERROR') ? [false, answer] : score(test, answer);
  if (ok) passed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${test.question}`);
  if (!ok) console.log(`      -> ${reason}\n      -> answer: ${answer.slice(0, 150)}`);

  await sleep(DELAY_MS);
}

console.log(`\nScore: ${passed}/${cases.length}`);