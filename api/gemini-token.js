// Mints a short-lived ephemeral token for the Gemini Live API.
//
// The browser used to open its WebSocket with the raw API key in the query
// string, which meant the key was baked into the client bundle by Vite and was
// readable by anyone who opened DevTools. This endpoint keeps the key on the
// server: the browser asks for a token, uses it once to connect, and the token
// expires on its own.
//
// Environment variable: GEMINI_API_KEY  (note: no VITE_ prefix, otherwise Vite
// would inline it into the bundle again).
//
// Docs: https://ai.google.dev/gemini-api/docs/ephemeral-tokens

const AUTH_TOKEN_URL = 'https://generativelanguage.googleapis.com/v1beta/auth_tokens';

// A token may start a new session within this window...
const NEW_SESSION_WINDOW_MS = 60 * 1000;
// ...and the session it starts stays valid this long.
const SESSION_LIFETIME_MS = 30 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[gemini-token] GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY' });
  }

  // Only serve our own pages. Not a hard security boundary, since a determined
  // caller can forge these headers, but it stops casual reuse from other sites.
  const host = req.headers.host;
  const from = req.headers.origin || req.headers.referer;
  if (from && host && !from.includes(host)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const now = Date.now();
  const body = {
    uses: 1,
    newSessionExpireTime: new Date(now + NEW_SESSION_WINDOW_MS).toISOString(),
    expireTime: new Date(now + SESSION_LIFETIME_MS).toISOString(),
    // To also pin the token to one model, add:
    //   liveConnectConstraints: { model: 'models/gemini-3.1-flash-live-preview' }
    // Left off here so a model change in the client cannot silently break auth.
  };

  try {
    const upstream = await fetch(AUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      // Never echo the upstream body verbatim; it can quote the request.
      console.error('[gemini-token] upstream rejected', upstream.status, text.slice(0, 500));
      return res.status(502).json({ error: 'Could not mint a Gemini token' });
    }

    const data = JSON.parse(text);
    if (!data.name) {
      console.error('[gemini-token] upstream response had no token name');
      return res.status(502).json({ error: 'Could not mint a Gemini token' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ token: data.name, expireTime: data.expireTime ?? null });
  } catch (err) {
    console.error('[gemini-token] request failed', err);
    return res.status(502).json({ error: 'Could not mint a Gemini token' });
  }
}
