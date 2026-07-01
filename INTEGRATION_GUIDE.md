# Panduan Integrasi Gemini Live + Transcript & Audio/Video Recording

## Setup Awal (Wajib)

1. **Dapatkan API Key Gemini**
   - Buka https://aistudio.google.com/app/apikey
   - Buat API Key baru (atau pakai existing)
   - Copy key-nya

2. **Tambahkan ke Environment Variables**
   Buat file `.env` di root project (copy dari .env.example):
   ```
   VITE_GEMINI_API_KEY=AIzaSy...
   VITE_GEMINI_LIVE_MODEL=gemini-2.0-flash-live-preview-001
   VITE_ENABLE_SESSION_RECORDING=true
   ```
   Restart dev server setelah ubah .env

3. **Install Dependency**
   ```bash
   npm install
   ```
   (framer-motion sudah ditambahkan untuk animasi recorder)

## Cara Menggunakan Fitur

Fitur ini terdiri dari 3 bagian utama:
- `createGeminiLiveClient` → low-level WebSocket client untuk streaming real-time ke Gemini Live
- `useGeminiLiveSession` → React hook untuk manage state transcript + local AV recording
- `GeminiLiveSessionRecorder` → UI component siap pakai (transcript live + controls + download)

### Langkah Integrasi (Recommended Pattern)

```jsx
import { useRef, useEffect } from 'react'
import { createGeminiLiveClient } from '../services/geminiLive'
import { useGeminiLiveSession } from '../services/geminiLiveSession'
import { GeminiLiveSessionRecorder } from '../components/GeminiLiveSessionRecorder'

export default function GeminiLiveDemo() {
  const session = useGeminiLiveSession({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    model: import.meta.env.VITE_GEMINI_LIVE_MODEL,
    enableRecording: true,
    onError: (err) => console.error('Session error:', err),
    onTranscriptUpdate: (t) => console.log('Transcript updated:', t.length, 'entries')
  })

  const clientRef = useRef(null)
  const videoRef = useRef(null) // optional: jika mau kirim frame video

  useEffect(() => {
    const client = createGeminiLiveClient({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      model: import.meta.env.VITE_GEMINI_LIVE_MODEL || 'gemini-2.0-flash-live-preview-001',
      systemInstruction: 'Kamu adalah asisten UPTERRA yang ramah. Jawab dalam Bahasa Indonesia. Bantu identifikasi sampah dan berikan solusi daur ulang.',
      responseModalities: ['TEXT'], // atau ['TEXT', 'AUDIO'] jika support
      onResponse: (text) => {
        // Feed transcript dari Gemini
        session.addModelTranscript(text, true)
      },
      onAudio: (base64Audio, mimeType) => {
        // Optional: play Gemini audio response
        // const audio = new Audio(`data:${mimeType};base64,${base64Audio}`)
        // audio.play()
      },
      onReady: () => {
        console.log('Gemini Live connected')
        session.startSession()
      },
      onError: (msg) => session.retryConnection?.(),
      onTurnComplete: () => console.log('Turn selesai')
    })

    clientRef.current = client
    client.connect()

    return () => {
      client.disconnect()
      session.stopSession()
    }
  }, [session])

  // Contoh: kirim video frame periodik (jika pakai kamera)
  // useEffect(() => { ... setInterval(() => { if (videoRef.current) { const b64 = captureFrame(videoRef.current); clientRef.current?.sendFrame(b64) } }, 2000) }, [])

  const handleSendText = (text) => {
    clientRef.current?.sendText(text)
    session.addUserTranscript(text, true)
  }

  return (
    <div className="p-6">
      <GeminiLiveSessionRecorder 
        session={session} 
        showTranscript={true}
        compact={false}
      />
      
      {/* Optional: input manual untuk test */}
      <div className="mt-4 flex gap-2">
        <input 
          type="text" 
          placeholder="Ketik pesan ke Gemini..." 
          className="flex-1 border rounded-xl px-4 py-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              handleSendText(e.target.value.trim())
              e.target.value = ''
            }
          }}
        />
      </div>
    </div>
  )
}
```

## Fitur Utama yang Sudah Siap Production

- ✅ Setup & auth Gemini API via env
- ✅ Real-time bidirectional streaming (text + video/audio input)
- ✅ Live transcript capture (user + model) dengan timestamp
- ✅ Local session recording (audio + video) via MediaRecorder → save sebagai .webm
- ✅ Download transcript (TXT / JSON)
- ✅ Download full session recording
- ✅ Error handling lengkap (permission, network, API)
- ✅ UI profesional + dark mode + framer-motion animations
- ✅ Support external camera stream (reuse dari ScanPage dll)
- ✅ Clean separation: streaming logic vs recording/transcript management

## Cara Test Fitur

1. `npm run dev`
2. Import `GeminiLiveDemo` atau buat halaman baru di `/gemini-live`
3. Pastikan VITE_GEMINI_API_KEY valid
4. Klik "Mulai Sesi" → izinkan kamera/mikrofon
5. Mulai bicara atau kirim text → lihat transcript live
6. Akhiri sesi → download transcript + recording video
7. Cek console untuk log

## Tips Production
- Untuk production, simpan API key di backend proxy (jangan expose di client)
- Batasi quota & rate limit di Google AI Studio
- Gunakan `responseModalities: ['TEXT', 'AUDIO']` + implement audio playback untuk full voice experience
- Reuse `externalStreamRef` jika sudah punya camera stream aktif (efisiensi)
- Transcript otomatis tersimpan di state, bisa di-sync ke backend jika perlu history

## Troubleshooting
- "API key tidak ditemukan" → cek .env dan restart Vite
- Permission denied → pastikan browser allow camera/mic, atau pakai externalStreamRef
- Connection bermasalah → periksa internet, quota Gemini, atau coba retry
- No transcript muncul → pastikan onResponse feed ke addModelTranscript

Lihat juga GEMINI_LIVE_TRANSCRIPT_AV_IMPLEMENTATION.md untuk detail update terakhir.