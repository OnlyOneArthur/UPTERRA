# Configuration

Everything the app needs to run, and why the Gemini credential is handled the way it is.

## Environment variables

| Variable | Where it is read | Notes |
|---|---|---|
| `GEMINI_API_KEY` | `api/gemini-token.js`, server only | The only variable the app requires. Deliberately **not** prefixed `VITE_`. |

Copy the template and fill it in:

```bash
cp .env.example .env
```

```
GEMINI_API_KEY=your_key_here
```

## Why the key has no `VITE_` prefix

Vite inlines every `VITE_*` variable into the client bundle at build time. That is documented behaviour, not a bug, and it means such a value is readable by anyone who opens DevTools on the deployed site. Keeping it in `.env` guards it against git, not against visitors.

The Gemini free tier does not change the maths. An exposed key still lets strangers spend the quota, the calls still count against the Google account behind it, and Google's own scanners can disable a leaked key without warning, which takes the app down with it.

## How the credential flows

The key stays in the server environment. The browser requests a short-lived [ephemeral token](https://ai.google.dev/gemini-api/docs/ephemeral-tokens) and connects with that instead.

```
Browser ──POST /api/gemini-token──►  serverless function   (holds GEMINI_API_KEY)
                                            │
                                            ▼
                                   Gemini auth_tokens
                                            │
Browser ◄─────── single-use token ──────────┘

Browser ──wss://…?access_token=<token>──► Gemini Live API
```

| File | Responsibility |
|---|---|
| [`api/gemini-token.js`](../api/gemini-token.js) | Reads `GEMINI_API_KEY` and mints a token: one use, may open a session within 60 s, expires after 30 min. |
| [`src/services/geminiLive.js`](../src/services/geminiLive.js) | Takes a `getToken` function rather than a key, and connects with `?access_token=`. |
| [`src/hooks/useGeminiLive.js`](../src/hooks/useGeminiLive.js) | Fetches a fresh token immediately before each session. |

`vite dev` does not execute the functions in `api/`, so `vite.config.js` serves the same handler through Vite middleware. `npm run dev` therefore behaves like production.

### Verifying a build

```bash
npm run build
grep -o "access_token=" dist/assets/*.js   # present
grep -c "AIza\|AQ\."   dist/assets/*.js    # 0
```

## Deployment

1. Set `GEMINI_API_KEY` in the host's environment variables. Mark it sensitive. Do not add a `VITE_` prefix and do not log it.
2. Remove any legacy `VITE_GEMINI_API_KEY`. Leaving it set does not break anything, but it gets inlined into every new build.
3. Redeploy. Environment changes do not apply to builds that already exist.
4. Restrict the key to the Generative Language API in the Google Cloud console, and leave billing disabled so the worst case is an exhausted free quota.

`vercel.json` rewrites all non-asset paths to `index.html`, which is what lets client-side routes survive a refresh or a shared link.

## Troubleshooting

### `/api/gemini-token` returns 405

Expected. The endpoint only accepts `POST`. Seeing 405 on a `GET` confirms the function is deployed.

### `/api/gemini-token` returns 500

`GEMINI_API_KEY` is not visible to the function. Set it, then **redeploy** — an environment change alone does not reach an existing build.

### `/api/gemini-token` returns 502

The key was rejected upstream. Check the function logs, then consider the key format.

Google AI Studio issues some keys with an `AQ.` prefix rather than the older `AIzaSy` form, and `AQ.` keys are widely reported to fail against `generativelanguage.googleapis.com`. That is the host this endpoint calls, so a key can work for a direct Live API socket and still be rejected here. "It worked before" is not a reliable signal.

To obtain an `AIzaSy` key:

1. [Enable the Generative Language API](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com) on the project.
2. Create a key under [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
3. Restrict it to the Generative Language API.

### The socket closes with code 1008

The server declined the credential presented on the WebSocket. The UI reports this as a plain "feature unavailable" message; the underlying reason is logged to the browser console.
