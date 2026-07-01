// ─── Gemini Live WebSocket Client ────────────────────────────────────────────
// Real-time streaming (video/audio/text) + transcript support.
// Dipakai oleh: src/hooks/useGeminiLive.js
// ─────────────────────────────────────────────────────────────────────────────

const WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

// Model Live (lihat docs Gemini 3.1 Flash Live Preview)
// Format di setup: "models/{model_id}"
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
 * @param {string} options.apiKey        - Gemini API key dari VITE_GEMINI_API_KEY
 * @param {string} options.systemInstruction - System prompt untuk sesi
 * @param {boolean} options.enableAudioOutput - true kalau mau native audio Gemini
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
  enableAudioOutput = false,
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
      // Initial setup message (BidiGenerateContentSetup)
      const setupMessage = {
        setup: {
          model: `models/${MODEL_ID}`,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
            responseModalities: enableAudioOutput ? ["AUDIO"] : ["TEXT"],
          },
          systemInstruction: systemInstruction
            ? {
                parts: [{ text: systemInstruction }],
              }
            : undefined,
          // Enable transcription for input & output audio
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          realtimeInputConfig: {
            automaticActivityDetection: { disabled: false },
          },
        },
      };

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

      // Setup complete → connection ready
      if (msg.setupComplete) {
        open = true;
        console.info("[GeminiLive] Setup complete, session live");
        onReady?.();
        return;
      }

      const server = msg.serverContent;
      if (!server) return;

      // Model content (text + optional inline audio)
      const turn = server.modelTurn;
      if (turn?.parts) {
        for (const part of turn.parts) {
          if (typeof part.text === "string" && part.text.trim()) {
            onText?.(part.text);
          }
          if (
            part.inlineData &&
            typeof part.inlineData.data === "string" &&
            part.inlineData.mimeType?.startsWith("audio/")
          ) {
            onAudioChunk?.(part.inlineData.data, part.inlineData.mimeType);
            // Approximate audio level as "speaking"
            onAudioLevel?.(1);
          }
        }
      }

      // Transcripts (user & AI) dari Live API
      if (server.inputTranscription?.text) {
        onTranscript?.({
          role: "user",
          text: server.inputTranscription.text,
        });
      }
      if (server.outputTranscription?.text) {
        onTranscript?.({
          role: "ai",
          text: server.outputTranscription.text,
        });
      }
    };

    ws.onerror = (event) => {
      console.error("[GeminiLive] WebSocket error", event);
      onError?.(
        "Gemini Live WebSocket error. Cek API key, quota, dan koneksi jaringan.",
      );
    };

    ws.onclose = () => {
      console.info("[GeminiLive] WebSocket closed");
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
        video: {
          data: base64Jpeg,
          mimeType: "image/jpeg",
        },
      },
    });
  };

  // Send audio chunk (PCM 16kHz, base64)
  const sendAudio = (base64Pcm) => {
    if (!base64Pcm) return;
    safeSend(ws, {
      realtimeInput: {
        audio: {
          data: base64Pcm,
          mimeType: "audio/pcm;rate=16000",
        },
      },
    });
  };

  // Send text streaming
  const sendText = (text) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    safeSend(ws, {
      realtimeInput: {
        text: trimmed,
      },
    });
  };

  const isOpen = () => !!ws && ws.readyState === WebSocket.OPEN && open;

  return {
    connect,
    disconnect,
    sendFrame,
    sendAudio,
    sendText,
    isOpen,
  };
}
