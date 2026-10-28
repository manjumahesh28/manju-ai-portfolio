// POST /api/chat — the only place the API keys are used.
// The browser sends a question; this returns a grounded answer + sources.

import index from '@/data/index.json';
import { embedQuery } from '@/lib/embed';
import { search } from '@/lib/retrieve';
import { SYSTEM_PROMPT, REFUSAL, buildUserPrompt } from '@/lib/prompt';
import { generateAnswer } from '@/lib/llm';

const MIN_SIMILARITY = 0.55;
const MAX_QUESTION_LENGTH = 500;

export async function POST(request) {
  // 1. Validate the input
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  if (!question) {
    return Response.json({ error: 'Please ask a question.' }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return Response.json(
      { error: `Please keep questions under ${MAX_QUESTION_LENGTH} characters.` },
      { status: 400 }
    );
  }

  try {
    // 2. Retrieve the most relevant chunks
    const hits = search(index, await embedQuery(question));

    // 3. Nothing relevant → refuse without calling the model
    if (hits[0].score < MIN_SIMILARITY) {
      return Response.json({ answer: REFUSAL, sources: [], provider: 'none' });
    }

    // 4. Answer from the retrieved chunks only
    const { text, provider } = await generateAnswer(
      SYSTEM_PROMPT,
      buildUserPrompt(question, hits)
    );

    // 5. Send back the answer and which documents it came from
    const sources = hits.map((h, i) => ({ n: i + 1, title: h.title, heading: h.heading }));
    return Response.json({ answer: text, sources, provider });
  } catch (err) {
    console.error('[chat] error:', err);
    return Response.json(
      { error: 'Sorry, the assistant is unavailable right now. Please try again in a minute.' },
      { status: 503 }
    );
  }
}