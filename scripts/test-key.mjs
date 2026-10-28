process.loadEnvFile('.env.local');

const res = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      content: { parts: [{ text: 'Manju builds React and Django apps' }] },
      taskType: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: 768,
    }),
  }
);

const data = await res.json();
console.log(res.status, data.embedding?.values.length ?? data);