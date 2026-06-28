import { useRef, useState, useEffect, useCallback } from 'react';
import ScanFrame from '../components/ScanFrame';
import ScanModeToggle from '../components/ScanModeToggle';
import ScanResultCard from '../components/ScanResultCard';
import ScanVideoStream from '../components/ScanVideoStream';
import BottomNav from '../components/layout/BottomNav';
import { useScanAI } from '../hooks/useScanAI';
import '../styles/scan.css';

export default function ScanPage() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const {
    sessionActive,
    isConnecting,
    isAIProcessing,
    isAISpeaking,
    messages,
    caption,
    detectionResult,
    lastFrameResult,
    startSession,
    stopSession,
    sendVideoFrame,
    error,
    voiceError,
  } = useScanAI();

  // Unlock AudioContext + speechSynthesis on first user tap
  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume().then(() => ctx.close());
    } catch {}
    if (window.speechSynthesis) {
      const warm = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(warm);
      window.speechSynthesis.cancel();
    }
    setAudioUnlocked(true);
  }, [audioUnlocked]);

  // Start AI session after audio unlock (camera / voice modes only)
  useEffect(() => {
    if (!audioUnlocked || mode === 'live') return;
    startSession(mode);
    return () => stopSession();
  }, [mode, audioUnlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  // Camera stream (camera mode only)
  useEffect(() => {
    if (mode !== 'camera') { setCameraActive(false); return; }
    let localStream = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((s) => { localStream = s; setCameraActive(true); if (videoRef.current) videoRef.current.srcObject = s; })
      .catch(() => {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((s) => { localStream = s; setCameraActive(true); if (videoRef.current) videoRef.current.srcObject = s; })
          .catch(() => setCameraActive(false));
      });
    return () => { localStream?.getTracks().forEach((t) => t.stop()); };
  }, [mode]);

  // Send frame every 2 s (camera mode)
  useEffect(() => {
    if (!sessionActive || mode !== 'camera' || !videoRef.current) return;
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
  }, [sessionActive, mode, sendVideoFrame]);

  const handleGalleryPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => sendVideoFrame(ev.target.result.split(',')[1]);
    reader.readAsDataURL(file);
  };

  const lastAiMsg = [...messages].reverse().find((m) => m.role === 'ai');
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');

  // ── Gemini Live mode: render dedicated component ─────────────────────────
  if (mode === 'live') {
    return (
      <div className="sp-root">
        {/* Mode toggle still visible so user can switch back */}
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
          <ScanModeToggle mode={mode} onChange={setMode} />
        </div>
        <ScanVideoStream onBack={() => setMode('camera')} />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="sp-root" onClick={unlockAudio}>

      {/* ── Splash unlock overlay ── */}
      {!audioUnlocked && (
        <div className="sp-unlock-overlay">
          <div className="sp-unlock-card">
            <div className="sp-unlock-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <h2 className="sp-unlock-title">UPTERRA AI</h2>
            <p className="sp-unlock-desc">Ketuk untuk mengaktifkan kamera &amp; suara AI</p>
            <button className="sp-unlock-btn">Mulai Scan</button>
          </div>
        </div>
      )}

      {/* ── Camera mode ── */}
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

          <div className="sp-top-bar">
            <ScanModeToggle mode={mode} onChange={setMode} />
          </div>

          {audioUnlocked && (
            <div className="sp-status-badge">
              <span className={`sp-status-dot ${
                isAIProcessing ? 'connecting' :
                isAISpeaking   ? 'speaking'   :
                sessionActive  ? 'live'        : 'idle'
              }`} />
              {isAIProcessing ? 'Menganalisa...' : isAISpeaking ? 'AI Bicara...' : sessionActive ? 'AI Aktif' : 'Memulai...'}
            </div>
          )}

          {caption && (
            <div className="sp-caption-overlay">
              <p>{caption}</p>
            </div>
          )}

          <div className="sp-gallery-wrap">
            <button className="sp-gallery-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Pilih dari galeri
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGalleryPick} />
          </div>

          {(detectionResult || lastAiMsg || error) && (
            <div className="sp-result-panel">
              {error && <div className="sp-error">{error.msg || error}</div>}
              {detectionResult && <ScanResultCard result={detectionResult} />}
              {lastUserMsg && (
                <div className="sp-transcript">
                  <span className="sp-chip-label">Kamu</span>
                  <p>{lastUserMsg.text}</p>
                </div>
              )}
              {lastAiMsg && (
                <div className="sp-ai-bubble">
                  <span className="sp-chip-label sp-chip-ai">UPTERRA AI</span>
                  <p>{lastAiMsg.text}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Voice mode ── */}
      {mode === 'voice' && (
        <div className="sp-voice-root">
          <div className="sp-top-bar sp-top-bar--light">
            <ScanModeToggle mode={mode} onChange={setMode} />
          </div>

          <div className="sp-voice-body">
            <p className="sp-voice-hint">
              {isAISpeaking
                ? 'AI sedang berbicara...'
                : sessionActive
                ? 'Sedang mendengarkan...'
                : isConnecting
                ? 'Menghubungkan AI...'
                : 'Ceritakan barang atau sampah yang mau diidentifikasi'}
            </p>

            <div className="sp-mic-wrap">
              {(sessionActive || isAISpeaking) && (
                <>
                  <div className="sp-wave sp-wave-1" />
                  <div className="sp-wave sp-wave-2" />
                  <div className="sp-wave sp-wave-3" />
                </>
              )}
              <div className={`sp-mic-btn ${
                isAISpeaking   ? 'sp-mic-btn--speaking' :
                sessionActive  ? 'sp-mic-btn--active'   :
                isConnecting   ? 'sp-mic-btn--loading'  : ''
              }`}>
                {isConnecting ? (
                  <svg className="sp-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : isAISpeaking ? (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
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

            {caption && <p className="sp-voice-caption">{caption}</p>}

            <p className="sp-voice-tap-hint">
              {isAISpeaking ? 'AI sedang menjawab' : sessionActive ? 'Bicara sekarang...' : 'Ketuk dimana saja untuk mulai'}
            </p>

            {voiceError && <div className="sp-voice-error">{voiceError}</div>}

            {messages.length > 0 && (
              <div className="sp-voice-chat">
                {messages.slice(-6).map((m, i) => (
                  <div key={i} className={`sp-bubble sp-bubble--${m.role === 'ai' ? 'ai' : 'user'}`}>
                    <span className={`sp-chip-label ${m.role === 'ai' ? 'sp-chip-ai' : ''}`}>
                      {m.role === 'ai' ? 'UPTERRA AI' : 'Kamu'}
                    </span>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
