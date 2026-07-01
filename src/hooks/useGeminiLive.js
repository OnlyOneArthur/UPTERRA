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
  } catch {
    // malformed JSON — treat as plain text
  }
  return { detectionResult: null, cleanText: rawText };
}

function speakText(text, onStart, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const stripped = text.replace(/[{["\\}\]]/g, "").trim();
  if (!stripped) { onEnd?.(); return; }

  function doSpeak() {
    const utter = new SpeechSynthesisUtterance(stripped);
    utter.lang = "id-ID";
    utter.rate = 1.05;
    utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const v =
      voices.find((v) => v.lang === "id-ID") ||
      voices.find((v) => v.lang.startsWith("id")) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (v) utter.voice = v;
    utter.onstart = () => onStart?.();
    utter.onend = () => onEnd?.();
    utter.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utter);
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    setTimeout(() => {
      if (window.speechSynthesis.getVoices().length === 0) doSpeak();
    }, 800);
  }
}

/**
 * arrayBufferToBase64
 * Convert ArrayBuffer (PCM16 bytes) → base64 string untuk dikirim ke Gemini.
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
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
  const accumulatedTextRef = useRef("");
  const flushTimerRef = useRef(null);
  const frameLoopActiveRef = useRef(false);

  // ── Mic audio streaming refs ──────────────────────────────────────────────
  const audioCtxRef = useRef(null);
  const workletNodeRef = useRef(null);
  const micSourceRef = useRef(null);
  const micStreamRef = useRef(null);

  // Pre-load TTS voices
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // ── Handle text chunks ────────────────────────────────────────────────────
  const handleTextChunk = useCallback((chunk) => {
    accumulatedTextRef.current += chunk;
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      isBusyRef.current = false;
      const raw = accumulatedTextRef.current.trim();
      accumulatedTextRef.current = "";
      if (!raw) return;

      const { detectionResult: det, cleanText } = parseDetection(raw);
      if (det) setDetectionResult(det);
      setCaption(cleanText);
      setMessages((prev) => [...prev, { role: "ai", text: cleanText, ts: Date.now() }]);

      setIsAISpeaking(true);
      speakText(
        cleanText,
        () => setIsAISpeaking(true),
        () => { setIsAISpeaking(false); setTimeout(() => setCaption(""), 3000); },
      );
    }, 300);
  }, []);

  // ── Handle transcript ─────────────────────────────────────────────────────
  const handleTranscript = useCallback((entry) => {
    if (!entry || !entry.text?.trim()) return;
    const ts = Date.now();
    const role = entry.role === "user" ? "user" : "ai";
    setTranscript((prev) => [...prev, { role, text: entry.text, ts }]);
    setMessages((prev) => [...prev, { role, text: entry.text, ts }]);
  }, []);

  // ── Stop mic stream ───────────────────────────────────────────────────────
  const stopMicStream = useCallback(() => {
    try { workletNodeRef.current?.disconnect(); } catch {}
    try { micSourceRef.current?.disconnect(); } catch {}
    try { audioCtxRef.current?.close(); } catch {}
    try { micStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    workletNodeRef.current = null;
    micSourceRef.current = null;
    audioCtxRef.current = null;
    micStreamRef.current = null;
    console.info("[GeminiLive] Mic stream stopped");
  }, []);

  // ── Start mic stream (AudioWorklet → PCM16 → sendAudio) ──────────────────
  const startMicStream = useCallback(async () => {
    if (!clientRef.current?.isOpen()) return;

    try {
      // Request mic. ScanPage sudah punya stream, tapi AudioWorklet butuh
      // AudioContext sendiri dengan sample rate 16kHz agar match Gemini.
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

      // AudioContext pada 16kHz agar tidak perlu resample manual
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      // Load AudioWorklet processor dari /public/pcm-processor.js
      await audioCtx.audioWorklet.addModule("/pcm-processor.js");

      const source = audioCtx.createMediaStreamSource(micStream);
      micSourceRef.current = source;

      const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");
      workletNodeRef.current = workletNode;

      // Setiap chunk PCM dari worklet → base64 → kirim ke Gemini
      workletNode.port.onmessage = (evt) => {
        if (!clientRef.current?.isOpen()) return;
        const base64 = arrayBufferToBase64(evt.data);
        clientRef.current.sendAudio(base64);
      };

      source.connect(workletNode);
      // Worklet tidak perlu connect ke destination (kita tidak butuh output speaker)

      console.info("[GeminiLive] Mic stream started, streaming PCM to Gemini ✅");
    } catch (err) {
      console.warn("[GeminiLive] startMicStream failed:", err);
      // Non-fatal: session tetap jalan, hanya voice input yang tidak aktif
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
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
    stopMicStream();

    if (!GEMINI_API_KEY) {
      setError("VITE_GEMINI_API_KEY tidak ditemukan. Tambahkan ke file .env kamu.");
      setStatus("error");
      return;
    }

    setStatus("connecting");
    setError(null);
    setMessages([]);
    setDetectionResult(null);
    setCaption("");
    setTranscript([]);
    accumulatedTextRef.current = "";
    lastHashRef.current = "";
    isBusyRef.current = false;
    frameLoopActiveRef.current = false;

    const client = createGeminiLiveClient({
      apiKey: GEMINI_API_KEY,
      systemInstruction: SYSTEM_PROMPT,
      onText: handleTextChunk,
      onTranscript: handleTranscript,
      onReady: () => {
        setStatus("live");
        startFrameLoop();
        // Start streaming mic audio ke Gemini setelah session ready
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
  }, [handleTextChunk, handleTranscript, startFrameLoop, startMicStream, stopMicStream]);

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
    accumulatedTextRef.current = "";
    stopMicStream();
    setStatus("idle");
    setIsAISpeaking(false);
    setCaption("");
    setAudioLevel(0);
  }, [stopMicStream]);

  const sendVideoFrame = useCallback((base64Jpeg) => {
    pendingFrameRef.current = base64Jpeg;
  }, []);

  const sendAudioChunk = useCallback((base64Pcm) => {
    clientRef.current?.sendAudio(base64Pcm);
  }, []);

  const sendTextMessage = useCallback((text) => {
    if (!text.trim() || !clientRef.current?.isOpen()) return;
    setMessages((prev) => [...prev, { role: "user", text, ts: Date.now() }]);
    clientRef.current.sendText(text);
  }, []);

  const downloadTranscript = useCallback(() => {
    if (!transcript.length) return;
    const lines = transcript
      .map((m) => `${m.role === "user" ? "Kamu" : "UPTERRA AI"}: ${m.text}`)
      .join("\n");
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
