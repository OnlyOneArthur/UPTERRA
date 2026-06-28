/**
 * geminiLive.js — Gemini Live WebSocket client (v2)
 *
 * Supports:
 *  - Real-time video frame streaming (JPEG base64)
 *  - Real-time audio input (PCM16 @ 16kHz)
 *  - Audio output playback via Web Audio API (PCM16 → AudioContext)
 *  - Text output
 *  - Auto-reconnect on unexpected close
 *  - Clean teardown
 *
 * Usage:
 *   const client = createGeminiLiveClient({
 *     apiKey: import.meta.env.VITE_GEMINI_API_KEY,
 *     onText: (text) => console.log(text),
 *     onReady: () => console.log('Session ready'),
 *     onClose: () => console.log('Session closed'),
 *     onError: (msg) => console.error(msg),
 *     onAudioLevel: (level) => {},   // 0-1 float for visualiser
 *   });
 *   client.connect();
 *   client.sendFrame(base64Jpeg);
 *   client.sendAudio(base64Pcm);
 *   client.sendText('hello');
 *   client.disconnect();
 */

const GEMINI_WS_BASE =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const DEFAULT_MODEL = 'gemini-2.0-flash-live-001';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT = 3;

export function createGeminiLiveClient({
  apiKey,
  model = DEFAULT_MODEL,
  systemInstruction = '',
  enableAudioOutput = false,
  onText,
  onReady,
  onClose,
  onError,
  onAudioLevel,
}) {
  let ws = null;
  let audioCtx = null;
  let reconnectCount = 0;
  let intentionalClose = false;
  let isReady = false;

  // ── Audio output helpers ──────────────────────────────────────────────────
  function getAudioContext() {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playPcm16(base64Data) {
    if (!enableAudioOutput) return;
    try {
      const ctx = getAudioContext();
      const raw = atob(base64Data);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const samples = new Int16Array(bytes.buffer);
      const floats = new Float32Array(samples.length);
      let peak = 0;
      for (let i = 0; i < samples.length; i++) {
        floats[i] = samples[i] / 32768;
        if (Math.abs(floats[i]) > peak) peak = Math.abs(floats[i]);
      }
      onAudioLevel?.(peak);
      const buffer = ctx.createBuffer(1, floats.length, 24000);
      buffer.copyToChannel(floats, 0);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.start();
    } catch (e) {
      console.warn('[GeminiLive] Audio playback error:', e);
    }
  }

  // ── Build setup message ───────────────────────────────────────────────────
  function buildSetup() {
    const setup = {
      model: `models/${model}`,
      generation_config: {
        response_modalities: enableAudioOutput ? ['AUDIO'] : ['TEXT'],
        ...(enableAudioOutput && {
          speech_config: { voice_config: { prebuilt_voice_config: { voice_name: 'Aoede' } } },
        }),
      },
    };
    if (systemInstruction) {
      setup.system_instruction = { parts: [{ text: systemInstruction }] };
    }
    return { setup };
  }

  // ── Core connection ───────────────────────────────────────────────────────
  function connect() {
    if (!apiKey) {
      onError?.('VITE_GEMINI_API_KEY tidak ditemukan. Tambahkan ke file .env kamu.');
      return;
    }
    intentionalClose = false;
    isReady = false;

    ws = new WebSocket(`${GEMINI_WS_BASE}?key=${apiKey}`);

    ws.onopen = () => {
      reconnectCount = 0;
      ws.send(JSON.stringify(buildSetup()));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Session ready
        if (data.setupComplete) {
          isReady = true;
          onReady?.();
          return;
        }

        // Text output
        if (data.serverContent?.modelTurn?.parts) {
          data.serverContent.modelTurn.parts.forEach((part) => {
            if (part.text) onText?.(part.text);
            if (part.inlineData?.mimeType?.startsWith('audio/')) {
              playPcm16(part.inlineData.data);
            }
          });
        }

        // Audio output (separate field in some API versions)
        if (data.serverContent?.outputTranscription?.text) {
          onText?.(data.serverContent.outputTranscription.text);
        }

        // Inline audio chunks
        if (data.serverContent?.audioChunk) {
          playPcm16(data.serverContent.audioChunk);
        }
      } catch (e) {
        console.warn('[GeminiLive] Parse error:', e);
      }
    };

    ws.onerror = (e) => {
      console.error('[GeminiLive] WebSocket error', e);
      onError?.('Koneksi ke Gemini Live gagal. Periksa API key dan koneksi internet.');
    };

    ws.onclose = (event) => {
      isReady = false;
      if (intentionalClose) {
        onClose?.();
        return;
      }
      // Auto-reconnect
      if (reconnectCount < MAX_RECONNECT) {
        reconnectCount++;
        console.warn(`[GeminiLive] Disconnected (${event.code}). Reconnecting (${reconnectCount}/${MAX_RECONNECT})...`);
        setTimeout(connect, RECONNECT_DELAY_MS);
      } else {
        onError?.('Koneksi Gemini Live terputus. Coba lagi.');
        onClose?.();
      }
    };
  }

  // ── Send helpers ──────────────────────────────────────────────────────────
  const isOpen = () => ws?.readyState === WebSocket.OPEN && isReady;

  const sendFrame = (base64Jpeg) => {
    if (!isOpen()) return;
    ws.send(
      JSON.stringify({
        realtimeInput: {
          mediaChunks: [{ mimeType: 'image/jpeg', data: base64Jpeg }],
        },
      })
    );
  };

  const sendAudio = (base64Pcm) => {
    if (!isOpen()) return;
    ws.send(
      JSON.stringify({
        realtimeInput: {
          mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64Pcm }],
        },
      })
    );
  };

  const sendText = (text) => {
    if (!isOpen()) return;
    ws.send(
      JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true,
        },
      })
    );
  };

  const disconnect = () => {
    intentionalClose = true;
    audioCtx?.close().catch(() => {});
    audioCtx = null;
    ws?.close();
    ws = null;
    isReady = false;
  };

  return { connect, sendFrame, sendAudio, sendText, disconnect, isOpen: () => isOpen() };
}
