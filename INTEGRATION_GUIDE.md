# Gemini Live Session Recorder - Integration Guide

## How to integrate

Keep your existing `src/services/geminiLive.js` for the core WebSocket / streaming logic.

Use the new `useGeminiLiveSession` as a higher-level manager for transcript + recording.

Example in ScanPage.jsx or similar:

```jsx
import { useGeminiLiveSession } from '../services/geminiLiveSession'
import { GeminiLiveSessionRecorder } from '../components/GeminiLiveSessionRecorder'

// inside your component
const geminiSession = useGeminiLiveSession({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  model: import.meta.env.VITE_GEMINI_LIVE_MODEL || 'gemini-2.0-flash-live-preview-001',
  enableRecording: true,
  externalStreamRef: yourCameraStreamRef, // reuse existing getUserMedia stream
  onModelText: (text, isFinal) => geminiSession.addModelTranscript(text, isFinal),
  onUserText: (text) => geminiSession.addUserTranscript(text),
})

// in JSX
<GeminiLiveSessionRecorder session={geminiSession} />
```

Wire the callbacks from your current streaming onmessage handler.

Full details in the main implementation doc.
