// ─── Gemini Live WebSocket Client ────────────────────────────────────────────
// Real-time streaming (video/audio/text) + transcript support.
// Dipakai oleh: src/hooks/useGeminiLive.js
// Ref: https://ai.google.dev/api/live#BidiGenerateContentSetup
// ─────────────────────────────────────────────────────────────────────────────

const WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

const MODEL_ID = "gemini-3.1-flash-live-preview";

function safeSend(ws, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  try {
    ws.send(JSON.stringify(payload));
  } catch (err) {
    console.error("[GeminiLive] Failed to send", err);
  }
}

/**
 * Parse incoming WebSocket message data.
 * Live API bisa kirim:
 *   - string  : JSON text frame (setup complete, transcripts, etc)
 *   - Blob    : binary frame yang isinya tetap JSON (audio wrapped in JSON)
 * @param {string|Blob|ArrayBuffer} data
 * @returns {Promise<object|null>}
 */
async function parseMessage(data) {
  try {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    if (data instanceof Blob) {
      const text = await data.text();
      return JSON.parse(text);
    }
    if (data instanceof ArrayBuffer) {
      const text = new TextDecoder().decode(data);
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn("[GeminiLive] Failed to parse message", err);
  }
  return null;
}

export function createGeminiLiveClient({
  apiKey,
  systemInstruction = "",
  onText,
  onTranscript,
  onAudioChunk,
  onReady,
  onClose,
  onError,
  onAudioLevel,
}) {
  let ws = null;
  let open = false;

  const connect = () => {
    if (!apiKey) {
      onError?.("Gemini API key belum di-set (VITE_GEMINI_API_KEY).");
      return;
    }

    const url = `${WS_BASE}?key=${encodeURIComponent(apiKey)}`;
    console.info("[GeminiLive] Connecting...");

    ws = new WebSocket(url);

    ws.onopen = () => {
      const setupMessage = {
        setup: {
          model: `models/${MODEL_ID}`,
          generationConfig: {
            responseModalities: ["AUDIO"],
            temperature: 0.4,
          },
          systemInstruction: systemInstruction
            ? { parts: [{ text: systemInstruction }] }
            : undefined,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          realtimeInputConfig: {
            automaticActivityDetection: { disabled: false },
          },
        },
      };

      console.info("[GeminiLive] Sending setup...");
      safeSend(ws, setupMessage);
    };

    // onmessage harus async karena Blob.text() adalah Promise
    ws.onmessage = async (event) => {
      const msg = await parseMessage(event.data);
      if (!msg) return;

      if (msg.setupComplete) {
        open = true;
        console.info("[GeminiLive] Setup complete, session live ✅");
        onReady?.();
        return;
      }

      const server = msg.serverContent;
      if (!server) return;

      // Audio chunks dari model
      if (server.modelTurn?.parts) {
        for (const part of server.modelTurn.parts) {
          if (
            part.inlineData &&
            typeof part.inlineData.data === "string" &&
            part.inlineData.mimeType?.startsWith("audio/")
          ) {
            onAudioChunk?.(part.inlineData.data, part.inlineData.mimeType);
            onAudioLevel?.(1);
          }
          if (typeof part.text === "string" && part.text.trim()) {
            onText?.(part.text);
          }
        }
      }

      // Output transcript = teks dari audio AI
      if (server.outputTranscription?.text) {
        const text = server.outputTranscription.text;
        onText?.(text);
        onTranscript?.({ role: "ai", text });
      }

      // Input transcript = teks dari audio user
      if (server.inputTranscription?.text) {
        onTranscript?.({
          role: "user",
          text: server.inputTranscription.text,
        });
      }
    };

    ws.onerror = (event) => {
      console.error("[GeminiLive] WebSocket error", event);
      onError?.("Gemini Live WebSocket error. Cek API key, quota, dan koneksi.");
    };

    ws.onclose = (event) => {
      console.info(
        "[GeminiLive] WebSocket closed",
        "code=", event.code,
        "wasClean=", event.wasClean,
        "reason=", event.reason || "(no reason)",
      );

      if (!event.wasClean && event.reason) {
        try {
          const errBody = JSON.parse(event.reason);
          const msg = errBody?.error?.message || errBody?.message || event.reason;
          onError?.(`Gemini Live ditutup server: ${msg}`);
        } catch {
          onError?.(`Gemini Live ditutup server (code ${event.code}): ${event.reason}`);
        }
      }

      open = false;
      ws = null;
      onClose?.();
    };
  };

  const disconnect = () => {
    if (ws) {
      try { ws.close(1000, "client-close"); }
      catch (err) { console.warn("[GeminiLive] close error", err); }
    }
    ws = null;
    open = false;
  };

  const sendFrame = (base64Jpeg) => {
    if (!base64Jpeg) return;
    safeSend(ws, { realtimeInput: { video: { data: base64Jpeg, mimeType: "image/jpeg" } } });
  };

  const sendAudio = (base64Pcm) => {
    if (!base64Pcm) return;
    safeSend(ws, { realtimeInput: { audio: { data: base64Pcm, mimeType: "audio/pcm;rate=16000" } } });
  };

  const sendText = (text) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    safeSend(ws, { realtimeInput: { text: trimmed } });
  };

  const isOpen = () => !!ws && ws.readyState === WebSocket.OPEN && open;

  return { connect, disconnect, sendFrame, sendAudio, sendText, isOpen };
}
