# meridmail-summarize-api

Tiny Express proxy that powers the **Attach Document & Summarize** card on
the Policy Change form. It accepts plain-text body, calls the Anthropic API
with a strict insurance-summary system prompt, and returns the summary.

---

## What lives where

```
summarize-api/
  server.js     — the Express app
  package.json  — dependencies (express, @anthropic-ai/sdk)
  README.md     — this file
```

The static site (`meridmail`) and the API (`meridmail-summarize-api`) are two
separate Render services defined in the repo's `render.yaml`. Render builds
the API by running `npm install` and starts it with `npm start`.

---

## One-time Render setup

After you push, Render will pick up the new service from `render.yaml`.

1. Open the Render dashboard → the new **meridmail-summarize-api** service.
2. **Environment** tab → add the secret value:
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com.
3. The service will redeploy automatically. Once it's live the URL will be
   something like `https://meridmail-summarize-api.onrender.com`.
4. **Verify**:
   ```
   curl https://meridmail-summarize-api.onrender.com/healthz
   # → ok
   ```

The static site's policy-change page already points at that URL. If Render
gives you a different hostname, update `API_URL` in
`meridian-policy-change.html` (search for `__EP_SUMMARIZE_API__`).

---

## Other env vars

| Var | Default | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | *(required)* | Your Anthropic API key. Set in Render dashboard, never in code. |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | Override the model. |
| `ALLOWED_ORIGIN` | `https://meridmail.onrender.com` | Comma-separated CORS allowlist. Use `*` to disable. |
| `PORT` | provided by Render | Bind port. |

---

## Local dev

```sh
cd summarize-api
npm install
ANTHROPIC_API_KEY=sk-ant-... ALLOWED_ORIGIN=http://localhost:9876 npm start
```

In another terminal, serve meridmail and point the browser at the local API:

```sh
# from the repo root
python3 -m http.server 9876
```

Open `http://localhost:9876/meridian-policy-change.html`. In DevTools console
**before** clicking Summarize, run:

```js
window.__EP_SUMMARIZE_API__ = 'http://localhost:3000';
```

Reload and the page will hit your local API.

---

## Cost / abuse notes

- Each click sends up to ~60k chars to Claude (`MAX_CHARS` in `server.js`).
  Roughly 1 page ≈ 2k chars.
- The CORS allowlist limits browser callers to `meridmail.onrender.com` by
  default. Anyone can still curl the endpoint if they know the URL — add
  rate-limiting or auth later if abuse becomes a concern.
- The system prompt forbids guessing numbers and asks the model to flag
  ambiguity, but always treat the output as a draft. The agent should
  proofread the appended summary against the source document.
