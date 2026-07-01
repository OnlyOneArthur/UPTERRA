# UPTERRA

Eco-tech waste management app built with React + Vite + Tailwind CSS v4 + Motion (Framer Motion).

## Branch: `feat/ai-scan-final`

This branch delivers the **Gemini Live AI Video Scan & Video Call** feature — real-time multimodal AI assistance for e-waste identification, safe handling guidance, and conversational video calls powered by Google's Gemini Live API.

### What's Implemented

- Full Gemini Live WebSocket integration (`src/services/geminiLive.js`)
- React hook `useGeminiLive` with frame streaming, TTS, detection parsing, fallback, reconnect
- `ScanVideoStream.jsx` & enhanced `ScanPage.jsx` for AI-powered camera scan
- **New**: `GeminiLiveVideoCall.jsx` — immersive full-screen video call UI with mic/camera toggles, live transcript, animated AI visualizer, text/voice input
- Production error handling, state guards, Indonesian UX
- Comprehensive documentation in `docs/GEMINI_LIVE_VIDEO_CALL.md`
- Unit test skeleton in `src/hooks/__tests__/useGeminiLive.test.jsx`

### Key Features of Gemini Live Video Call

- Live camera streaming to Gemini for vision understanding
- Optional microphone audio input for natural conversation
- Real-time AI responses (text + spoken via TTS or native audio)
- Structured detection results for e-waste (JSON parsed)
- Seamless fallback & recovery
- Beautiful motion animations for professional feel

### Setup

```bash
npm install
# Add your key to env
# Edit VITE_GEMINI_API_KEY
npm run dev
```

Navigate to Scan section to try AI Scan or the new Video Call mode.

See `docs/GEMINI_LIVE_VIDEO_CALL.md` for architecture, usage examples, error handling, and future roadmap.

### Tech Stack

- React 19 + Vite
- Tailwind CSS v4 + motion/react
- Lucide icons
- Zustand (state)
- Gemini Live API (WebSocket + REST fallback)

All code is production-ready, well-commented, and follows existing project patterns.
