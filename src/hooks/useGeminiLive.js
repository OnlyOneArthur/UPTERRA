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
  // accumulatedAiTextRef: buffer transcript AI chunks sebelum di-flush ke TTS
  const accumulatedAiTextRef = useRef("");
  const flushTimerRef = useRef(null);
  const frameLoopActiveRef = useRef(false);

  // Mic refs
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

  // ── flushAiText: parse + TTS + update UI ──────────────────────────────────
  // Shared logic untuk kedua path: teks langsung (TEXT mode)
  // maupun transcript teks dari audio (AUDIO mode).
  const flushAiText = useCallback((raw) => {
    const text = raw.trim();
    if (!text) return;

    const { detectionResult: det, cleanText } = parseDetection(text);
    if (det) setDetectionResult(det);

    const display = cleanText || text;
    setCaption(display);
    setMessages((prev) => [...prev, { role: "ai", text: display, ts: Date.now() }]);
    setTranscript((prev) => [...prev, { role: "ai", text: display, ts: Date.now() }]);

    isBusyRef.current = false;

    setIsAISpeaking(true);
    speakText(
      display,
      () => setIsAISpeaking(true),
      () => { setIsAISpeaking(false); setTimeout(() => setCaption(""), 3000); },
    );
  }, []);

  // ── onText: dipanggil oleh part.text dari modelTurn (TEXT mode) ─────────
  const handleTextChunk = useCallback((chunk) => {
    accumulatedAiTextRef.current += chunk;
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      const raw = accumulatedAiTextRef.current;
      accumulatedAiTextRef.current = "";
      flushAiText(raw);
    }, 300);
  }, [flushAiText]);

  // ── onTranscript: dipanggil oleh inputTranscription / outputTranscription ──
  // AUDIO mode: outputTranscription.text adalah satu-satunya teks dari AI.
  // Kita accumulate juga agar potongan kecil tidak di-speak satu-satu.
  const handleTranscript = useCallback((entry) => {
    if (!entry || !entry.text?.trim()) return;

    if (entry.role === "user") {
      // User transcript: langsung simpan, tidak perlu TTS
      setTranscript((prev) => [...prev, { role: "user", text: entry.text, ts: Date.now() }]);
      setMessages((prev) => [...prev, { role: "user", text: entry.text, ts: Date.now() }]);
      return;
    }

    // AI transcript (outputTranscription) → accumulate → flush → TTS
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
    console.info("[GeminiLive] Mic stream stopped");
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
      onText: handleTextChunk,       // TEXT mode fallback
      onTranscript: handleTranscript, // AUDIO mode (primary)
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
    accumulatedAiTextRef.current = "";
    stopMicStream();
    setStatus("idle");
    setIsAISpeaking(false);
    setCaption("");
    setAudioLevel(0);
  }, [stopMicStream]);

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
