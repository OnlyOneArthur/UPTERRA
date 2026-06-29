// ─── Model notes (June 2026) ──────────────────────────────────────────────────────
// Live WS is currently unstable for many keys (frequent 1008 errors).
// REST fallback is more reliable right now.
// 
// For REST generateContent, the Gemini v1 API expects camelCase:
//   systemInstruction and generationConfig
// For WS Live (v1alpha), snake_case is used in the setup message.
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";
const GEMINI_REST_BASE =
  "https://generativelanguage.googleapis.com/v1/models";

// Stable and widely available model for REST fallback
const FALLBACK_MODEL = "gemini-2.0-flash";

// Live model (will fall back if not available)
const LIVE_MODEL = "gemini-2.0-flash-live-001";

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT = 1; // reduced to fail faster to REST

// WebSocket close codes that should NOT be retried
const NO_RETRY_CODES = new Set([1007, 1008, 4001, 4003]);

export function createGeminiLiveClient({
  apiKey,
  model = LIVE_MODEL,
  systemInstruction = "",
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

  function getAudioContext() {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
      });
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
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
      console.warn("[GeminiLive] Audio playback error:", e);
    }
  }

  // ── REST fallback (more reliable currently) ───────────────────────────────
  let fallbackTimer = null;
  let pendingFrame = null;
  let pendingText = null;

  async function restGenerateContent(parts) {
    if (!apiKey || parts.length === 0) return;
    try {
      const body = {
        contents: [{ role: "user", parts }],
        // Gemini REST v1 uses camelCase for these fields
        ...(systemInstruction && {
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
        generationConfig: { temperature: 0.4 },
      };

      const url = `${GEMINI_REST_BASE}/${FALLBACK_MODEL}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error("[GeminiLive] REST error details:", errJson);
        const msg = errJson?.error?.message || `HTTP ${res.status}`;
        onError?.(`Gemini API error: ${msg}`);
        return;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) onText?.(text);
    } catch (e) {
      console.error("[GeminiLive] REST fetch error:", e);
      onError?.("Gagal menghubungi Gemini API. Periksa koneksi internet.");
    }
  }

  function startFallbackLoop() {
    if (fallbackTimer) return;
    usingFallback = true;
    isReady = true;
    onReady?.();
    console.info(`[GeminiLive] Using REST fallback (${FALLBACK_MODEL})`);
    fallbackTimer = setInterval(async () => {
      const parts = [];
      if (pendingFrame) {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: pendingFrame } });
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

  // ── WS Live setup (snake_case for v1alpha) ────────────────────────────────
  function buildSetup() {
    const setup = {
      model: `models/${model}`,
      generation_config: {
        response_modalities: enableAudioOutput ? ["AUDIO"] : ["TEXT"],
        ...(enableAudioOutput && {
          speech_config: {
            voice_config: { prebuilt_voice_config: { voice_name: "Aoede" } },
          },
        }),
      },
    };
    if (systemInstruction) {
      setup.system_instruction = { parts: [{ text: systemInstruction }] };
    }
    return { setup };
  }

  function connect() {
    if (!apiKey) {
      onError?.("VITE_GEMINI_API_KEY tidak ditemukan. Tambahkan ke file .env kamu.");
      return;
    }
    intentionalClose = false;
    isReady = false;

    console.info(`[GeminiLive] Connecting via WebSocket (${model})...`);
    ws = new WebSocket(`${GEMINI_WS_BASE}?key=${apiKey}`);

    ws.onopen = () => {
      reconnectCount = 0;
      if (usingFallback) stopFallbackLoop();
      console.info("[GeminiLive] WS open — sending setup...");
      ws.send(JSON.stringify(buildSetup()));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.setupComplete) {
          isReady = true;
          console.info("[GeminiLive] ✅ Live session ready");
          onReady?.();
          return;
        }
        if (data.serverContent?.modelTurn?.parts) {
          data.serverContent.modelTurn.parts.forEach((part) => {
            if (part.text) onText?.(part.text);
            if (part.inlineData?.mimeType?.startsWith("audio/")) playPcm16(part.inlineData.data);
          });
        }
        if (data.serverContent?.outputTranscription?.text) onText?.(data.serverContent.outputTranscription.text);
        if (data.serverContent?.audioChunk) playPcm16(data.serverContent.audioChunk);
      } catch (e) {
        console.warn("[GeminiLive] Parse error:", e);
      }
    };

    ws.onerror = (e) => console.warn("[GeminiLive] WebSocket error", e);

    ws.onclose = (event) => {
      isReady = false;
      if (intentionalClose) {
        onClose?.();
        return;
      }
      console.warn(`[GeminiLive] WS closed — code: ${event.code}`);
      const shouldNotRetry = NO_RETRY_CODES.has(event.code);
      if (!shouldNotRetry && reconnectCount < MAX_RECONNECT) {
        reconnectCount++;
        setTimeout(connect, RECONNECT_DELAY_MS);
      } else {
        startFallbackLoop();
      }
    };
  }

  const isOpen = () => (usingFallback ? isReady : ws?.readyState === WebSocket.OPEN && isReady);

  const sendFrame = (base64Jpeg) => {
    if (usingFallback) { pendingFrame = base64Jpeg; return; }
    if (!isOpen()) return;
    ws.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ mimeType: "image/jpeg", data: base64Jpeg }] } }));
  };

  const sendAudio = (base64Pcm) => {
    if (usingFallback) return;
    if (!isOpen()) return;
    ws.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: base64Pcm }] } }));
  };

  const sendText = (text) => {
    if (usingFallback) { pendingText = text; return; }
    if (!isOpen()) return;
    ws.send(JSON.stringify({ clientContent: { turns: [{ role: "user", parts: [{ text }] }], turnComplete: true } }));
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
