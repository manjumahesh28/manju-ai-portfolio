'use client';

// The "Talk to Manju" button and chat panel.
// States: thinking (searching), answering (text streaming in), done, failed (with Try again).

import { useEffect, useRef, useState } from 'react';

const SUGGESTIONS = [
  'What projects has Manju built?',
  'How does this RAG assistant work?',
  'What experience does she have with Django?',
  'What did she build at Ddesigny?',
];
const TIMEOUT_MS = 30000;

// Groq's model sometimes writes citations as 【2】 instead of [2]; treat them the same.
function fixCitations(text) {
  return text.replace(/【(\d+)】/g, '[$1]');
}

// Show [1] citation markers as small superscripts and **text** as bold.
function withCitations(text) {
  return fixCitations(text).split(/(\[\d+\]|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (/^\[\d+\]$/.test(part)) return <sup key={i} className="cite">{part.slice(1, -1)}</sup>;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

// List only the sources the answer actually cited.
function citedSources(answer, sources) {
  const cited = new Set([...fixCitations(answer).matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  return sources.filter((s) => cited.has(s.n));
}

// Short, readable document names: "Manju Mahesh — CV" → "CV".
function docName(title) {
  return title
    .replace(/^Manju Mahesh — /, '')
    .replace(/^Project — /, '')
    .replace(/ — About Manju$/, '');
}

// Turn any failure into a clear title + explanation for the visitor.
function describeError(err) {
  if (err.name === 'AbortError') {
    return { title: 'Taking too long', text: "The assistant didn't respond within 30 seconds. Please try again." };
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { title: "You're offline", text: 'Check your internet connection and try again.' };
  }
  if (err.status === 429) {
    return { title: 'Too many questions', text: 'Please wait a minute before asking again.' };
  }
  return { title: "Couldn't get an answer", text: err.message || 'Something went wrong. Please try again.' };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role, text, status, sources, errorTitle, error }
  const [input, setInput] = useState('');
  const busy = messages.some((m) => m.status === 'thinking' || m.status === 'answering');
  const logRef = useRef(null);
  const inputRef = useRef(null);

  // Focus the input when the panel opens; close it with Escape.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Update the last message (the bot's reply).
  function updateLast(changes) {
    setMessages((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], ...changes }]);
  }

  // Add a streamed piece of text to the bot's reply.
  function appendToLast(piece) {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, text: last.text + piece, status: 'answering' }];
    });
  }

  async function ask(question) {
    // The visitor's last real question, so short follow-ups have context.
    const lastQuestion = [...messages].reverse().find((m) => m.role === 'user' && !m.local)?.text;
    const previousQuestion = lastQuestion !== question ? lastQuestion : undefined;

    setMessages((prev) => [
      ...prev.filter((m) => m.status !== 'failed'),
      { role: 'user', text: question },
      { role: 'bot', text: '', status: 'thinking', sources: [] },
    ]);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, previousQuestion, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        const err = new Error(data.error || 'Something went wrong.');
        err.status = res.status;
        throw err;
      }

      // Read the stream line by line: each line is one JSON event.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finished = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep any half-received line for the next round
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === 'sources') updateLast({ sources: event.sources });
          if (event.type === 'token') appendToLast(event.text);
          if (event.type === 'done') {
            updateLast({ status: 'done' });
            finished = true;
          }
          if (event.type === 'error') throw new Error(event.message);
        }
      }
      if (!finished) throw new Error('The answer was cut off. Please try again.');
    } catch (err) {
      const { title, text } = describeError(err);
      updateLast({ status: 'failed', errorTitle: title, error: text, question });
    } finally {
      clearTimeout(timer);
    }
  }

  function submit(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput('');

    // Inputs with no letters (e.g. "3" or "24") aren't questions. Don't send them
    // to the model; explain the citation numbers instead.
    if (!/\p{L}/u.test(q)) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: q, local: true },
        {
          role: 'bot',
          status: 'done',
          sources: [],
          text: "The small numbers after an answer are citations: they point to the sources listed underneath it. Ask me anything about Manju's skills, projects, work experience or education.",
        },
      ]);
      return;
    }

    ask(q);
  }

  function retry(question) {
    setMessages((prev) => prev.slice(0, -2)); // remove the failed question + reply
    ask(question);
  }

  return (
    <>
      {!open && (
        <button className="talk-btn" onClick={() => setOpen(true)}>
          <span className="talk-dot" aria-hidden="true" />
          Talk to Manju
        </button>
      )}

      {open && (
        <div className="panel" role="dialog" aria-label="Talk to Manju">
          <div className="panel-head">
            <div className="head-left">
              {messages.length > 0 ? (
                <button
                  className="back-btn"
                  onClick={() => setMessages([])}
                  disabled={busy}
                  aria-label="Back to suggested questions"
                >
                  ←
                </button>
              ) : (
                <span className="head-avatar" aria-hidden="true">MM</span>
              )}
              <div>
                <strong>Talk to Manju</strong>
                <span><i className="online-dot" aria-hidden="true" />Answers from her CV and project notes</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>

          <div className="log" ref={logRef} aria-live="polite">
            {messages.length === 0 && (
              <div className="welcome">
                <div className="welcome-avatar" aria-hidden="true">MM</div>
                <h3>Hi, I&apos;m Manju&apos;s assistant</h3>
                <p>
                  Ask about her projects, skills or experience. I answer only from her CV, project
                  write-ups and FAQ, and show the sources I used.
                </p>
                <p className="welcome-label">Try asking</p>
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="suggestion" onClick={() => ask(s)}>
                    <span>{s}</span>
                    <span className="suggestion-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
                <p className="welcome-note">
                  If something isn&apos;t in her documents, I&apos;ll say so rather than guess.
                </p>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="msg user">{m.text}</div>
              ) : (
                <div key={i} className={`msg bot ${m.status === 'failed' ? 'failed' : ''}`}>
                  {m.status === 'thinking' && (
                    <span className="thinking">
                      <span className="dots"><i /><i /><i /></span>
                      Searching Manju&apos;s documents…
                    </span>
                  )}
                  {(m.status === 'answering' || m.status === 'done') && (
                    <>
                      <p>
                        {withCitations(m.text)}
                        {m.status === 'answering' && <span className="caret" aria-hidden="true" />}
                      </p>
                      {m.status === 'done' && citedSources(m.text, m.sources).length > 0 && (
                        <div className="source-list">
                          <p className="source-title">Sources</p>
                          <ul>
                            {citedSources(m.text, m.sources).map((s) => (
                              <li key={s.n}>
                                <span className="source-n">{s.n}</span>
                                <span className="source-text">
                                  <strong>{docName(s.title)}</strong>
                                  <em>{s.heading}</em>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                  {m.status === 'failed' && (
                    <div className="error-box" role="alert">
                      <span className="error-icon" aria-hidden="true">!</span>
                      <div className="error-text">
                        <strong>{m.errorTitle}</strong>
                        <p>{m.error}</p>
                        <button onClick={() => retry(m.question)}>Try again</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          <form className="composer" onSubmit={submit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={busy ? 'Answering…' : 'Ask about Manju…'}
              maxLength={500}
              aria-label="Your question"
            />
            <button type="submit" disabled={busy || !input.trim()}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}