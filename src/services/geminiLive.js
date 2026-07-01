// ─── Gemini Live WebSocket Client ────────────────────────────────────────────
// Real-time streaming (video/audio/text) + transcript support.
// Dipakai oleh: src/hooks/useGeminiLive.js
// Ref: https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
// ─────────────────────────────────────────────────────────────────────────────

const WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

// Model ID per dokumentasi resmi Live API WebSockets (Juli 2026)
// Ref: https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
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
 * createGeminiLiveClient
 *
 * @param {Object} options
 * @param {string} options.apiKey            - Gemini API key dari VITE_GEMINI_API_KEY
 * @param {string} options.systemInstruction - System prompt untuk sesi
 * @param {(text: string) => void} options.onText
 * @param {(entry: { role: "user"|"ai", text: string }) => void} options.onTranscript
 * @param {(data: string, mimeType: string) => void} options.onAudioChunk
 * @param {() => void} options.onReady
 * @param {() => void} options.onClose
 * @param {(msg: string) => void} options.onError
 * @param {(level: number) => void} options.onAudioLevel
 */
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
    console.info("[GeminiLive] Connecting to", url);

    ws = new WebSocket(url);

    ws.onopen = () => {
      // Setup message persis seperti dokumentasi resmi:
      // https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
      //
      // PENTING: responseModalities ada di level 'setup', BUKAN di dalam
      // 'generationConfig'. Salah tempat = server tolak setup dan tutup koneksi.
      const setupMessage = {
        setup: {
          model: `models/${MODEL_ID}`,
          responseModalities: ["AUDIO"],
          systemInstruction: systemInstruction
            ? { parts: [{ text: systemInstruction }] }
            : undefined,
          // Aktifkan transcription untuk input & output audio
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          realtimeInputConfig: {
            automaticActivityDetection: { disabled: false },
          },
        },
      };

      console.info("[GeminiLive] Sending setup...", setupMessage);
      safeSend(ws, setupMessage);
    };

    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch (err) {
        console.warn("[GeminiLive] Failed to parse server message", err);
        return;
      }

      // Setup complete → session siap
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
          // Fallback: kalau model kirim text part
          if (typeof part.text === "string" && part.text.trim()) {
            onText?.(part.text);
          }
        }
      }

      // Output transcript = teks dari audio AI (cara utama dapat teks di native audio model)
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
      try {
        ws.close(1000, "client-close");
      } catch (err) {
        console.warn("[GeminiLive] close error", err);
      }
    }
    ws = null;
    open = false;
  };

  // Send single JPEG frame (base64 tanpa prefix data URL)
  const sendFrame = (base64Jpeg) => {
    if (!base64Jpeg) return;
    safeSend(ws, {
      realtimeInput: {
        video: { data: base64Jpeg, mimeType: "image/jpeg" },
      },
    });
  };

  // Send audio chunk (raw PCM 16-bit, 16kHz, little-endian, base64)
  const sendAudio = (base64Pcm) => {
    if (!base64Pcm) return;
    safeSend(ws, {
      realtimeInput: {
        audio: { data: base64Pcm, mimeType: "audio/pcm;rate=16000" },
      },
    });
  };

  // Send text message
  const sendText = (text) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    safeSend(ws, {
      realtimeInput: { text: trimmed },
    });
  };

  const isOpen = () => !!ws && ws.readyState === WebSocket.OPEN && open;

  return { connect, disconnect, sendFrame, sendAudio, sendText, isOpen };
}
