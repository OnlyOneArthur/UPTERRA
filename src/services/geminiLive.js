const GEMINI_WS_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent'
const DEFAULT_MODEL = 'gemini-2.0-flash-live-preview-001'

export function createGeminiLiveClient({
  apiKey,
  model = DEFAULT_MODEL,
  systemInstruction = '',
  responseModalities = ['TEXT'],
  onResponse,
  onAudio,
  onReady,
  onClose,
  onError,
  onTurnComplete
}) {
  let ws = null

  const connect = () => {
    if (!apiKey) {
      onError?.('API key tidak ditemukan. Set VITE_GEMINI_API_KEY di .env')
      return
    }
    ws = new WebSocket(`${GEMINI_WS_BASE}?key=${apiKey}`)
    ws.onopen = () => {
      ws.send(JSON.stringify({
        setup: {
          model: `models/${model}`,
          generation_config: { response_modalities: responseModalities },
          system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
        }
      }))
    }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.setupComplete) {
          onReady?.()
          return
        }
        if (data.serverContent) {
          const { modelTurn, turnComplete } = data.serverContent
          if (modelTurn?.parts) {
            modelTurn.parts.forEach((part) => {
              if (part.text) onResponse?.(part.text)
              if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('audio/')) {
                onAudio?.(part.inlineData.data, part.inlineData.mimeType)
              }
            })
          }
          if (turnComplete) onTurnComplete?.()
        }
      } catch (e) {
        console.warn('Gemini WS parse error:', e)
      }
    }
    ws.onerror = () => onError?.('Koneksi Gemini Live gagal. Periksa API key dan koneksi.')
    ws.onclose = () => onClose?.()
  }

  const sendMediaChunk = (mimeType, data) => {
    if (ws?.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({
      realtimeInput: { mediaChunks: [{ mimeType, data }] }
    }))
  }

  const sendFrame = (base64Jpeg) => sendMediaChunk('image/jpeg', base64Jpeg)
  const sendAudio = (base64Pcm, sampleRate = 16000) => sendMediaChunk(`audio/pcm;rate=${sampleRate}`, base64Pcm)

  const sendText = (text) => {
    if (ws?.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true
      }
    }))
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
    }
  }

  return { connect, sendFrame, sendAudio, sendText, disconnect }
}