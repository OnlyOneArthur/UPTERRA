import { useState, useRef, useCallback, useEffect } from "react";
import { createGeminiLiveClient } from "../services/geminiLive";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `Kamu adalah UPTERRA AI, asisten cerdas untuk identifikasi dan pengelolaan sampah — mencakup sampah elektronik (e-waste), sampah anorganik, dan sampah organik.

Tugasmu:
1. Identifikasi jenis sampah yang terlihat dari gambar. Bisa berupa:
   - E-waste: RAM, SSD, baterai lithium, motherboard, kabel, layar, charger, PCB, dll.
   - Anorganik: botol plastik, kaleng, kertas/kardus, kaca, styrofoam, logam, dll.
   - Organik: sisa makanan, sayuran, buah, daun kering, ampas kopi/teh, dll.
2. Jelaskan karakteristik sampah tersebut:
   - E-waste: apakah mengandung zat berbahaya B3.
   - Anorganik: apakah bisa didaur ulang atau bernilai jual.
   - Organik: apakah cocok untuk komposting atau biogas.
3. Berikan panduan penanganan yang sesuai:
   - E-waste: langkah pembongkaran aman dan pemilahan komponen.
   - Anorganik: cara membersihkan dan memilah untuk daur ulang atau dijual.
   - Organik: panduan komposting sederhana (cacah, campur coklat & hijau, jaga kelembapan) atau manfaat lain seperti pupuk cair.
4. Rekomendasikan aksi selanjutnya:
   - Jual di marketplace (untuk e-waste layak jual, anorganik bernilai seperti botol, kardus, logam).
   - Antar ke dropbox atau bank sampah terdekat.
   - Kompos di rumah atau serahkan ke pengolahan organik.
   - Buang di tempat sampah B3 khusus (untuk e-waste berbahaya).
5. Jawab dalam Bahasa Indonesia yang ramah, ringkas, dan natural seperti sedang bicara langsung.

Jika kamu mendeteksi sampah dari gambar, sertakan JSON berikut di AWAL respons (sebelum penjelasan teks):
{"detected":true,"component":"nama item/sampah","category":"Elektronik|Baterai|PCB|Kabel|Layar|Plastik|Kertas|Kaca|Logam|Organik|Lainnya","waste_type":"E-waste|Anorganik|Organik","is_b3":true/false,"condition":"Layak jual|Kompos|Perlu daur ulang|Buang di dropbox B3","action":"Pesan singkat aksi"}

Jika tidak ada sampah terdeteksi atau gambar tidak jelas, cukup balas: "Arahkan kamera ke sampah yang ingin diidentifikasi." tanpa JSON.
Jaga jawaban max 2-3 kalimat agar enak diucapkan.`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseDetection(rawText) {
  try {
    const match = rawText.match(/\{[\s\S]*?"detected"[\s\S]*?\}/);
    if (match) {
      const json = JSON.parse(match[0]);
      return { detectionResult: json, cleanText: rawText.replace(match[0], "").trim() };
    }
  } catch {}
  return { detectionResult: null, cleanText: rawText };
}

