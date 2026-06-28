/**
 * geminiLive.js — Gemini client with Live WS + REST fallback (v4)
 *
 * Key facts (from Google AI Studio docs):
 *  - "Gemini Live" is a WebSocket PROTOCOL, not a model name
 *  - Correct model for Live API: gemini-2.0-flash-exp (supports BidiGenerateContent)
 *  - New API keys need 2-5 min propagation before they work
 *  - REST fallback uses gemini-1.5-flash (has free tier quota)
 *
 * Strategy:
 *  1. Connect via WebSocket using gemini-2.0-flash-exp
 *  2. If WS fails → fallback to REST generateContent with gemini-1.5-flash
 */

const GEMINI_WS_BASE =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const GEMINI_REST_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models';

// gemini-2.0-flash-exp = correct model string for Live WebSocket API
const LIVE_MODEL = 'gemini-2.0-flash-exp';
// gemini-1.5-flash = free tier REST fallback (15 RPM on free tier)
const FALLBACK_MODEL = 'gemini-1.5-flash';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT = 2;

export function createGeminiLiveClient({
  apiKey,
  model = LIVE_MODEL,
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
  let usingFallback = false;

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

  // ── REST fallback (gemini-1.5-flash, 15 RPM free tier) ───────────────────
  let fallbackTimer = null;
  let pendingFrame = null;
  let pendingText = null;

  async function restGenerateContent(parts) {
    if (!apiKey) return;
    try {
      const body = {
        contents: [{ role: 'user', parts }],
        ...(systemInstruction && {
          system_instruction: { parts: [{ text: systemInstruction }] },
        }),
        generationConfig: { temperature: 0.4 },
      };
      const res = await fetch(
        `${GEMINI_REST_BASE}/${FALLBACK_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[GeminiLive] REST error:', err);
        onError?.(`Gemini API error: ${err?.error?.message || res.status}`);
        return;
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) onText?.(text);
    } catch (e) {
      console.error('[GeminiLive] REST fetch error:', e);
      onError?.('Gagal menghubungi Gemini API. Periksa koneksi internet.');
    }
  }

  function startFallbackLoop() {
    if (fallbackTimer) return;
    usingFallback = true;
    isReady = true;
    onReady?.();
    console.info(`[GeminiLive] Live WS unavailable. Using REST fallback (${FALLBACK_MODEL})`);

    fallbackTimer = setInterval(async () => {
      const parts = [];
      if (pendingFrame) {
        parts.push({ inline_data: { mime_type: 'image/jpeg', data: pendingFrame } });
        pendingFrame = null;
      }
      if (pendingText) {
        parts.push({ text: pendingText });
        pendingText = null;
      }
      if (parts.length === 0) return;
      await restGenerateContent(parts);
    }, 3000);
  }

  function stopFallbackLoop() {
    if (fallbackTimer) {
      clearInterval(fallbackTimer);
      fallbackTimer = null;
    }
    usingFallback = false;
  }

  // ── Build WS setup message ────────────────────────────────────────────────
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

  // ── Core WS connection ────────────────────────────────────────────────────
  function connect() {
    if (!apiKey) {
      onError?.('VITE_GEMINI_API_KEY tidak ditemukan. Tambahkan ke file .env kamu.');
      return;
    }
    intentionalClose = false;
    isReady = false;

    console.info(`[GeminiLive] Connecting via WebSocket (${model})...`);
    ws = new WebSocket(`${GEMINI_WS_BASE}?key=${apiKey}`);

    ws.onopen = () => {
      reconnectCount = 0;
      console.info('[GeminiLive] WS open — sending setup...');
      ws.send(JSON.stringify(buildSetup()));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.setupComplete) {
          isReady = true;
          console.info('[GeminiLive] ✅ Live session ready (WebSocket)');
          onReady?.();
          return;
        }

        if (data.serverContent?.modelTurn?.parts) {
          data.serverContent.modelTurn.parts.forEach((part) => {
            if (part.text) onText?.(part.text);
            if (part.inlineData?.mimeType?.startsWith('audio/')) {
              playPcm16(part.inlineData.data);
            }
          });
        }

        if (data.serverContent?.outputTranscription?.text) {
          onText?.(data.serverContent.outputTranscription.text);
        }

        if (data.serverContent?.audioChunk) {
          playPcm16(data.serverContent.audioChunk);
        }
      } catch (e) {
        console.warn('[GeminiLive] Parse error:', e);
      }
    };

    ws.onerror = (e) => {
      console.warn('[GeminiLive] WebSocket error — will attempt fallback', e);
    };

    ws.onclose = (event) => {
      isReady = false;
      if (intentionalClose) {
        onClose?.();
        return;
      }

      console.warn(`[GeminiLive] WS closed with code: ${event.code}, reason: ${event.reason}`);

      // Auth/policy errors (4xxx) or normal WS close after max retries → fallback
      const isAuthError = event.code >= 4000 || event.code === 1008;

      if (!isAuthError && reconnectCount < MAX_RECONNECT) {
        reconnectCount++;
        console.warn(`[GeminiLive] Reconnecting (${reconnectCount}/${MAX_RECONNECT}) in ${RECONNECT_DELAY_MS}ms...`);
        setTimeout(connect, RECONNECT_DELAY_MS);
      } else {
        console.warn('[GeminiLive] Switching to REST fallback...');
        startFallbackLoop();
      }
    };
  }

  // ── Send helpers ──────────────────────────────────────────────────────────
  const isOpen = () => {
    if (usingFallback) return isReady;
    return ws?.readyState === WebSocket.OPEN && isReady;
  };

  const sendFrame = (base64Jpeg) => {
    if (usingFallback) {
      pendingFrame = base64Jpeg;
      return;
    }
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
    if (usingFallback) return;
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
    if (usingFallback) {
      pendingText = text;
      restGenerateContent([{ text }]);
      return;
    }
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
    stopFallbackLoop();
    audioCtx?.close().catch(() => {});
    audioCtx = null;
    ws?.close();
    ws = null;
    isReady = false;
  };

  return { connect, sendFrame, sendAudio, sendText, disconnect, isOpen: () => isOpen() };
}
