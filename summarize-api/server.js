// summarize-api/server.js
// Tiny Express proxy that holds ANTHROPIC_API_KEY and exposes a single
// POST /api/summarize endpoint. The client sends { text, filename } (UTF-8
// text already extracted in the browser); we ask Claude for a tight,
// agent-friendly summary of what's changing on the policy and return it.
//
// Env vars (set in Render dashboard):
//   ANTHROPIC_API_KEY   required
//   ALLOWED_ORIGIN      optional CORS allowlist (comma-separated). Defaults to
//                       https://meridmail.onrender.com so the static site can
//                       call the API. Use "*" to disable.
//   PORT                provided by Render automatically
//   ANTHROPIC_MODEL     optional override (default: claude-sonnet-4-6)

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
// 30mb covers typical .eml emails with multiple PDF + image attachments
// after base64 inflation. Anthropic's input cap will still apply downstream.
app.use(express.json({ limit: '30mb' }));

const PORT = process.env.PORT || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const ALLOWED = (process.env.ALLOWED_ORIGIN || 'https://meridmail.onrender.com')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Simple CORS — allow the meridmail static site to POST.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && ALLOWED.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/healthz', (_req, res) => res.send('ok'));

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('[summarize-api] ANTHROPIC_API_KEY not set — /api/summarize will return 500.');
}

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const SYSTEM_PROMPT = [
  'You are an insurance assistant helping a Meridian Insurance agent log a policy change.',
  'The user uploads a document (declaration page, endorsement, email, change request) and you produce a short, factual summary the agent will paste into the Notes field of a Policy Change form.',
  '',
  'Format requirements:',
  '- Lead with one short sentence stating what is changing (1 line, no preamble).',
  '- Then a bulleted list of the specific changes: coverage limits, premiums, effective dates, vehicles/properties added or removed, lienholders, named insureds, etc.',
  '- Use exact figures from the document. Do not invent numbers.',
  '- If the document is ambiguous, say so explicitly rather than guessing.',
  '- Keep it under 200 words.',
  '- Do not include greetings, sign-offs, or commentary about the document itself.'
].join('\n');

app.post('/api/summarize', async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY.' });
    }
    const { text, filename, image_base64, mime_type, content } = req.body || {};

    // Build the user content. Three modes:
    //   1. content: pre-built array of {type:'text', text} | {type:'image', base64, mime_type}
    //      blocks (used when an .eml has attachments and we want to include
    //      the email body, each attachment's extracted text, and any image
    //      attachments in a single Claude call).
    //   2. image_base64: single image (legacy single-image path).
    //   3. text: plain text body (legacy text path).
    let userContent;
    let inputSize = 0;

    const ALLOWED_IMG = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
    const TOTAL_BYTES_CAP = 25_000_000;   // ~25MB raw bytes across all parts
    const MAX_TEXT_CHARS = 60000;

    function trimText(s) {
      return s.length > MAX_TEXT_CHARS ? s.slice(0, MAX_TEXT_CHARS) + '\n\n[truncated]' : s;
    }

    if (Array.isArray(content) && content.length > 0) {
      // Multi-block path: validate, normalize, sum sizes.
      const blocks = [];
      let runningBytes = 0;
      for (const item of content) {
        if (!item || !item.type) continue;
        if (item.type === 'text' && typeof item.text === 'string' && item.text.trim()) {
          const t = trimText(item.text);
          blocks.push({ type: 'text', text: t });
          runningBytes += t.length;
        } else if (item.type === 'image' && item.base64) {
          const mt = item.mime_type || 'image/png';
          if (!ALLOWED_IMG.has(mt)) continue;
          // approximate raw bytes from base64 length
          runningBytes += Math.floor(item.base64.length * 0.75);
          if (runningBytes > TOTAL_BYTES_CAP) break;
          blocks.push({ type: 'image', source: { type: 'base64', media_type: mt, data: item.base64 } });
        }
      }
      if (blocks.length === 0) {
        return res.status(400).json({ error: 'No valid blocks in content array.' });
      }
      // Append a guidance block at the end so Claude knows the task.
      blocks.push({
        type: 'text',
        text: (filename ? `Source filename: ${filename}\n` : '') +
              'The blocks above are an insurance-related communication and any of its attachments. Summarize the changes per your instructions, drawing on every block.'
      });
      userContent = blocks;
      inputSize = runningBytes;
    } else if (image_base64) {
      const mt = mime_type || 'image/png';
      if (!ALLOWED_IMG.has(mt)) {
        return res.status(400).json({ error: `Unsupported image mime_type: ${mt}` });
      }
      if (image_base64.length > 5_000_000) {
        return res.status(413).json({ error: 'Image too large (limit ~5MB).' });
      }
      userContent = [
        { type: 'image', source: { type: 'base64', media_type: mt, data: image_base64 } },
        { type: 'text', text: (filename ? `Source filename: ${filename}\n\n` : '') +
                              'The attached image is an insurance document. Summarize the changes per your instructions.' }
      ];
      inputSize = image_base64.length;
    } else if (text && typeof text === 'string') {
      const trimmed = trimText(text);
      userContent =
        (filename ? `Source filename: ${filename}\n\n` : '') +
        'Document contents:\n\n' + trimmed;
      inputSize = trimmed.length;
    } else {
      return res.status(400).json({ error: 'Body must include "text", "image_base64", or "content".' });
    }

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }]
    });

    const summary = (msg.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();

    if (!summary) {
      return res.status(502).json({ error: 'Empty summary from model.' });
    }
    res.json({ summary, model: msg.model, input_size: inputSize });
  } catch (err) {
    console.error('[summarize-api] error:', err);
    const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`[summarize-api] listening on ${PORT} (model=${MODEL}, allowed=${ALLOWED.join(',') || '<none>'})`);
});
