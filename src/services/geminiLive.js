// ─── Smart AI Scan with Change Detection ─────────────────────────────────────
// Only sends frames to Gemini when the image actually changes.
// This greatly reduces quota usage on free tier.
// ─────────────────────────────────────────────────────────────────────────────
const GEMINI_REST_BASE = "https://generativelanguage.googleapis.com/v1/models";
const MODEL = "gemini-2.0-flash";

const MIN_INTERVAL_MS = 7000; // 7 seconds minimum between calls

function getFrameFingerprint(base64) {
  if (!base64) return "";
  const len = base64.length;
  // Take samples from start, middle, and end for fast comparison
  return (
    base64.slice(0, 60) +
    base64.slice(Math.floor(len * 0.4), Math.floor(len * 0.4) + 40) +
    base64.slice(len - 60)
  );
}

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
  let lastSentTime = 0;
  let lastFrameFingerprint = "";

  async function restGenerateContent(parts) {
    if (!apiKey || parts.length === 0) return;

    try {
      const contents = [];

      if (systemInstruction) {
        contents.push({
          role: "user",
          parts: [{ text: systemInstruction }],
        });
      }

      contents.push({ role: "user", parts });

      const body = {
        contents,
        generation_config: { temperature: 0.4 },
      };

      const url = `${GEMINI_REST_BASE}/${MODEL}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error("[GeminiLive] REST ERROR:", JSON.stringify(errJson, null, 2));
        const msg = errJson?.error?.message || `HTTP ${res.status}`;
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
    console.info(`[GeminiLive] Smart mode active (only sends on change, min ${MIN_INTERVAL_MS}ms)`);

    fallbackTimer = setInterval(async () => {
      const now = Date.now();
      if (now - lastSentTime < MIN_INTERVAL_MS) return;

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

      lastSentTime = now;
      await restGenerateContent(parts);
    }, 1500);
  }

  function stopFallbackLoop() {
    if (fallbackTimer) {
      clearInterval(fallbackTimer);
      fallbackTimer = null;
    }
    isReady = false;
  }

  const connect = () => {
    console.info("[GeminiLive] Starting smart change detection mode");
    startFallbackLoop();
  };

  const disconnect = () => stopFallbackLoop();
  const isOpen = () => isReady;

  // Smart sendFrame with change detection
  const sendFrame = (base64Jpeg) => {
    if (!base64Jpeg) return;

    const fingerprint = getFrameFingerprint(base64Jpeg);

    // Skip if image is almost identical to last sent frame
    if (fingerprint === lastFrameFingerprint) {
      return;
    }

    lastFrameFingerprint = fingerprint;
    pendingFrame = base64Jpeg;
  };

  const sendAudio = () => {};
  const sendText = (text) => {
    pendingText = text;
  };

  return { connect, disconnect, sendFrame, sendAudio, sendText, isOpen };
}
