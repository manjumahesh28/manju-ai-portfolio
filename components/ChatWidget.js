'use client';

// The "Talk to Manju" button and chat panel.
// States: thinking (waiting for the API), done, and failed (with Retry).

import { useEffect, useRef, useState } from 'react';

const SUGGESTIONS = [
  "What's her main tech stack?",
  'What did she build at Ddesigny?',
  'What has she built with LangGraph?',
  'Has she worked at Google?',
];
const TIMEOUT_MS = 30000;


// Show [1] citation markers as small superscripts and **text** as bold.
function withCitations(text) {
  return text.split(/(\[\d+\]|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (/^\[\d+\]$/.test(part)) return <sup key={i} className="cite">{part.slice(1, -1)}</sup>;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

// List only the sources the answer actually cited.
function citedSources(answer, sources) {
  const cited = new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  return sources.filter((s) => cited.has(s.n));
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role, text, status, sources, error }
  const [input, setInput] = useState('');
  const busy = messages.some((m) => m.status === 'thinking');
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

  // Replace the last message (the bot's reply) with an updated version.
  function updateLast(changes) {
    setMessages((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], ...changes }]);
  }

  async function ask(question) {
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
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      updateLast({ text: data.answer, sources: data.sources, status: 'done' });
    } catch (err) {
      updateLast({
        status: 'failed',
        error: err.name === 'AbortError' ? 'That took too long. Please try again.' : err.message,
        question,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  function submit(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
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
            <div>
              <strong>Talk to Manju</strong>
              <span>Answers only from her CV and project notes</span>
            </div>
            <button className="close-btn" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>

          <div className="log" ref={logRef} aria-live="polite">
            {messages.length === 0 && (
              <div className="empty">
                <p>Ask anything about Manju&apos;s skills, projects or experience.</p>
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="suggestion" onClick={() => ask(s)}>{s}</button>
                ))}
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
                  {m.status === 'done' && (
                    <>
                      <p>{withCitations(m.text)}</p>
                      {citedSources(m.text, m.sources).length > 0 && (
                        <ul className="sources">
                          {citedSources(m.text, m.sources).map((s) => (
                            <li key={s.n}><sup>{s.n}</sup> {s.title} › {s.heading}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                  {m.status === 'failed' && (
                    <div className="error">
                      <span>{m.error}</span>
                      <button onClick={() => retry(m.question)}>Retry</button>
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