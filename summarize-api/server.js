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
app.use(express.json({ limit: '8mb' }));

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
    const { text, filename } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing "text" string in body.' });
    }
    // Cap input to keep cost predictable.
    const MAX_CHARS = 60000;
    const trimmed = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + '\n\n[truncated]' : text;

    const userContent =
      (filename ? `Source filename: ${filename}\n\n` : '') +
      'Document contents:\n\n' + trimmed;

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
    res.json({ summary, model: msg.model, input_chars: trimmed.length });
  } catch (err) {
    console.error('[summarize-api] error:', err);
    const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`[summarize-api] listening on ${PORT} (model=${MODEL}, allowed=${ALLOWED.join(',') || '<none>'})`);
});
