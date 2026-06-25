import { useRef, useState, useEffect, useCallback } from 'react';
import ScanFrame from '../components/ScanFrame';
import ScanModeToggle from '../components/ScanModeToggle';
import ScanResultCard from '../components/ScanResultCard';
import BottomNav from '../components/layout/BottomNav';
import { useScanAI } from '../hooks/useScanAI';
import '../styles/scan.css';

export default function ScanPage() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const [mode, setMode] = useState('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const cameraStreamRef = useRef(null);

  const {
    sessionActive,
    isConnecting,
    isAIProcessing,
    isAISpeaking,
    isSpeaking,
    messages,
    caption,
    detectionResult,
    startSession,
    stopSession,
    sendVideoFrame,
    sendTextMessage,
    error,
    voiceError,
  } = useScanAI();

  // ---- Kamera stream ----
  useEffect(() => {
    if (mode !== 'camera') {
      setCameraActive(false);
      setCameraError(null);
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
      return;
    }
    setCameraError(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        cameraStreamRef.current = stream;
        setCameraActive(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        setCameraActive(false);
        setCameraError(
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'denied'
            : 'unavailable'
        );
      });
    return () => {
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    };
  }, [mode]);

  // ---- Sesi AI ----
  useEffect(() => {
    startSession(mode);
    return () => stopSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ---- Kirim frame ke AI tiap 4 detik ----
  useEffect(() => {
    if (mode !== 'camera' || !cameraActive || !videoRef.current) return;
    const canvas = document.createElement('canvas');
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      sendVideoFrame(canvas.toDataURL('image/jpeg', 0.65).split(',')[1]);
    }, 4000);
    return () => clearInterval(interval);
  }, [mode, cameraActive, sendVideoFrame]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGalleryPick = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => sendVideoFrame(ev.target.result.split(',')[1]);
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [sendVideoFrame]);

  const handleModeChange = useCallback((newMode) => {
    stopSession();
    setMode(newMode);
  }, [stopSession]);

  const handleMicTap = useCallback(() => {
    if (isConnecting || isAIProcessing) return;
    if (sessionActive) stopSession();
    else startSession('voice');
  }, [isConnecting, isAIProcessing, sessionActive, stopSession, startSession]);

  // ---- Helpers UI ----
  const statusLabel = isConnecting
    ? 'Menghubungkan...'
    : isAIProcessing
    ? 'AI memproses...'
    : sessionActive
    ? 'AI Aktif'
    : 'Offline';

  const statusClass = isConnecting || isAIProcessing
    ? 'connecting'
    : sessionActive
    ? 'live'
    : 'idle';

  return (
    <div className="sp-root">

      {/* ====== MODE KAMERA ====== */}
      {mode === 'camera' && (
        <div className="sp-cam-root">
          <video
            ref={videoRef}
            autoPlay playsInline muted
            className="sp-video"
            style={{ display: cameraActive ? 'block' : 'none' }}
          />

          {!cameraActive && (
            <div className="sp-no-cam">
              {cameraError === 'denied' ? (
                <><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <p>Izin kamera ditolak</p>
                <p style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Klik ikon gembok di address bar → aktifkan Kamera → muat ulang.</p></>
              ) : cameraError === 'unavailable' ? (
                <><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <p>Kamera tidak tersedia</p></>
              ) : (
                <><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <p>Membuka kamera...</p></>
              )}
            </div>
          )}

          <ScanFrame active={sessionActive} />

          <div className="sp-top-bar">
            <ScanModeToggle mode={mode} onChange={handleModeChange} />
          </div>

          <div className="sp-status-badge">
            <span className={`sp-status-dot ${statusClass}`} />
            {statusLabel}
          </div>

          {/* Caption overlay ala Gemini — muncul saat AI bicara */}
          {caption && (
            <div className="sp-caption-overlay">
              <div className="sp-caption-inner">
                <span className="sp-caption-label">UPTERRA AI</span>
                <p className="sp-caption-text">{caption}</p>
              </div>
            </div>
          )}

          {sessionActive && (
            <button className="sp-stop-btn" onClick={stopSession} aria-label="Hentikan sesi AI">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              Stop
            </button>
          )}

          <div className="sp-gallery-wrap">
            <button className="sp-gallery-btn" onClick={() => fileInputRef.current?.click()}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Pilih dari galeri
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGalleryPick} />
          </div>

          {error && <div className="sp-cam-error"><p>{error}</p></div>}

          {/* Conversation log mode kamera */}
          {(detectionResult || messages.length > 0) && (
            <div className="sp-result-panel">
              {detectionResult && <ScanResultCard result={detectionResult} />}
              <div className="sp-chat-log">
                {messages.map((m) => (
                  <div key={m.ts} className={`sp-bubble ${m.role === 'user' ? 'sp-bubble--user' : 'sp-bubble--ai'}`}>
                    <span className={`sp-chip-label ${m.role === 'ai' ? 'sp-chip-ai' : ''}`}>
                      {m.role === 'user' ? 'Kamu' : 'UPTERRA AI'}
                    </span>
                    <p>{m.text}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====== MODE SUARA ====== */}
      {mode === 'voice' && (
        <div className="sp-voice-root">
          <div className="sp-top-bar sp-top-bar--light">
            <ScanModeToggle mode={mode} onChange={handleModeChange} />
          </div>

          <div className="sp-voice-body">
            <p className="sp-voice-hint">
              {isAISpeaking
                ? 'AI sedang menjawab...'
                : isSpeaking
                ? 'Mendengarkan kamu...'
                : sessionActive
                ? 'Ceritakan barang atau sampah yang mau diidentifikasi'
                : isConnecting
                ? 'Menghubungkan ke AI...'
                : 'Ceritakan barang atau sampah yang mau diidentifikasi'}
            </p>

            {/* Tombol mic */}
            <button
              className={[
                'sp-mic-btn',
                sessionActive ? (isSpeaking ? 'sp-mic-btn--speaking' : isAISpeaking ? 'sp-mic-btn--ai-speaking' : 'sp-mic-btn--active') : '',
                isConnecting ? 'sp-mic-btn--loading' : '',
              ].join(' ')}
              onClick={handleMicTap}
              aria-label={sessionActive ? 'Hentikan sesi' : 'Mulai sesi AI'}
            >
              {(sessionActive || isAISpeaking) && (
                <>
                  <span className={`sp-wave sp-wave-1 ${isSpeaking || isAISpeaking ? 'sp-wave--active' : ''}`} />
                  <span className={`sp-wave sp-wave-2 ${isSpeaking || isAISpeaking ? 'sp-wave--active' : ''}`} />
                  <span className={`sp-wave sp-wave-3 ${isSpeaking || isAISpeaking ? 'sp-wave--active' : ''}`} />
                </>
              )}
              <span className="sp-mic-icon">
                {isConnecting ? (
                  <svg className="sp-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                )}
              </span>
            </button>

            {/* Caption ala Gemini video call — muncul di atas tombol */}
            {caption && (
              <div className="sp-voice-caption">
                <span className="sp-caption-label">UPTERRA AI</span>
                <p className="sp-caption-text">{caption}</p>
              </div>
            )}

            {isConnecting && <p className="sp-voice-tap-hint">Mohon tunggu...</p>}
            {isAIProcessing && !isAISpeaking && (
              <p className="sp-voice-tap-hint">AI sedang berpikir...</p>
            )}

            {voiceError && !isConnecting && (
              <div className="sp-voice-error">
                <p>{voiceError}</p>
                <form
                  className="sp-text-fallback"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = e.target.msg.value.trim();
                    if (val) { sendTextMessage(val); e.target.reset(); }
                  }}
                >
                  <input name="msg" placeholder="Atau ketik pesan ke AI..." className="sp-text-input" />
                  <button type="submit" className="sp-text-send">Kirim</button>
                </form>
              </div>
            )}

            {/* Conversation log mode suara */}
            {messages.length > 0 && (
              <div className="sp-voice-chat">
                {messages.map((m) => (
                  <div key={m.ts} className={`sp-bubble ${m.role === 'user' ? 'sp-bubble--user' : 'sp-bubble--ai'}`}>
                    <span className={`sp-chip-label ${m.role === 'ai' ? 'sp-chip-ai' : ''}`}>
                      {m.role === 'user' ? 'Kamu' : 'UPTERRA AI'}
                    </span>
                    <p>{m.text}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Input teks manual (selalu tampil di bawah) */}
            {sessionActive && !voiceError && (
              <form
                className="sp-text-fallback sp-text-always"
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = e.target.msg.value.trim();
                  if (val) { sendTextMessage(val); e.target.reset(); }
                }}
              >
                <input name="msg" placeholder="Atau ketik pesan ke AI..." className="sp-text-input" />
                <button type="submit" className="sp-text-send">Kirim</button>
              </form>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
