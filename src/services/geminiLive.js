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
    if (!apiKey) { onError?.("Gemini API key belum di-set."); return; }

    console.info("[GeminiLive] Connecting...");
    ws = new WebSocket(`${WS_BASE}?key=${encodeURIComponent(apiKey)}`);

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

      // ── DEBUG: log semua keys di top-level message ──
      console.log("[GeminiLive] ⬇️ msg keys:", Object.keys(msg));

      if (msg.setupComplete) {
        open = true;
        console.info("[GeminiLive] Setup complete, session live ✅");
        onReady?.();
        return;
      }

      const server = msg.serverContent;
      if (!server) {
        console.log("[GeminiLive] no serverContent, full msg:", JSON.stringify(msg).slice(0, 300));
        return;
      }

      // ── DEBUG: log serverContent keys ──
      console.log("[GeminiLive] serverContent keys:", Object.keys(server));

      // modelTurn parts (TEXT mode / inline audio)
      if (server.modelTurn?.parts) {
        for (const part of server.modelTurn.parts) {
          console.log("[GeminiLive] part keys:", Object.keys(part), "| text:", part.text?.slice(0,80), "| inlineData mimeType:", part.inlineData?.mimeType);
          if (part.inlineData?.mimeType?.startsWith("audio/")) {
            onAudioChunk?.(part.inlineData.data, part.inlineData.mimeType);
            onAudioLevel?.(1);
          }
          if (typeof part.text === "string" && part.text.trim()) {
            console.log("[GeminiLive] → calling onText:", part.text.slice(0, 80));
            onText?.(part.text);
          }
        }
      }

      // outputTranscription (AUDIO mode → teks transkripsi dari audio AI)
      if (server.outputTranscription?.text) {
        console.log("[GeminiLive] outputTranscription.text:", server.outputTranscription.text.slice(0, 80));
        onTranscript?.({ role: "ai", text: server.outputTranscription.text });
      }

      // inputTranscription (suara user yang dikenali)
      if (server.inputTranscription?.text) {
        console.log("[GeminiLive] inputTranscription.text:", server.inputTranscription.text.slice(0, 80));
        onTranscript?.({ role: "user", text: server.inputTranscription.text });
      }

      // turnComplete
      if (server.turnComplete) {
        console.log("[GeminiLive] turnComplete");
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
    try { ws?.close(1000, "client-close"); } catch {}
    ws = null; open = false;
  };

  const sendFrame = (b64) => safeSend(ws, { realtimeInput: { video: { data: b64, mimeType: "image/jpeg" } } });
  const sendAudio = (b64) => safeSend(ws, { realtimeInput: { audio: { data: b64, mimeType: "audio/pcm;rate=16000" } } });
  const sendText  = (text) => { const t = text?.trim(); if (t) safeSend(ws, { realtimeInput: { text: t } }); };
  const isOpen   = () => !!ws && ws.readyState === WebSocket.OPEN && open;

  return { connect, disconnect, sendFrame, sendAudio, sendText, isOpen };
}
