# Integration Guide (Updated)

## Cara Benar Menggunakan

1. Import hook dan component
2. Buat instance hook di komponen kamu
3. **Hubungkan** transcript dari streaming handler existing kamu:

```jsx
const geminiSession = useGeminiLiveSession({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  model: import.meta.env.VITE_GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview',
  externalStreamRef: yourStreamRef,
})

// Di dalam handler streaming Gemini kamu (onmessage / onText):
geminiSession.addModelTranscript(text, isFinal)
geminiSession.addUserTranscript(userInputText)
```

4. Render component:
```jsx
<GeminiLiveSessionRecorder session={geminiSession} />
```

Jika masih muncul "connection bermasalah", masalahnya ada di kode koneksi Gemini Live kamu yang lama, bukan di kode baru ini.