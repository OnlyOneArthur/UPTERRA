# Gemini Live Transcript & Audio/Video Recording Implementation

## Overview
This implementation adds professional-grade transcript capture and audio/video session recording to the existing Gemini Live feature in the UPTERRA project.

It follows the established project conventions:
- React + Vite (JSX)
- Clean professional UI with Tailwind + Framer Motion
- Custom hooks pattern
- No inline comments in source code
- Separate documentation
- Production-ready error handling and logging

## Features
- Real-time transcript collection (user + model) with timestamps
- Local A/V recording using MediaRecorder during session
- Downloadable artifacts: transcript.json, transcript.txt, session-recording.webm
- Robust error handling (permissions, API, network, recorder)
- Reusable hook + UI component
- Easy integration with existing geminiLive.js and ScanPage / useScanAI

## Quick Integration
1. Add VITE_GEMINI_API_KEY and VITE_GEMINI_LIVE_MODEL to your .env
2. Import and use `useGeminiLiveSession` from src/services/geminiLiveSession.js
3. Wire `addModelTranscript` / `addUserTranscript` from your existing streaming handler in geminiLive.js
4. Drop `<GeminiLiveSessionRecorder session={session} />` in your ScanPage or video call UI

See INTEGRATION_GUIDE.md for full details and examples.

## Production Notes
- Recording reuses your existing camera stream if you pass externalStreamRef (recommended)
- Transcript is append-only and works with streaming responses
- All errors are recoverable where possible with clear user messages
- Matches the clean, professional style requested for academic / presentation use