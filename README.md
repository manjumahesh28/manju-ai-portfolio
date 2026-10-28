# Talk to Manju — RAG portfolio

A one-page portfolio with a chat assistant that answers questions about me **only from my own documents** (CV, two project write-ups, FAQ), and says so when the answer isn't there.

**Live:** https://manju-ai-portfolio.vercel.app

## How it works

```
content/*.md ──► chunk by heading ──► Gemini embeddings ──► data/index.json
                                                                 │
visitor question (+ previous question for short follow-ups)      │
        ──► embed ──► cosine similarity (top 4) ◄────────────────┘
                              │
              top score < 0.55? ──► refuse (no LLM call)
                              │
      numbered passages + strict prompt ──► Groq, streamed (fallback: Gemini) ──► answer + citations
```

- **Chunking:** one chunk per `##` section, each prefixed with `Document title › Heading` so short chunks keep their context. Lines containing `TODO` are never indexed. (28 chunks.)
- **Embeddings:** Gemini `gemini-embedding-001`, 768 dimensions, `RETRIEVAL_DOCUMENT` for chunks and `RETRIEVAL_QUERY` for questions.
- **Vector store:** a JSON file searched in memory. At 28 chunks a full cosine scan takes under a millisecond and needs no database. I'd move to Postgres + pgvector at thousands of chunks, or when documents need to change without a redeploy.
- **LLM:** Groq `openai/gpt-oss-20b` first, Gemini `gemini-3.8-flash` as fallback. Groq is primary because Gemini's free tier allows only 20 generation requests a day.
- **Grounding:** the prompt allows answers only from the numbered passages, requires `[n]` citations, a fixed refusal sentence, no invented titles or numbers, and treats passages as data, not instructions.
- **Streaming:** the widget asks for `stream: true` and receives newline-delimited JSON events (`sources`, then `token`s, then `done` or `error`). Without `stream`, the route returns one JSON object; the eval uses this mode.
- **Follow-ups:** the widget sends the previous question. Questions under 8 words are searched together with it, so "which database did it use?" works after a project question.
- **Rate limiting:** 10 questions per minute per visitor (by IP).
- **Keys:** only read on the server (`app/api/chat/route.js` and `lib/`). Nothing secret reaches the browser.

## Run it locally

```bash
npm install
# create .env.local with:
#   GEMINI_API_KEY=...   (https://aistudio.google.com/apikey)
#   GROQ_API_KEY=...     (https://console.groq.com/keys)
npm run dev                       # http://localhost:3000
```

Rebuild the index after adding or editing anything in `content/`:
```bash
node scripts/ingest.js
```

Handy scripts:
- `node scripts/preview-chunks.js` prints every chunk.
- `node scripts/ask.js "question"` shows retrieval only, with similarity scores.
- `node scripts/answer.js "question"` runs the full RAG pipeline in the terminal.
- `node scripts/eval.js [url]` runs the eval set (default `http://localhost:3000`).

## Evaluation

`eval/questions.json` has 13 cases:
- **6 factual** (must answer and mention key facts)
- **4 should-refuse** (Google, PhD, salary, LangGraph)
- **1 follow-up** ("Which database did it use?" after a Ddesigny question)
- **2 adversarial**: a bare `2` (which once made the model invent "lead developer") and a prompt injection.

**Current score on the live site: 13/13.** I run it after every change.

Things the eval and testing caught:
- **Threshold vs. prompt.** "Have you worked at Google?" scored 0.635 and "Where did she study?" scored 0.636, so a similarity threshold can't do the refusing. The threshold (0.55) only filters clearly off-topic questions; the prompt does the real refusal.
- **Invented title.** Typing `2` made the model call me "lead developer", which isn't in my documents. I added prompt rules against vague inputs and unstated titles, plus an eval case.
- **Live-only failures.** The first run against Vercel scored 1/12. The Vercel logs showed Gemini's 20/day quota was used up and a misconfigured Groq key. I fixed the key and made Groq primary.
- **Regression caught.** While adding rate limiting I accidentally deleted an import. The eval dropped to 0/13 and the Vercel logs showed `index is not defined`. Fixed before submitting.
- **Scorer bugs.** Correct answers were marked wrong because the model used non-breaking spaces and curly apostrophes. I fixed the scorer, not the bot.
- **Citation format.** The model sometimes writes `【2】` instead of `[2]`; the widget now handles both.

## What's unfinished or limited

- **Every question needs a Gemini embedding call.** If Gemini's embedding API is down or its key fails, the chat fails, even though Groq is fine. A local embedding model at query time would remove that dependency.
- **The fallback doesn't stream.** If Groq fails, Gemini answers in one piece.
- **Rate limiting is in memory.** It resets when Vercel restarts the function and isn't shared between instances. Production would use Redis (e.g. Upstash).
- **Follow-ups use only the previous question**, not the whole conversation.
- **Some project details are missing from the documents** (skin-disease dataset, accuracy, Django models, export libraries). Those lines are marked `TODO` and are not indexed, so the bot says it doesn't know rather than guessing.
- **Keyword-based scoring.** The eval checks for keywords and the refusal sentence; it doesn't judge answer quality in depth. An LLM-as-judge or a larger eval set would be next.
- **Threshold tuned on a handful of questions.** 0.55 sits between my lowest real question (0.636) and an off-topic one (0.505). It needs more data to be robust.
- The project was created from the Next.js TypeScript template, but all my code is in plain JavaScript.

## Built with AI help

I used Claude as a guide while building this. I wrote, ran and debugged each file myself and can walk through any of them.