// Turns text into embedding vectors using the Gemini API.
// Documents use taskType RETRIEVAL_DOCUMENT, questions use RETRIEVAL_QUERY:
// Gemini optimises each side of the search differently.

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-embedding-001';
export const DIMS = 768;

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': process.env.GEMINI_API_KEY,
  };
}

// Embed many document chunks in one request (used by the ingest script).
export async function embedDocuments(texts) {
  const res = await fetch(`${BASE}/${MODEL}:batchEmbedContents`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${MODEL}`,
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: DIMS,
      })),
    }),
  });
  if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.embeddings.map((e) => e.values);
}

// Embed one visitor question (used by the chat API later).
export async function embedQuery(text) {
  const res = await fetch(`${BASE}/${MODEL}:embedContent`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_QUERY',
      outputDimensionality: DIMS,
    }),
  });
  if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.embedding.values;
}

// Scale a vector to length 1. Then cosine similarity is just a dot product.
export function normalize(v) {
  const length = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0)) || 1;
  return v.map((x) => x / length);
}