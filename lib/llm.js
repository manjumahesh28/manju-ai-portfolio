// Calls the language model.
// - generateAnswer: whole answer at once (used by the eval / JSON mode)
// - startAnswerStream: answer arrives piece by piece (used by the chat widget)
// Groq is primary (much higher free quota); Gemini is the fallback.

const GEMINI_MODEL = 'gemini-3.8-flash';
const GROQ_MODEL = 'openai/gpt-oss-20b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
          temperature: 0.1,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingLevel: 'low' },
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((p) => p.text && !p.thought).map((p) => p.text).join('');
}

// One Groq request; `stream` decides whether the answer comes back in pieces.
async function groqRequest(system, user, stream) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 1500,
      reasoning_effort: 'low',
      stream,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  return res;
}

async function askGroq(system, user) {
  const res = await groqRequest(system, user, false);
  const data = await res.json();
  return data.choices[0].message.content;
}

// Reads a Server-Sent Events stream and yields each "data: ..." payload.
async function* readSSE(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep any half-received line for the next round
    for (const line of lines) {
      if (line.startsWith('data:')) yield line.slice(5).trim();
    }
  }
}

// Yields the answer text piece by piece as Groq generates it.
async function* groqTokens(res) {
  for await (const data of readSSE(res.body)) {
    if (data === '[DONE]') return;
    const token = JSON.parse(data).choices?.[0]?.delta?.content;
    if (token) yield token;
  }
}

// Whole answer at once: Groq first, Gemini as fallback.
export async function generateAnswer(system, user) {
  try {
    return { text: await askGroq(system, user), provider: 'groq' };
  } catch (err) {
    console.error('Groq failed, trying Gemini:', err.message);
    return { text: await askGemini(system, user), provider: 'gemini' };
  }
}

// Streamed answer: Groq streams; if Groq fails to start, Gemini answers in one piece.
export async function startAnswerStream(system, user) {
  try {
    const res = await groqRequest(system, user, true);
    return { provider: 'groq', tokens: groqTokens(res) };
  } catch (err) {
    console.error('Groq failed, trying Gemini:', err.message);
    const text = await askGemini(system, user);
    return { provider: 'gemini', tokens: (async function* () { yield text; })() };
  }
}