function base64ToFloat32(base64, sourceSampleRate, targetSampleRate) {
  // Decode base64 → Int16 PCM → Float32
  const bin = atob(base64);
  const int16 = new Int16Array(bin.length / 2);
  for (let i = 0; i < int16.length; i++) {
    int16[i] = (bin.charCodeAt(i * 2)) | (bin.charCodeAt(i * 2 + 1) << 8);
  }

  // Resample jika perlu (linear interpolation)
  if (sourceSampleRate === targetSampleRate) {
    const f32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) f32[i] = int16[i] / 32768.0;
    return f32;
  }

  const ratio = sourceSampleRate / targetSampleRate;
  const outLen = Math.round(int16.length / ratio);
  const f32 = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const srcIdx = i * ratio;
    const lo = Math.floor(srcIdx);
    const hi = Math.min(lo + 1, int16.length - 1);
    const t = srcIdx - lo;
    f32[i] = ((1 - t) * int16[lo] + t * int16[hi]) / 32768.0;
  }
  return f32;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return window.btoa(bin);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGeminiLive() {
  const [status, setStatus] = useState("idle");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [caption, setCaption] = useState("");
  const [detectionResult, setDetectionResult] = useState(null);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState([]);

  const clientRef = useRef(null);
  const pendingFrameRef = useRef(null);
  const frameTimerRef = useRef(null);
  const isBusyRef = useRef(false);
  const lastHashRef = useRef("");
  const accumulatedAiTextRef = useRef("");
  const flushTimerRef = useRef(null);
  const frameLoopActiveRef = useRef(false);

  // ── Playback refs ─────────────────────────────────────────────────────────
  // Satu AudioContext shared selama session — tidak pernah ditutup antar chunk
  const playbackCtxRef = useRef(null);
  const nextPlayTimeRef = useRef(0);
  const speakEndTimerRef = useRef(null);
  const isAISpeakingRef = useRef(false);  // ref version untuk callback

  // ── Mic refs ──────────────────────────────────────────────────────────────
  const audioCtxRef = useRef(null);
  const workletNodeRef = useRef(null);
  const micSourceRef = useRef(null);
  const micStreamRef = useRef(null);
  const isMicConnectedRef = useRef(false); // apakah source→worklet tersambung
  const micUnmuteTimerRef = useRef(null);

  // Pre-load TTS voices
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // ── Mic mute/unmute (disconnect worklet input to stop sending to Gemini) ──
  const muteMic = useCallback(() => {
    if (!isMicConnectedRef.current) return;
    try {
      micSourceRef.current?.disconnect(workletNodeRef.current);
    } catch {}
    isMicConnectedRef.current = false;
  }, []);

  const unmuteMic = useCallback(() => {
    if (isMicConnectedRef.current) return;
    if (!micSourceRef.current || !workletNodeRef.current) return;
    try {
      micSourceRef.current.connect(workletNodeRef.current);
      isMicConnectedRef.current = true;
    } catch {}
  }, []);

  // ── PCM audio player ──────────────────────────────────────────────────────
  // Decode base64 PCM int16 → Float32 → schedule ke AudioContext
  // Mute mic selama AI bicara untuk cegah echo loop.
  const playAudioChunk = useCallback((base64pcm, sampleRate = 24000) => {
    try {
      // Buat AudioContext SEKALI saat session start, reuse untuk semua chunk
      if (!playbackCtxRef.current || playbackCtxRef.current.state === "closed") {
        // Gunakan default sampleRate browser (biasanya 44100/48000);
        // kita akan resample manual dari 24000 ke ctx.sampleRate
        playbackCtxRef.current = new AudioContext();
        nextPlayTimeRef.current = 0;
      }
      const ctx = playbackCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // Mute mic saat AI mulai bicara → cegah echo
      muteMic();
      clearTimeout(micUnmuteTimerRef.current);

      // Decode & resample ke ctx.sampleRate
      const float32 = base64ToFloat32(base64pcm, sampleRate, ctx.sampleRate);

      const audioBuffer = ctx.createBuffer(1, float32.length, ctx.sampleRate);
      audioBuffer.copyToChannel(float32, 0);

      // Schedule langsung setelah chunk sebelumnya — tidak ada gap
      const startAt = Math.max(ctx.currentTime + 0.01, nextPlayTimeRef.current);
      nextPlayTimeRef.current = startAt + audioBuffer.duration;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(startAt);

      // Update speaking state
      if (!isAISpeakingRef.current) {
        isAISpeakingRef.current = true;
        setIsAISpeaking(true);
      }

      // Reset end timer: tunggu sampai semua chunk selesai diputar + 600ms buffer
      clearTimeout(speakEndTimerRef.current);
      const msUntilDone = (nextPlayTimeRef.current - ctx.currentTime) * 1000;
      speakEndTimerRef.current = setTimeout(() => {
        isAISpeakingRef.current = false;
        setIsAISpeaking(false);
        isBusyRef.current = false;
        setTimeout(() => setCaption(""), 3000);
        // Unmute mic setelah AI selesai bicara + 600ms extra buffer
        micUnmuteTimerRef.current = setTimeout(() => unmuteMic(), 600);
      }, msUntilDone + 300);

    } catch (err) {
      console.warn("[GeminiLive] playAudioChunk error:", err);
    }
  }, [muteMic, unmuteMic]);

  const stopPlayback = useCallback(() => {
    clearTimeout(speakEndTimerRef.current);
    clearTimeout(micUnmuteTimerRef.current);
    try { playbackCtxRef.current?.close(); } catch {}
    playbackCtxRef.current = null;
    nextPlayTimeRef.current = 0;
    isAISpeakingRef.current = false;
    setIsAISpeaking(false);
  }, []);

  // ── flushAiText: update UI teks (audio sudah diputar sendiri) ─────────────
  const flushAiText = useCallback((raw) => {
    const text = raw.trim();
    if (!text) return;
    const { detectionResult: det, cleanText } = parseDetection(text);
    if (det) setDetectionResult(det);
    const display = cleanText || text;
    setCaption(display);
    setMessages((prev) => [...prev, { role: "ai", text: display, ts: Date.now() }]);
    setTranscript((prev) => [...prev, { role: "ai", text: display, ts: Date.now() }]);
  }, []);

  // ── onText: TEXT mode fallback ────────────────────────────────────────────
  const handleTextChunk = useCallback((chunk) => {
    accumulatedAiTextRef.current += chunk;
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      const raw = accumulatedAiTextRef.current;
      accumulatedAiTextRef.current = "";
      isBusyRef.current = false;
      flushAiText(raw);
      // TEXT mode: browser TTS karena tidak ada audio dari Gemini
      const { cleanText } = parseDetection(raw.trim());
      const display = cleanText || raw.trim();
      if (display && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(display);
        utter.lang = "id-ID";
        const voices = window.speechSynthesis.getVoices();
        const v = voices.find((v) => v.lang === "id-ID") || voices.find((v) => v.lang.startsWith("id"));
        if (v) utter.voice = v;
        utter.onstart = () => setIsAISpeaking(true);
        utter.onend = () => { setIsAISpeaking(false); setTimeout(() => setCaption(""), 3000); };
        window.speechSynthesis.speak(utter);
      }
    }, 300);
  }, [flushAiText]);

  // ── onTranscript: AUDIO mode — teks dari outputTranscription ─────────────
  const handleTranscript = useCallback((entry) => {
    if (!entry || !entry.text?.trim()) return;
    if (entry.role === "user") {
      setTranscript((prev) => [...prev, { role: "user", text: entry.text, ts: Date.now() }]);
      setMessages((prev) => [...prev, { role: "user", text: entry.text, ts: Date.now() }]);
      return;
    }
    // AI transcript → accumulate → flush UI saja (audio diputar di playAudioChunk)
    accumulatedAiTextRef.current += entry.text;
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      const raw = accumulatedAiTextRef.current;
      accumulatedAiTextRef.current = "";
      flushAiText(raw);
    }, 300);
  }, [flushAiText]);

  // ── Stop mic ──────────────────────────────────────────────────────────────
  const stopMicStream = useCallback(() => {
    clearTimeout(micUnmuteTimerRef.current);
    try { workletNodeRef.current?.disconnect(); } catch {}
    try { micSourceRef.current?.disconnect(); } catch {}
    try { audioCtxRef.current?.close(); } catch {}
    try { micStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    workletNodeRef.current = null;
    micSourceRef.current = null;
    audioCtxRef.current = null;
    micStreamRef.current = null;
    isMicConnectedRef.current = false;
  }, []);

  // ── Start mic (AudioWorklet → PCM16 → sendAudio) ──────────────────────────
  const startMicStream = useCallback(async () => {
    if (!clientRef.current?.isOpen()) return;
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      micStreamRef.current = micStream;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      await audioCtx.audioWorklet.addModule("/pcm-processor.js");

      const source = audioCtx.createMediaStreamSource(micStream);
      micSourceRef.current = source;

      const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (evt) => {
        if (!clientRef.current?.isOpen()) return;
        clientRef.current.sendAudio(arrayBufferToBase64(evt.data));
      };

      // Sambungkan source → worklet (mulai kirim audio)
      source.connect(workletNode);
      isMicConnectedRef.current = true;

      console.info("[GeminiLive] Mic stream started ✅");
    } catch (err) {
      console.warn("[GeminiLive] startMicStream failed:", err);
    }
  }, []);

  // ── Frame loop ────────────────────────────────────────────────────────────
  const startFrameLoop = useCallback(() => {
    if (frameLoopActiveRef.current) return;
    frameLoopActiveRef.current = true;
    clearInterval(frameTimerRef.current);
    frameTimerRef.current = setInterval(() => {
      const frame = pendingFrameRef.current;
      if (!frame || isBusyRef.current || !clientRef.current?.isOpen()) return;
      const hash = frame.slice(-80);
      if (hash === lastHashRef.current) return;
      lastHashRef.current = hash;
      pendingFrameRef.current = null;
      isBusyRef.current = true;
      clientRef.current.sendFrame(frame);
    }, 2500);
  }, []);

  // ── Start session ─────────────────────────────────────────────────────────
  const startSession = useCallback(() => {
    if (clientRef.current) { clientRef.current.disconnect(); clientRef.current = null; }
    stopMicStream();
    stopPlayback();

    if (!GEMINI_API_KEY) {
      setError("VITE_GEMINI_API_KEY tidak ditemukan.");
      setStatus("error");
      return;
    }

    setStatus("connecting");
    setError(null);
    setMessages([]);
    setDetectionResult(null);
    setCaption("");
    setTranscript([]);
    accumulatedAiTextRef.current = "";
    lastHashRef.current = "";
    isBusyRef.current = false;
    frameLoopActiveRef.current = false;

    const client = createGeminiLiveClient({
      apiKey: GEMINI_API_KEY,
      systemInstruction: SYSTEM_PROMPT,
      onText: handleTextChunk,
      onTranscript: handleTranscript,
      onAudioChunk: (b64, _mime, sr) => playAudioChunk(b64, sr),
      onReady: () => {
        setStatus("live");
        startFrameLoop();
        startMicStream();
      },
      onClose: () => {
        setStatus("idle");
        clearInterval(frameTimerRef.current);
        frameLoopActiveRef.current = false;
        stopMicStream();
      },
      onError: (msg) => {
        setError(msg);
        setStatus("error");
        clearInterval(frameTimerRef.current);
        frameLoopActiveRef.current = false;
        isBusyRef.current = false;
        stopMicStream();
      },
      onAudioLevel: setAudioLevel,
    });

    clientRef.current = client;
    client.connect();
  }, [handleTextChunk, handleTranscript, playAudioChunk, startFrameLoop, startMicStream, stopMicStream, stopPlayback]);

  // ── Stop session ──────────────────────────────────────────────────────────
  const stopSession = useCallback(() => {
    clearInterval(frameTimerRef.current);
    frameTimerRef.current = null;
    frameLoopActiveRef.current = false;
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = null;
    window.speechSynthesis?.cancel();
    clientRef.current?.disconnect();
    clientRef.current = null;
    isBusyRef.current = false;
    pendingFrameRef.current = null;
    accumulatedAiTextRef.current = "";
    stopMicStream();
    stopPlayback();
    setStatus("idle");
    setIsAISpeaking(false);
    setCaption("");
    setAudioLevel(0);
  }, [stopMicStream, stopPlayback]);

  const sendVideoFrame = useCallback((b64) => { pendingFrameRef.current = b64; }, []);
  const sendAudioChunk = useCallback((b64) => { clientRef.current?.sendAudio(b64); }, []);
  const sendTextMessage = useCallback((text) => {
    if (!text.trim() || !clientRef.current?.isOpen()) return;
    setMessages((prev) => [...prev, { role: "user", text, ts: Date.now() }]);
    clientRef.current.sendText(text);
  }, []);

  const downloadTranscript = useCallback(() => {
    if (!transcript.length) return;
    const lines = transcript.map((m) => `${m.role === "user" ? "Kamu" : "UPTERRA AI"}: ${m.text}`).join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upterra-gemini-session-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [transcript]);

  useEffect(() => () => stopSession(), [stopSession]);

  return {
    status,
    isLive: status === "live",
    isConnecting: status === "connecting",
    isAISpeaking,
    messages,
    caption,
    detectionResult,
    error,
    audioLevel,
    transcript,
    startSession,
    stopSession,
    sendVideoFrame,
    sendAudioChunk,
    sendTextMessage,
    downloadTranscript,
  };
}
