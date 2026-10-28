// Calls the language model. Gemini first; if it fails (for example a 429
// rate limit on the free tier), the same prompt goes to Groq instead.

const GEMINI_MODEL = 'gemini-3.8-flash';
const GROQ_MODEL = 'openai/gpt-oss-20b';

async function askGemini(system, user) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.1,                         // low = stick closely to the evidence
          maxOutputTokens: 2048,                    // room for thinking + the answer
          thinkingConfig: { thinkingLevel: 'low' }, // Gemini 3: keep thinking short and fast
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((p) => p.text && !p.thought).map((p) => p.text).join('');
}

async function askGroq(system, user) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 1500,         // room for short reasoning + the answer
      reasoning_effort: 'low',  // keep the hidden thinking brief and fast
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

// Try Gemini, fall back to Groq. Returns which provider answered.
export async function generateAnswer(system, user) {
  try {
    return { text: await askGemini(system, user), provider: 'gemini' };
  } catch (err) {
    console.error('Gemini failed, trying Groq:', err.message);
    return { text: await askGroq(system, user), provider: 'groq' };
  }
}