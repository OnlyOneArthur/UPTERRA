/**
 * useGeminiLive.js
 *
 * React hook that manages a Gemini Live WebSocket session for real-time
 * video + voice scanning. Wraps createGeminiLiveClient and exposes a
 * clean API matching the rest of UPTERRA's hook conventions.
 *
 * Features:
 *  - Starts/stops Gemini Live session
 *  - Accepts video frames (JPEG base64) and audio (PCM16 base64)
 *  - Streams text responses with optional TTS via Web Speech API
 *  - Parses JSON detection payloads (same format as useScanAI)
 *  - Exposes connection status, messages, caption, detectionResult
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { createGeminiLiveClient } from '../services/geminiLive';

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

// ── Helpers ────────────────────────────────────────────────────────────────
function parseDetection(rawText) {
  try {
    const match = rawText.match(/\{[\s\S]*?"detected"[\s\S]*?\}/);
    if (match) {
      const json = JSON.parse(match[0]);
      return { detectionResult: json, cleanText: rawText.replace(match[0], '').trim() };
    }
  } catch {}
  return { detectionResult: null, cleanText: rawText };
}

function speakText(text, onStart, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const stripped = text.replace(/[{["\\}\]]/g, '').trim();
  if (!stripped) { onEnd?.(); return; }
  function doSpeak() {
    const utter = new SpeechSynthesisUtterance(stripped);
    utter.lang = 'id-ID';
    utter.rate = 1.05;
    utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const v =
      voices.find((v) => v.lang === 'id-ID') ||
      voices.find((v) => v.lang.startsWith('id')) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (v) utter.voice = v;
    utter.onstart = () => onStart?.();
    utter.onend = () => onEnd?.();
    utter.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utter);
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) doSpeak();
  else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    setTimeout(() => { if (window.speechSynthesis.getVoices().length === 0) doSpeak(); }, 800);
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useGeminiLive() {
  const [status, setStatus] = useState('idle'); // idle | connecting | live | error
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [caption, setCaption] = useState('');
  const [detectionResult, setDetectionResult] = useState(null);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const clientRef = useRef(null);
  const pendingFrameRef = useRef(null);
  const frameTimerRef = useRef(null);
  const isBusyRef = useRef(false);
  const lastHashRef = useRef('');
  const accumulatedTextRef = useRef('');
  const flushTimerRef = useRef(null);

  // Pre-load TTS voices
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // ── Handle streaming text chunks from Gemini ────────────────────────────
  const handleTextChunk = useCallback((chunk) => {
    accumulatedTextRef.current += chunk;
    // Flush after 300ms of silence between chunks
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      const raw = accumulatedTextRef.current.trim();
      accumulatedTextRef.current = '';
      if (!raw) return;
      const { detectionResult: det, cleanText } = parseDetection(raw);
      if (det) setDetectionResult(det);
      setCaption(cleanText);
      setMessages((prev) => [...prev, { role: 'ai', text: cleanText, ts: Date.now() }]);
      isBusyRef.current = false;
      setIsAISpeaking(true);
      speakText(
        cleanText,
        () => setIsAISpeaking(true),
        () => {
          setIsAISpeaking(false);
          setTimeout(() => setCaption(''), 3000);
        }
      );
    }, 300);
  }, []);

  // ── Frame dispatch loop (every 2.5s) ────────────────────────────────────
  const startFrameLoop = useCallback(() => {
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

  // ── Start session ────────────────────────────────────────────────────────
  const startSession = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
    if (!GEMINI_API_KEY) {
      setError('VITE_GEMINI_API_KEY tidak ditemukan. Tambahkan ke file .env kamu.');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    setError(null);
    setMessages([]);
    setDetectionResult(null);
    setCaption('');
    accumulatedTextRef.current = '';
    lastHashRef.current = '';
    isBusyRef.current = false;

    const client = createGeminiLiveClient({
      apiKey: GEMINI_API_KEY,
      systemInstruction: SYSTEM_PROMPT,
      enableAudioOutput: false, // Use Web Speech TTS (id-ID) instead
      onText: handleTextChunk,
      onReady: () => {
        setStatus('live');
        startFrameLoop();
      },
      onClose: () => {
        setStatus('idle');
        clearInterval(frameTimerRef.current);
      },
      onError: (msg) => {
        setError(msg);
        setStatus('error');
        clearInterval(frameTimerRef.current);
      },
      onAudioLevel: setAudioLevel,
    });

    clientRef.current = client;
    client.connect();
  }, [handleTextChunk, startFrameLoop]);

  // ── Stop session ─────────────────────────────────────────────────────────
  const stopSession = useCallback(() => {
    clearInterval(frameTimerRef.current);
    clearTimeout(flushTimerRef.current);
    window.speechSynthesis?.cancel();
    clientRef.current?.disconnect();
    clientRef.current = null;
    isBusyRef.current = false;
    pendingFrameRef.current = null;
    setStatus('idle');
    setIsAISpeaking(false);
    setCaption('');
    setAudioLevel(0);
  }, []);

  // ── Send helpers ─────────────────────────────────────────────────────────
  const sendVideoFrame = useCallback((base64Jpeg) => {
    pendingFrameRef.current = base64Jpeg;
  }, []);

  const sendAudioChunk = useCallback((base64Pcm) => {
    clientRef.current?.sendAudio(base64Pcm);
  }, []);

  const sendTextMessage = useCallback((text) => {
    if (!text.trim() || !clientRef.current?.isOpen()) return;
    setMessages((prev) => [...prev, { role: 'user', text, ts: Date.now() }]);
    isBusyRef.current = true;
    clientRef.current.sendText(text);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopSession(), [stopSession]);

  return {
    status,                  // 'idle' | 'connecting' | 'live' | 'error'
    isLive: status === 'live',
    isConnecting: status === 'connecting',
    isAISpeaking,
    messages,
    caption,
    detectionResult,
    error,
    audioLevel,
    startSession,
    stopSession,
    sendVideoFrame,
    sendAudioChunk,
    sendTextMessage,
  };
}
