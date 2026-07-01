import { useState, useRef, useCallback, useEffect } from "react";
import { createGeminiLiveClient } from "../services/geminiLive";

// Resolved at module load time — never changes at runtime.
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
      return {
        detectionResult: json,
        cleanText: rawText.replace(match[0], "").trim(),
      };
    }
  } catch {
    // malformed JSON in response — treat as plain text
  }
  return { detectionResult: null, cleanText: rawText };
}

function speakText(text, onStart, onEnd) {
  if (!window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const stripped = text.replace(/[{["\\}\]]/g, "").trim();
  if (!stripped) {
    onEnd?.();
    return;
  }

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
    // Fallback: some browsers never fire onvoiceschanged
    setTimeout(() => {
      if (window.speechSynthesis.getVoices().length === 0) doSpeak();
    }, 800);
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGeminiLive() {
  const [status, setStatus] = useState("idle"); // idle | connecting | live | error
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [caption, setCaption] = useState("");
  const [detectionResult, setDetectionResult] = useState(null);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState([]); // [{ role, text, ts }]

  const clientRef = useRef(null);
  const pendingFrameRef = useRef(null);
  const frameTimerRef = useRef(null);
  const isBusyRef = useRef(false);
  const lastHashRef = useRef("");
  const accumulatedTextRef = useRef("");
  const flushTimerRef = useRef(null);
  // FIX BUG 4: guard against double-starting the frame loop
  const frameLoopActiveRef = useRef(false);

  // Pre-load TTS voices on mount
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () =>
        window.speechSynthesis.getVoices();
    }
  }, []);

  // ── Handle streaming text chunks from Gemini ──────────────────────────────
  const handleTextChunk = useCallback((chunk) => {
    accumulatedTextRef.current += chunk;

    // Flush after 300ms of silence between chunks
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      // FIX BUG 1: reset busy flag FIRST, before the empty-string guard.
      // Previously, if the flushed text was empty (e.g. Gemini returned
      // only whitespace), isBusyRef was never reset and the frame loop
      // deadlocked permanently.
      isBusyRef.current = false;

      const raw = accumulatedTextRef.current.trim();
      accumulatedTextRef.current = "";
      if (!raw) return;

      const { detectionResult: det, cleanText } = parseDetection(raw);
      if (det) setDetectionResult(det);
      setCaption(cleanText);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: cleanText, ts: Date.now() },
      ]);

      setIsAISpeaking(true);
      speakText(
        cleanText,
        () => setIsAISpeaking(true),
        () => {
          setIsAISpeaking(false);
          setTimeout(() => setCaption(""), 3000);
        },
      );
    }, 300);
  }, []);

  // ── Handle transcript dari Gemini Live ─────────────────────────────────────
  const handleTranscript = useCallback((entry) => {
    if (!entry || !entry.text?.trim()) return;

    const ts = Date.now();
    const role = entry.role === "user" ? "user" : "ai";

    setTranscript((prev) => [...prev, { role, text: entry.text, ts }]);
    setMessages((prev) => [...prev, { role, text: entry.text, ts }]);
  }, []);

  // ── Frame dispatch loop (every 2.5s) ──────────────────────────────────────
  const startFrameLoop = useCallback(() => {
    // FIX BUG 4: prevent double interval if onReady fires more than once
    if (frameLoopActiveRef.current) return;
    frameLoopActiveRef.current = true;

    clearInterval(frameTimerRef.current);
    frameTimerRef.current = setInterval(() => {
      const frame = pendingFrameRef.current;
      if (!frame || isBusyRef.current || !clientRef.current?.isOpen()) return;

      const hash = frame.slice(-80);
      if (hash === lastHashRef.current) return; // same frame — skip

      lastHashRef.current = hash;
      pendingFrameRef.current = null;
      isBusyRef.current = true;
      clientRef.current.sendFrame(frame);
      // isBusyRef is reset by handleTextChunk's flush timer when Gemini responds.
      // If Gemini never responds (network drop), the WS onclose handler will
      // trigger a reconnect or fallback, which calls onReady → startFrameLoop
      // again, resetting the flag indirectly.
    }, 2500);
  }, []);

  // ── Start session ──────────────────────────────────────────────────────────
  const startSession = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    if (!GEMINI_API_KEY) {
      setError(
        "VITE_GEMINI_API_KEY tidak ditemukan. Tambahkan ke file .env kamu.",
      );
      setStatus("error");
      return;
    }

    setStatus("connecting");
    setError(null);
    setMessages([]);
    setDetectionResult(null);
    setCaption("");
    setTranscript([]);

    // FIX BUG 5: clear accumulated text on new session start
    accumulatedTextRef.current = "";
    lastHashRef.current = "";
    isBusyRef.current = false;
    frameLoopActiveRef.current = false; // allow startFrameLoop to arm again

    const client = createGeminiLiveClient({
      apiKey: GEMINI_API_KEY,
      systemInstruction: SYSTEM_PROMPT,
      enableAudioOutput: false, // Use Web Speech TTS (id-ID) instead of Gemini audio
      onText: handleTextChunk,
      onTranscript: handleTranscript,
      onReady: () => {
        setStatus("live");
        startFrameLoop();
      },
      onClose: () => {
        setStatus("idle");
        clearInterval(frameTimerRef.current);
        frameLoopActiveRef.current = false;
      },
      onError: (msg) => {
        setError(msg);
        setStatus("error");
        clearInterval(frameTimerRef.current);
        frameLoopActiveRef.current = false;
        isBusyRef.current = false; // ensure frame loop can restart if user retries
      },
      onAudioLevel: setAudioLevel,
    });

    clientRef.current = client;
    client.connect();
  }, [handleTextChunk, handleTranscript, startFrameLoop]);

  // ── Stop session ───────────────────────────────────────────────────────────
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

    setStatus("idle");
    setIsAISpeaking(false);
    setCaption("");
    setAudioLevel(0);
  }, []);

  // ── Send helpers ───────────────────────────────────────────────────────────
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
      .map(
        (m) => `${m.role === "user" ? "Kamu" : "UPTERRA AI"}: ${m.text}`,
      )
      .join("\n");

    const blob = new Blob([lines], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upterra-gemini-session-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [transcript]);

  // Cleanup on unmount
  useEffect(() => () => stopSession(), [stopSession]);

  return {
    status, // 'idle' | 'connecting' | 'live' | 'error'
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
