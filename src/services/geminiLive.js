// ─── TEMPORARY STABLE MODE (REST only) ─────────────────────────────────────────
// Live WS (gemini-2.0-flash-live-001) is currently returning 1008 for many keys.
// REST fallback with gemini-2.0-flash is more reliable.
// We are forcing REST-only mode until Google stabilizes the Live model.
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_REST_BASE = "https://generativelanguage.googleapis.com/v1/models";
const FALLBACK_MODEL = "gemini-2.0-flash";

export function createGeminiLiveClient({
  apiKey,
  systemInstruction = "",
  onText,
  onReady,
  onClose,
  onError,
}) {
  let fallbackTimer = null;
  let pendingFrame = null;
  let pendingText = null;
  let isReady = false;

  async function restGenerateContent(parts) {
    if (!apiKey || parts.length === 0) return;

    try {
      const body = {
        contents: [{ role: "user", parts }],
        // Using camelCase as per Gemini REST v1 spec
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
        console.error("[GeminiLive] REST ERROR (full):", JSON.stringify(errJson, null, 2));
        const msg = errJson?.error?.message || `HTTP error ${res.status}`;
        onError?.(`Gemini API error: ${msg}`);
        return;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) onText?.(text);
    } catch (e) {
      console.error("[GeminiLive] REST fetch failed:", e);
      onError?.("Gagal menghubungi Gemini API");
    }
  }

  function startFallbackLoop() {
    if (fallbackTimer) return;
    isReady = true;
    onReady?.();
    console.info("[GeminiLive] Using stable REST mode (gemini-2.0-flash)");

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
    }, 2800);
  }

  function stopFallbackLoop() {
    if (fallbackTimer) {
      clearInterval(fallbackTimer);
      fallbackTimer = null;
    }
    isReady = false;
  }

  // Public API (same as before for compatibility)
  const connect = () => {
    console.info("[GeminiLive] Starting in REST-only mode");
    startFallbackLoop();
  };

  const disconnect = () => {
    stopFallbackLoop();
  };

  const isOpen = () => isReady;

  const sendFrame = (base64Jpeg) => { pendingFrame = base64Jpeg; };
  const sendAudio = () => {}; // not used in REST mode
  const sendText = (text) => { pendingText = text; };

  return { connect, disconnect, sendFrame, sendAudio, sendText, isOpen };
}
