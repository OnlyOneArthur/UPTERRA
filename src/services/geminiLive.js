/**
 * geminiLive.js — Low-level Gemini Live WebSocket client
 *
 * Wraps the raw WebSocket connection to Google's
 * BidiGenerateContent endpoint (Gemini 2.0 Flash Live).
 *
 * Usage:
 *   const client = createGeminiLiveClient({
 *     apiKey: import.meta.env.VITE_GEMINI_API_KEY,
 *     onResponse: (text) => console.log(text),
 *     onReady: () => console.log('Session ready'),
 *     onClose: () => console.log('Session closed'),
 *     onError: (msg) => console.error(msg),
 *   });
 *   client.connect();
 *   client.sendFrame(base64Jpeg);
 *   client.sendAudio(base64Pcm);
 *   client.disconnect();
 */

const GEMINI_WS_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const DEFAULT_MODEL = 'gemini-2.0-flash-live-001';

export function createGeminiLiveClient({
  apiKey,
  model = DEFAULT_MODEL,
  systemInstruction = '',
  onResponse,
  onReady,
  onClose,
  onError,
}) {
  let ws = null;

  const connect = () => {
    if (!apiKey) {
      onError?.('API key tidak ditemukan. Set VITE_GEMINI_API_KEY di .env');
      return;
    }

    ws = new WebSocket(`${GEMINI_WS_BASE}?key=${apiKey}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        setup: {
          model: `models/${model}`,
          generation_config: {
            response_modalities: ['TEXT'],
          },
          system_instruction: systemInstruction
            ? { parts: [{ text: systemInstruction }] }
            : undefined,
        },
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.setupComplete) {
          onReady?.();
          return;
        }
        if (data.serverContent?.modelTurn?.parts) {
          data.serverContent.modelTurn.parts.forEach((part) => {
            if (part.text) onResponse?.(part.text);
          });
        }
      } catch (e) {
        console.warn('Gemini WS parse error:', e);
      }
    };

    ws.onerror = () => onError?.('Koneksi Gemini Live gagal.');
    ws.onclose = () => onClose?.();
  };

  const sendFrame = (base64Jpeg) => {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{ mimeType: 'image/jpeg', data: base64Jpeg }],
      },
    }));
  };

  const sendAudio = (base64Pcm) => {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64Pcm }],
      },
    }));
  };

  const sendText = (text) => {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true,
      },
    }));
  };

  const disconnect = () => {
    ws?.close();
    ws = null;
  };

  return { connect, sendFrame, sendAudio, sendText, disconnect };
}
