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

  // ---- Auto-start AI session on mount, restart on mode change ----
  useEffect(() => {
    startSession(mode);
    return () => stopSession();
  }, [mode]);

  // ---- Camera stream ----
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

  // ---- Send video frame to AI every 2s when session active (camera mode) ----
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
      sendVideoFrame(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="sp-root">

      {/* ====== MODE KAMERA ====== */}
      {mode === 'camera' && (
        <div className="sp-cam-root">
          {cameraActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="sp-video" />
          ) : (
            <div className="sp-no-cam">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <p>Izin kamera diperlukan</p>
            </div>
          )}

          <ScanFrame active={sessionActive} />

          {/* Top: mode toggle + status */}
          <div className="sp-top-bar">
            <ScanModeToggle mode={mode} onChange={setMode} />
          </div>
          {(sessionActive || isConnecting) && (
            <div className="sp-status-badge">
              <span className={`sp-status-dot ${isConnecting ? 'connecting' : 'live'}`} />
              {isConnecting ? 'Menghubungkan...' : 'AI Aktif'}
            </div>
          )}

          {/* Gallery pick */}
          <div className="sp-gallery-wrap">
            <button className="sp-gallery-btn" onClick={() => fileInputRef.current?.click()}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Pilih dari galeri
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGalleryPick} />
          </div>

          {/* Result panel overlay */}
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
        </div>
      )}

      {/* ====== MODE SUARA (LIGHT) ====== */}
      {mode === 'voice' && (
        <div className="sp-voice-root">
          {/* Top: mode toggle */}
          <div className="sp-top-bar sp-top-bar--light">
            <ScanModeToggle mode={mode} onChange={setMode} />
          </div>

          {/* Main voice UI */}
          <div className="sp-voice-body">
            <p className="sp-voice-hint">
              {sessionActive
                ? 'Sedang mendengarkan...'
                : isConnecting
                ? 'Menghubungkan AI...'
                : 'Ceritakan barang atau sampah yang mau diidentifikasi'}
            </p>

            {/* Mic button dengan animasi gelombang */}
            <div className="sp-mic-wrap">
              {/* Wave rings — aktif saat sessionActive */}
              {sessionActive && (
                <>
                  <div className="sp-wave sp-wave-1" />
                  <div className="sp-wave sp-wave-2" />
                  <div className="sp-wave sp-wave-3" />
                </>
              )}
              <div className={`sp-mic-btn ${sessionActive ? 'sp-mic-btn--active' : ''} ${isConnecting ? 'sp-mic-btn--loading' : ''}`}>
                {isConnecting ? (
                  <svg className="sp-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </div>
            </div>

            <p className="sp-voice-tap-hint">
              {sessionActive ? 'AI sedang aktif — bicara sekarang' : 'Ketuk dimana saja untuk mulai'}
            </p>

            {/* Error */}
            {error && <div className="sp-voice-error">{error}</div>}

            {/* Chat bubble area */}
            {(transcript || aiResponse) && (
              <div className="sp-voice-chat">
                {transcript && (
                  <div className="sp-bubble sp-bubble--user">
                    <span className="sp-chip-label">Kamu</span>
                    <p>{transcript}</p>
                  </div>
                )}
                {aiResponse && (
                  <div className="sp-bubble sp-bubble--ai">
                    <span className="sp-chip-label sp-chip-ai">UPTERRA AI</span>
                    <p>{aiResponse}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== BOTTOM NAV ====== */}
      <BottomNav />
    </div>
  );
}
