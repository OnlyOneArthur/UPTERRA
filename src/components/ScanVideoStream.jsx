/**
 * ScanVideoStream.jsx
 *
 * Live Gemini video scan component. Renders the camera feed, overlays the
 * scan frame, streams frames to Gemini Live, and displays AI results.
 *
 * Props:
 *  - onBack: () => void   — called when user exits live mode
 */

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ScanFrame from './ScanFrame';
import ScanResultCard from './ScanResultCard';
import { useGeminiLive } from '../hooks/useGeminiLive';

export default function ScanVideoStream({ onBack }) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const {
    status,
    isLive,
    isConnecting,
    isAISpeaking,
    messages,
    caption,
    detectionResult,
    error,
    audioLevel,
    startSession,
    stopSession,
    sendVideoFrame,
  } = useGeminiLive();

  // ── Camera stream ─────────────────────────────────────────────────────────
  useEffect(() => {
    let stream = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((s) => {
        stream = s;
        setCameraReady(true);
        setCameraError(false);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((s) => {
            stream = s;
            setCameraReady(true);
            setCameraError(false);
            if (videoRef.current) videoRef.current.srcObject = s;
          })
          .catch(() => setCameraError(true));
      });
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  // ── Auto-start Gemini session once camera is ready ────────────────────────
  useEffect(() => {
    if (cameraReady) startSession();
    return () => stopSession();
  }, [cameraReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Frame capture loop — every 2 seconds ─────────────────────────────────
  useEffect(() => {
    if (!isLive || !videoRef.current) return;
    const canvas = document.createElement('canvas');
    const iv = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      sendVideoFrame(canvas.toDataURL('image/jpeg', 0.65).split(',')[1]);
    }, 2000);
    return () => clearInterval(iv);
  }, [isLive, sendVideoFrame]);

  // ── Gallery upload ────────────────────────────────────────────────────────
  const handleGalleryPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => sendVideoFrame(ev.target.result.split(',')[1]);
    reader.readAsDataURL(file);
  };

  const lastAiMsg = [...messages].reverse().find((m) => m.role === 'ai');
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');

  const statusLabel =
    isConnecting ? 'Menghubungkan Gemini...' :
    isAISpeaking ? 'AI Berbicara...' :
    isLive       ? 'Gemini Live Aktif' :
    status === 'error' ? 'Koneksi Gagal' : 'Memulai...';

  const statusClass =
    isConnecting ? 'svs-dot--connecting' :
    isAISpeaking ? 'svs-dot--speaking' :
    isLive       ? 'svs-dot--live' :
    status === 'error' ? 'svs-dot--error' : 'svs-dot--idle';

  return (
    <div className="svs-root">
      {/* ── Camera feed ── */}
      {cameraReady ? (
        <video ref={videoRef} autoPlay playsInline muted className="svs-video" />
      ) : cameraError ? (
        <div className="svs-no-cam">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <p>Izin kamera diperlukan</p>
        </div>
      ) : (
        <div className="svs-loading">
          <div className="svs-spinner" />
          <p>Memulai kamera...</p>
        </div>
      )}

      {/* ── Scan frame overlay ── */}
      <ScanFrame active={isLive} />

      {/* ── Top bar: back button + status ── */}
      <div className="svs-top-bar">
        <button className="svs-back-btn" onClick={() => { stopSession(); onBack?.(); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali
        </button>

        <div className="svs-status-badge">
          {/* Audio level ring when AI is speaking */}
          {isAISpeaking && (
            <span
              className="svs-audio-ring"
              style={{ transform: `scale(${1 + audioLevel * 0.6})` }}
            />
          )}
          <span className={`svs-dot ${statusClass}`} />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* ── Caption overlay ── */}
      <AnimatePresence>
        {caption && (
          <motion.div
            className="svs-caption"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <p>{caption}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gallery picker button ── */}
      <div className="svs-gallery-wrap">
        <button
          className="svs-gallery-btn"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Pilih dari Galeri
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleGalleryPick}
        />
      </div>

      {/* ── Result / error panel ── */}
      <AnimatePresence>
        {(detectionResult || lastAiMsg || error) && (
          <motion.div
            className="svs-result-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {error && <div className="svs-error">{error}</div>}
            {detectionResult && <ScanResultCard result={detectionResult} />}
            {lastUserMsg && (
              <div className="svs-transcript">
                <span className="svs-chip">Kamu</span>
                <p>{lastUserMsg.text}</p>
              </div>
            )}
            {lastAiMsg && (
              <div className="svs-ai-bubble">
                <span className="svs-chip svs-chip--ai">UPTERRA AI</span>
                <p>{lastAiMsg.text}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
