import { useState, useRef, useCallback, useEffect } from "react";
import { createGeminiLiveClient } from "../services/geminiLive";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `Kamu adalah UPTERRA AI, asisten cerdas untuk identifikasi dan pengelolaan sampah elektronik (e-waste).

Tugasmu:
1. Identifikasi jenis komponen elektronik yang terlihat (RAM, SSD, baterai lithium, motherboard, kabel, layar, dll).
2. Jelaskan apakah komponen tersebut mengandung zat berbahaya B3.
3. Berikan panduan pemilahan dan langkah pembongkaran yang aman.
4. Rekomendasikan aksi selanjutnya: jual di marketplace, antar ke dropbox, atau daur ulang.
5. Jawab dalam Bahasa Indonesia yang ramah, ringkas, dan natural seperti sedang bicara langsung.

Jika kamu mendeteksi komponen elektronik dari gambar, sertakan JSON berikut di AWAL respons (sebelum penjelasan teks):
{"detected":true,"component":"nama komponen","category":"Elektronik|Baterai|PCB|Kabel|Layar|Plastik|Lainnya","is_b3":true/false,"condition":"Layak jual|Perlu daur ulang|Buang di dropbox B3","action":"Pesan singkat aksi"}

Jika tidak ada komponen terdeteksi atau gambar tidak jelas, cukup balas: "Arahkan kamera ke komponen elektronik." tanpa JSON.
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

function base64ToArrayBuffer(base64) {
  const bin = atob(base64);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
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

  // Audio playback refs
  const playbackCtxRef = useRef(null);
  const nextPlayTimeRef = useRef(0);  // schedule chunks back-to-back
  const isSpeakingRef = useRef(false);
  const speakEndTimerRef = useRef(null);

  // Mic refs
  const audioCtxRef = useRef(null);
  const workletNodeRef = useRef(null);
  const micSourceRef = useRef(null);
  const micStreamRef = useRef(null);

  // Pre-load TTS voices (fallback path)
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // ── PCM audio player ──────────────────────────────────────────────────
  // Gemini kirim audio/pcm;rate=24000 (signed int16 little-endian, mono)
  // Kita decode manual: base64 -> ArrayBuffer -> Int16 -> Float32 -> AudioBuffer -> play
  const playAudioChunk = useCallback((base64pcm, sampleRate = 24000) => {
    try {
      // Buat/reuse AudioContext untuk playback
      if (!playbackCtxRef.current || playbackCtxRef.current.state === "closed") {
        playbackCtxRef.current = new AudioContext({ sampleRate });
        nextPlayTimeRef.current = 0;
      }
      const ctx = playbackCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // Decode base64 -> raw bytes
      const rawBuf = base64ToArrayBuffer(base64pcm);
      // PCM int16 little-endian -> Float32
      const int16 = new Int16Array(rawBuf);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      // Buat AudioBuffer
      const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
      audioBuffer.copyToChannel(float32, 0);

      // Schedule playback tepat setelah chunk sebelumnya selesai
      const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(startTime);

      // Track isAISpeaking
      if (!isSpeakingRef.current) {
        isSpeakingRef.current = true;
        setIsAISpeaking(true);
      }
      clearTimeout(speakEndTimerRef.current);
      // Kalau tidak ada chunk baru dalam 500ms setelah schedule selesai,
      // anggap AI selesai bicara
      const msUntilEnd = (nextPlayTimeRef.current - ctx.currentTime) * 1000;
      speakEndTimerRef.current = setTimeout(() => {
        isSpeakingRef.current = false;
        setIsAISpeaking(false);
        isBusyRef.current = false;
        setTimeout(() => setCaption(""), 3000);
      }, msUntilEnd + 500);

    } catch (err) {
      console.warn("[GeminiLive] playAudioChunk error:", err);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    clearTimeout(speakEndTimerRef.current);
    try { playbackCtxRef.current?.close(); } catch {}
    playbackCtxRef.current = null;
    nextPlayTimeRef.current = 0;
    isSpeakingRef.current = false;
    setIsAISpeaking(false);
  }, []);

  // ── flushAiText: update UI caption/messages + transcript ─────────────────
  // Audio sudah diputar via playAudioChunk; ini hanya untuk UI teks.
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

  // ── onText: fallback TEXT mode (responseModalities=["TEXT"]) ────────────
  const handleTextChunk = useCallback((chunk) => {
    accumulatedAiTextRef.current += chunk;
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      const raw = accumulatedAiTextRef.current;
      accumulatedAiTextRef.current = "";
      isBusyRef.current = false;
      flushAiText(raw);
      // TEXT mode: gunakan browser TTS karena tidak ada audio dari Gemini
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

  // ── onTranscript: AUDIO mode (primary) ───────────────────────────────
  // outputTranscription datang bersamaan dengan audio chunks.
  // Kita accumulate teks untuk UI; audio sudah diputar oleh playAudioChunk.
  const handleTranscript = useCallback((entry) => {
    if (!entry || !entry.text?.trim()) return;

    if (entry.role === "user") {
      setTranscript((prev) => [...prev, { role: "user", text: entry.text, ts: Date.now() }]);
      setMessages((prev) => [...prev, { role: "user", text: entry.text, ts: Date.now() }]);
      return;
    }

    // AI transcript → accumulate → flush UI (audio sudah diputar sendiri)
    accumulatedAiTextRef.current += entry.text;
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      const raw = accumulatedAiTextRef.current;
      accumulatedAiTextRef.current = "";
      flushAiText(raw);
    }, 300);
  }, [flushAiText]);

  // ── Stop mic ─────────────────────────────────────────────────────────────
  const stopMicStream = useCallback(() => {
    try { workletNodeRef.current?.disconnect(); } catch {}
    try { micSourceRef.current?.disconnect(); } catch {}
    try { audioCtxRef.current?.close(); } catch {}
    try { micStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    workletNodeRef.current = null;
    micSourceRef.current = null;
    audioCtxRef.current = null;
    micStreamRef.current = null;
  }, []);

  // ── Start mic (AudioWorklet → PCM16 → sendAudio) ──────────────────────
  const startMicStream = useCallback(async () => {
    if (!clientRef.current?.isOpen()) return;
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
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
      source.connect(workletNode);
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
      onAudioChunk: (b64, _mime, sampleRate) => playAudioChunk(b64, sampleRate),
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

  const sendVideoFrame = useCallback((base64Jpeg) => { pendingFrameRef.current = base64Jpeg; }, []);
  const sendAudioChunk = useCallback((base64Pcm) => { clientRef.current?.sendAudio(base64Pcm); }, []);
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
