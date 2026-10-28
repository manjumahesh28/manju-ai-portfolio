// POST /api/chat — the only place the API keys are used.
// Body: { question, previousQuestion?, stream? }
// - stream: true  → newline-delimited JSON events: sources, token..., done (or error)
// - otherwise     → one JSON object: { answer, sources, provider }

import index from '@/data/index.json';
import { embedQuery } from '@/lib/embed';
import { search, buildRetrievalQuery } from '@/lib/retrieve';
import { SYSTEM_PROMPT, REFUSAL, buildUserPrompt } from '@/lib/prompt';
import { generateAnswer, startAnswerStream } from '@/lib/llm';
import { isAllowed } from '@/lib/rateLimit';

const MIN_SIMILARITY = 0.55;
const MAX_QUESTION_LENGTH = 500;
const UNAVAILABLE = 'Sorry, the assistant is unavailable right now. Please try again in a minute.';

function cleanText(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_QUESTION_LENGTH) : '';
}

function toSources(hits) {
  return hits.map((h, i) => ({ n: i + 1, title: h.title, heading: h.heading }));
}

// Retrieval shared by both modes.
async function retrieve(question, previousQuestion) {
  const searchText = buildRetrievalQuery(question, previousQuestion);
  return search(index, await embedQuery(searchText));
}

export async function POST(request) {
  // 0. Rate limit: max 10 questions per minute per visitor
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!isAllowed(ip)) {
    return Response.json(
      { error: 'Too many questions in a minute. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

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
  const previousQuestion = cleanText(body?.previousQuestion);

  if (body?.stream === true) return streamAnswer(question, previousQuestion);

  // JSON mode (used by the eval script)
  try {
    const hits = await retrieve(question, previousQuestion);
    if (hits[0].score < MIN_SIMILARITY) {
      return Response.json({ answer: REFUSAL, sources: [], provider: 'none' });
    }
    const { text, provider } = await generateAnswer(
      SYSTEM_PROMPT,
      buildUserPrompt(question, hits, previousQuestion)
    );
    return Response.json({ answer: text, sources: toSources(hits), provider });
  } catch (err) {
    console.error('[chat] error:', err);
    return Response.json({ error: UNAVAILABLE }, { status: 503 });
  }
}

// Streaming mode (used by the chat widget)
function streamAnswer(question, previousQuestion) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event) => controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      try {
        const hits = await retrieve(question, previousQuestion);

        // Nothing relevant → refuse without calling the model
        if (hits[0].score < MIN_SIMILARITY) {
          send({ type: 'sources', sources: [] });
          send({ type: 'token', text: REFUSAL });
          send({ type: 'done', provider: 'none' });
          return;
        }

        send({ type: 'sources', sources: toSources(hits) });
        const { provider, tokens } = await startAnswerStream(
          SYSTEM_PROMPT,
          buildUserPrompt(question, hits, previousQuestion)
        );
        for await (const text of tokens) send({ type: 'token', text });
        send({ type: 'done', provider });
      } catch (err) {
        console.error('[chat] stream error:', err);
        send({ type: 'error', message: UNAVAILABLE });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}