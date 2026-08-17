# UPTERRA

An eco-tech waste management app: report waste, identify e-waste with an AI camera scan, and trade recyclables through a built-in marketplace.

Live at **[upterra.vercel.app](https://upterra.vercel.app)**

<img src="screenshot.png" alt="UPTERRA onboarding screen" width="360">

## Features

### Waste reporting
Report illegal dumping or a full collection point from the app, track the status of everything you have submitted, and confirm once it has been handled. Locations are shown on an interactive map.

### AI scan
Point the camera at an item and the app identifies what kind of e-waste it is, then explains how to handle it safely. Two modes are available:

- **Live scan** streams camera frames to the Gemini Live API and returns structured detection results with a confidence score.
- **Video call** is a full-screen conversational mode with microphone input, spoken responses, a live transcript, and an animated AI visualiser.

Both fall back gracefully and reconnect on their own if the connection drops.

### Marketplace
Browse recyclable goods from merchants, open a product chat, add items to a cart, and track orders.

### Dashboard
Waste statistics, a recent-activity feed, and a map view of reports.

## Tech stack

- **React 19** with **Vite**
- **Tailwind CSS v4**
- **Motion** (Framer Motion) for transitions and interactions
- **Zustand** for state (auth, cart, orders, waste)
- **React Router 7**
- **Lucide** icons
- **Gemini Live API** over WebSocket, with a REST fallback

## Project structure

```
src/
├── components/
│   ├── common/          # Button, Card, Modal, Toast, Spinner, ...
│   ├── dashboard/       # StatCard, WasteChart, MapView, RecentActivity
│   ├── layout/          # Navbar, Sidebar, BottomNav, ProtectedRoute
│   ├── scan/            # CameraView, ScanOverlay, DetectionResult
│   ├── waste/           # WasteCard, WasteCategory, WasteList, WasteTip
│   └── GeminiLiveVideoCall.jsx
├── hooks/               # useAuth, useCamera, useGeminiLive, useLocation, ...
├── pages/               # Onboarding, Login, Home, Dashboard, Scan, Market, ...
├── services/            # api, authService, geminiLive, locationService, ...
├── store/               # Zustand stores
├── styles/              # tokens, base, components, app, scan
└── utils/               # constants, formatters, helpers, validators
```

## Requirements

Node.js 18 or newer, and a Gemini API key.

## Running it locally

```bash
npm install
cp .env.example .env
```

Put your key in `.env`:

```
VITE_GEMINI_API_KEY=your_key_here
```

Then start the dev server:

```bash
npm run dev
```

Open the **Scan** section to try the AI scan or the video call mode.

To build for production:

```bash
npm run build
```

## About the API key

This is worth reading before you deploy your own copy.

**Anything prefixed `VITE_` is baked into the client bundle at build time.** That is Vite's documented behaviour, not a bug. It means `VITE_GEMINI_API_KEY` ships inside the JavaScript that browsers download, so anyone who opens DevTools on a deployed build can read it. Keeping it in `.env` protects it from git, not from visitors.

Being on the Gemini free tier does not change this. A leaked key still lets strangers spend your quota, requests still count against your Google account, and if billing is ever enabled on that project the usage becomes chargeable. Google also scans for exposed keys and may disable one without warning, which takes the app down with it.

### Recommended setup

Move the Gemini call server-side. On Vercel that is a small change: add an API route under `api/` that holds the key as a normal (non-`VITE_`) environment variable and forwards requests to Gemini, then point the client at your own route instead of at Google.

```
Browser  ──►  /api/gemini  ──►  Gemini API
              (key lives here, never sent to the browser)
```

The Live API's WebSocket streaming needs a proxy rather than a plain fetch route, so the simplest split is: run the low-frequency REST calls through your own route, and use short-lived [ephemeral tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens) for the Live session so the client never holds the long-lived key.

### If you are keeping it client-side for a demo

That is a defensible trade-off for a student project, as long as it is a deliberate one:

- Use a **dedicated key** for this app, never a personal or shared one.
- Leave **billing disabled** on the project, so the worst case is an exhausted free quota rather than a bill.
- **Restrict the key** to the Generative Language API only, in Google Cloud console.
- **Rotate it** whenever the repo changes hands or is made public.

### If a key has already been committed

Rotate it. Deleting the file in a later commit does not help, because the value stays in the repository history and in every clone anyone has already made. Rewriting history is optional cleanup; reissuing the key is the part that actually closes the hole.

## Further reading

`docs/GEMINI_LIVE_VIDEO_CALL.md` covers the Gemini Live architecture, usage examples, and error handling in detail.
