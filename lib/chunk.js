// Splits a Markdown document into chunks, one per ## section.
// Each chunk starts with "Document title › Section heading" so the
// embedding knows what the text is about, even if the text is short.

const MAX_CHARS = 900; // sections longer than this get split further

// Reads the "title:" line from the --- block at the top of the file.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { title: null, body: raw };
  const titleLine = match[1].split(/\r?\n/).find((l) => l.startsWith('title:'));
  return {
    title: titleLine ? titleLine.slice(6).trim() : null,
    body: raw.slice(match[0].length),
  };
}

// Splits text that is too long into smaller pieces at blank lines.
function splitLong(text) {
  if (text.length <= MAX_CHARS) return [text];
  const pieces = [];
  let current = '';
  for (const para of text.split(/\n\s*\n/)) {
    if (current && current.length + para.length > MAX_CHARS) {
      pieces.push(current);
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

export function chunkDocument(raw, source) {
  const { title: fmTitle, body } = parseFrontmatter(raw);
  const title = fmTitle || source;

  // Placeholder lines are never indexed, so the bot can't quote them.
  const lines = body.split(/\r?\n/).filter((line) => !line.includes('TODO'));

  const chunks = [];
  let heading = 'Overview';
  let buffer = [];

  // Saves the text collected so far as one or more chunks.
  function flush() {
    const text = buffer.join('\n').trim();
    buffer = [];
    if (!text) return;
    for (const piece of splitLong(text)) {
      chunks.push({
        id: `${source}#${chunks.length}`,
        source,
        title,
        heading,
        text: `${title} › ${heading}\n${piece}`,
      });
    }
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flush();                       // finish the previous section
      heading = line.slice(3).trim(); // start a new one
    } else if (line.startsWith('# ')) {
      // the top-level # title repeats the document title, so skip it
    } else {
      buffer.push(line);
    }
  }
  flush(); // don't forget the last section

  return chunks;
}