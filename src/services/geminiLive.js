// ─── Gemini Live WebSocket Client ────────────────────────────────────────────
// Ref: https://ai.google.dev/api/live#BidiGenerateContentSetup

const WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

const MODEL_ID = "gemini-3.1-flash-live-preview";

function safeSend(ws, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  try { ws.send(JSON.stringify(payload)); }
  catch (err) { console.error("[GeminiLive] Failed to send", err); }
}

async function parseMessage(data) {
  try {
    if (typeof data === "string") return JSON.parse(data);
    if (data instanceof Blob) return JSON.parse(await data.text());
    if (data instanceof ArrayBuffer) return JSON.parse(new TextDecoder().decode(data));
  } catch (err) {
    console.warn("[GeminiLive] Failed to parse message", err);
  }
  return null;
}

export function createGeminiLiveClient({
  // Returns a short-lived ephemeral token. The raw API key never reaches the
  // browser: the server mints a single-use token instead. See api/gemini-token.js
  getToken,
  systemInstruction = "",
  onText,
  onTranscript,
  onAudioChunk,   // (base64pcm: string, mimeType: string, sampleRate: number) => void
  onReady,
  onClose,
  onError,
  onAudioLevel,
}) {
  let ws = null;
  let open = false;
  let disposed = false;

  const connect = async () => {
    if (typeof getToken !== "function") {
      onError?.("Gemini token provider belum di-set.");
      return;
    }

    let token;
    try {
      token = await getToken();
    } catch (err) {
      console.error("[GeminiLive] Could not obtain an ephemeral token", err);
      onError?.("Gagal mengambil token Gemini. Coba lagi.");
      return;
    }
    if (!token) { onError?.("Token Gemini kosong."); return; }

    // disconnect() may have run while the token request was in flight.
    if (disposed) return;

    console.info("[GeminiLive] Connecting...");
    ws = new WebSocket(`${WS_BASE}?access_token=${encodeURIComponent(token)}`);

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

      // modelTurn: audio PCM chunks dari Gemini
      if (server.modelTurn?.parts) {
        for (const part of server.modelTurn.parts) {
          if (part.inlineData?.mimeType?.startsWith("audio/") && part.inlineData.data) {
            // Parse sample rate dari mimeType, e.g. "audio/pcm;rate=24000"
            const rateMatch = part.inlineData.mimeType.match(/rate=(\d+)/);
            const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
            onAudioChunk?.(part.inlineData.data, part.inlineData.mimeType, sampleRate);
            onAudioLevel?.(1);
          }
          if (typeof part.text === "string" && part.text.trim()) {
            onText?.(part.text);
          }
        }
      }

      // outputTranscription → teks dari audio AI (untuk UI & transcript)
      if (server.outputTranscription?.text) {
        onTranscript?.({ role: "ai", text: server.outputTranscription.text });
      }

      // inputTranscription → teks dari suara user
      if (server.inputTranscription?.text) {
        onTranscript?.({ role: "user", text: server.inputTranscription.text });
      }
    };

    ws.onerror = (event) => {
      console.error("[GeminiLive] WebSocket error", event);
      onError?.("Gemini Live WebSocket error.");
    };

    ws.onclose = (event) => {
      console.info("[GeminiLive] WebSocket closed", "code=", event.code, "reason=", event.reason || "(no reason)");
      if (!event.wasClean && event.reason) {
        try {
          const e = JSON.parse(event.reason);
          onError?.(`Gemini Live: ${e?.error?.message || event.reason}`);
        } catch { onError?.(`Gemini Live closed (${event.code}): ${event.reason}`); }
      }
      open = false; ws = null;
      onClose?.();
    };
  };

  const disconnect = () => {
    // Set before closing so an in-flight connect() bails out instead of opening
    // a socket nobody is listening to.
    disposed = true;
    try { ws?.close(1000, "client-close"); } catch {}
    ws = null; open = false;
  };

  const sendFrame = (b64) => safeSend(ws, { realtimeInput: { video: { data: b64, mimeType: "image/jpeg" } } });
  const sendAudio = (b64) => safeSend(ws, { realtimeInput: { audio: { data: b64, mimeType: "audio/pcm;rate=16000" } } });
  const sendText  = (text) => { const t = text?.trim(); if (t) safeSend(ws, { realtimeInput: { text: t } }); };
  const isOpen   = () => !!ws && ws.readyState === WebSocket.OPEN && open;

  return { connect, disconnect, sendFrame, sendAudio, sendText, isOpen };
}
