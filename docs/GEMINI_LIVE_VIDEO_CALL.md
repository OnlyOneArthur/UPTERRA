# Gemini Live Video Call Feature - Implementation Documentation

## Overview

The Gemini Live video call feature enables real-time, multimodal interaction with Google's Gemini model directly from the UPTERRA React frontend. Users can stream live camera video (and optionally microphone audio) to Gemini for intelligent analysis, conversation, and guidance — tailored for e-waste identification, safe handling, and recycling recommendations in Bahasa Indonesia.

This builds on the existing `feat/ai-scan-video` implementation, enhancing it to support immersive "video call" experiences while preserving the AI-powered scan mode.

**Key Capabilities:**
- Low-latency bidirectional WebSocket connection to Gemini Live API (`gemini-2.0-flash-live-001`)
- Continuous video frame streaming (~1-2 FPS JPEG)
- Optional real-time audio input (mic PCM chunks) and native audio output
- Automatic fallback to REST API for reliability
- Reconnection logic with exponential backoff
- Detection JSON parsing for structured e-waste results
- Browser TTS fallback + native Gemini voice
- Production error handling, state management via custom hook
- Smooth UI with Framer Motion (motion package) animations

## Architecture & Integration

### Files Involved

- `src/services/geminiLive.js`: Core client. Handles WS setup, message protocol (BidiGenerateContent), mediaChunks for video/audio, REST fallback, audio playback via Web Audio API.
- `src/hooks/useGeminiLive.js`: React hook. Manages connection lifecycle, frame dispatching loop (throttled), text accumulation/flush, TTS, state (status, messages, detectionResult, etc.). Exposes clean API: `startSession`, `stopSession`, `sendVideoFrame`, `sendAudioChunk`, `sendTextMessage`.
- `src/components/ScanVideoStream.jsx` & `src/pages/ScanPage.jsx`: Existing consumers for AI Scan mode. Use camera stream + periodic canvas capture to `sendVideoFrame`.
- New: `src/components/GeminiLiveVideoCall.jsx` (added): Dedicated full-screen/modal video call interface for conversational "call" experience. Supports mic toggle, transcript, visualizers, controls. Reuses the same hook for consistency.

### Design Decisions
- **Client-side WS direct**: Low latency for video call feel. Uses ephemeral-friendly API key (VITE_GEMINI_API_KEY). For stricter security in prod, proxy via backend recommended.
- **Frame rate**: 2-2.5s interval to balance cost, latency, and UX (Gemini handles vision well at low FPS).
- **Audio**: Optional native Gemini audio output (enableAudioOutput=true) or browser SpeechSynthesis (id-ID voice) for reliability/cost.
- **Fallback**: Seamless switch to REST `generateContent` if WS fails (non-retryable codes or max reconnects).
- **State & UX**: Centralized in hook to avoid prop drilling. Uses refs for pending frames, busy flags to prevent race conditions (see bug fixes in code).
- **Compatibility**: Existing scan UIs unchanged. New call component is drop-in replacement or parallel mode (e.g. toggle in ScanPage).
- **Styling**: Follows existing Tailwind + motion/react patterns, Indonesian labels, glassmorphism-friendly where applicable.

## Setup & Configuration

1. Get Gemini API key: https://aistudio.google.com/app/apikey (free tier sufficient for testing)
2. Add to `.env`:
   ```
   VITE_GEMINI_API_KEY=your_key_here
   ```
   (See `.env.example` — already documented)
3. No additional npm packages needed (native WebSocket, Web Audio, Canvas, SpeechSynthesis).
4. For production video call with high reliability, consider:
   - Backend proxy for token exchange (ephemeral tokens)
   - AudioWorklet for low-latency PCM capture
   - Rate limiting / usage monitoring

## Usage

### Basic AI Scan (existing)
```jsx
import { ScanVideoStream } from './components/ScanVideoStream';

<ScanVideoStream onBack={handleBack} />
```
Auto-starts camera + Gemini session, streams frames, shows detections + spoken responses.

### Full Video Call Mode (new)
```jsx
import GeminiLiveVideoCall from './components/GeminiLiveVideoCall';

<GeminiLiveVideoCall 
  onEndCall={handleEnd}
  initialMode="call" // or "scan"
  enableMic={true}
  enableNativeAudio={true}
/>
```
Features:
- Large local video preview with camera/mic toggles
- AI status visualizer (pulsing based on audioLevel or speaking)
- Scrollable transcript with user/AI bubbles (animated entry)
- Text input + voice mode toggle
- End call with confirmation animation
- Error recovery UI

### Hook API (for custom integrations)
```js
const {
  status, isLive, isConnecting, isAISpeaking,
  messages, caption, detectionResult, error, audioLevel,
  startSession, stopSession,
  sendVideoFrame, sendAudioChunk, sendTextMessage
} = useGeminiLive();
```

Call `startSession()` after user gesture (for audio unlock). Send frames from canvas.toDataURL or media stream.

## Error Handling & Edge Cases
- Camera/mic permission denied: Graceful UI fallback + retry
- WS disconnect: Auto-reconnect (up to 2x), then REST fallback
- API key missing: Clear error state
- Malformed detection JSON: Falls back to plain text
- Busy frame loop: Guards prevent deadlock (documented bug fixes in hook)
- Network offline: onError + status=error, manual retry button
- SpeechSynthesis voices: Lazy load with fallback

## Testing

Unit tests added in `src/hooks/__tests__/useGeminiLive.test.jsx` (run with Vitest after adding dev deps).
Covers: hook initialization, session start/stop, frame sending, text handling, error states, mocks for WebSocket & media.

Integration: Manual test in ScanPage / new call component with real key (dev only).

## Future Improvements
- Full AudioWorklet + VAD for efficient voice activity
- Screen share support
- Multi-turn tool calling (e.g. marketplace search)
- Backend for ephemeral tokens + usage quotas
- Accessibility: ARIA, keyboard controls

## References
- Google Gemini Live API docs: https://ai.google.dev/gemini-api/docs/live-api
- WebSocket quickstart: https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
- Existing code heavily commented for maintainability.

---
*Implemented following UPTERRA coding conventions, production-ready standards, and seamless integration with feat/ai-scan-video branch.*
