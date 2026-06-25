import { useRef, useState, useEffect } from 'react';
import ScanFrame from '../components/ScanFrame';
import ScanModeToggle from '../components/ScanModeToggle';
import ScanResultCard from '../components/ScanResultCard';
import BottomNav from '../components/layout/BottomNav';
import { useScanAI } from '../hooks/useScanAI';
import '../styles/scan.css';

export default function ScanPage() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('camera');
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const {
    sessionActive,
    isConnecting,
    transcript,
    aiResponse,
    detectionResult,
    startSession,
    stopSession,
    sendVideoFrame,
    error,
  } = useScanAI();

  // Start/stop camera stream based on mode
  useEffect(() => {
    let localStream = null;

    if (mode === 'camera') {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        .then((s) => {
          localStream = s;
          setStream(s);
          setCameraActive(true);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(() => setCameraActive(false));
    } else {
      setStream((prev) => {
        if (prev) prev.getTracks().forEach((t) => t.stop());
        return null;
      });
      setCameraActive(false);
    }

    return () => {
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  // Send frame to AI every 2 seconds when session active
  useEffect(() => {
    if (!sessionActive || mode !== 'camera' || !videoRef.current) return;
    const canvas = document.createElement('canvas');
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
      sendVideoFrame(base64);
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionActive, mode, sendVideoFrame]);

  const handleGalleryPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      if (!sessionActive) startSession(mode);
      sendVideoFrame(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleSession = () => {
    if (sessionActive) stopSession();
    else startSession(mode);
  };

  return (
    <div className="sp-root">
      {/* ── Camera / Voice Viewport ── */}
      <div className="sp-viewport">
        {mode === 'camera' && cameraActive ? (
          <video ref={videoRef} autoPlay playsInline muted className="sp-video" />
        ) : (
          <div className="sp-no-cam">
            {mode === 'voice' ? (
              <div className="sp-voice-visual">
                <div className={`sp-voice-ring ${sessionActive ? 'active' : ''}`}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </div>
                <p className="sp-voice-label">
                  {sessionActive ? 'Mendengarkan...' : 'Mode Suara'}
                </p>
                <p className="sp-voice-sub">
                  {sessionActive ? 'AI aktif — bicara sekarang' : 'Tekan tombol untuk mulai'}
                </p>
              </div>
            ) : (
              <div className="sp-cam-placeholder">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <p>Izin kamera diperlukan</p>
              </div>
            )}
          </div>
        )}

        {/* Corner brackets overlay */}
        {mode === 'camera' && <ScanFrame active={sessionActive} />}

        {/* ── Top mode toggle (Kamera / Suara) ── */}
        <div className="sp-top-bar">
          <ScanModeToggle mode={mode} onChange={setMode} />
        </div>

        {/* ── AI status badge ── */}
        {(sessionActive || isConnecting) && (
          <div className="sp-status-badge">
            <span className={`sp-status-dot ${isConnecting ? 'connecting' : 'live'}`} />
            {isConnecting ? 'Menghubungkan...' : 'AI Aktif'}
          </div>
        )}

        {/* ── Gallery pick ── */}
        {mode === 'camera' && (
          <div className="sp-gallery-wrap">
            <button
              className="sp-gallery-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Pilih dari galeri
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleGalleryPick}
            />
          </div>
        )}

        {/* ── Result / Response panel (overlays bottom of camera) ── */}
        {(detectionResult || aiResponse || error || transcript) && (
          <div className="sp-result-panel">
            {error && <div className="sp-error">{error}</div>}
            {detectionResult && <ScanResultCard result={detectionResult} />}
            {transcript && (
              <div className="sp-transcript">
                <span className="sp-chip-label">Kamu</span>
                <p>{transcript}</p>
              </div>
            )}
            {aiResponse && (
              <div className="sp-ai-bubble">
                <span className="sp-chip-label sp-chip-ai">UPTERRA AI</span>
                <p>{aiResponse}</p>
              </div>
            )}
          </div>
        )}

        {/* ── FAB: mulai / hentikan sesi AI ── */}
        <button
          className={`sp-fab ${
            sessionActive ? 'sp-fab--stop' : 'sp-fab--start'
          } ${isConnecting ? 'sp-fab--loading' : ''}`}
          onClick={handleToggleSession}
          disabled={isConnecting}
          aria-label={sessionActive ? 'Hentikan sesi AI' : 'Mulai sesi AI'}
        >
          {isConnecting ? (
            <svg className="sp-spin" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : sessionActive ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Bottom Nav (komponen yang sama dengan halaman lain) ── */}
      <BottomNav />
    </div>
  );
}
