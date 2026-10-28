// Finds the chunks most similar to a question.
//
// The index vectors were normalised (length 1) during ingest, so
// cosine similarity is just the dot product of the two vectors.
// At 28 chunks, checking every chunk takes well under a millisecond.

import { normalize } from './embed.js';

export const TOP_K = 4;

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

export function search(index, queryVector, k = TOP_K) {
  const q = normalize(queryVector);
  return index.chunks
    .map((chunk) => ({ ...chunk, score: dot(q, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)        // highest similarity first
    .slice(0, k)                              // keep the top k
    .map(({ embedding, ...rest }) => rest);   // drop the vectors from results
}