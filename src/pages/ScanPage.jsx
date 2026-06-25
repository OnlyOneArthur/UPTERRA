import { useRef, useState, useEffect, useCallback } from 'react';
import ScanFrame from '../components/ScanFrame';
import ScanModeToggle from '../components/ScanModeToggle';
import ScanResultCard from '../components/ScanResultCard';
import BottomNav from '../components/layout/BottomNav';
import { useScanAI } from '../hooks/useScanAI';
import '../styles/scan.css';

// ---- Error toast ----
function ErrorToast({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="sp-error-toast" role="alert">
      <svg className="sp-error-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div className="sp-error-toast-body">
        <p className="sp-error-toast-title">{error.title}</p>
        <p className="sp-error-toast-msg">{error.msg}</p>
      </div>
      <button className="sp-error-toast-dismiss" onClick={onDismiss} aria-label="Tutup">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ---- Text input fallback ----
function TextInput({ onSend, disabled }) {
  const [val, setVal] = useState('');
  const submit = () => { if (val.trim()) { onSend(val.trim()); setVal(''); } };
  return (
    <>
      <input
        className="sp-text-input"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
        placeholder="Ketik pertanyaan..."
        disabled={disabled}
      />
      <button className="sp-text-send" onClick={submit} disabled={disabled || !val.trim()}>Kirim</button>
    </>
  );
}

export default function ScanPage() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const [mode, setMode] = useState('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [dismissedError, setDismissedError] = useState(false);
  const cameraStreamRef = useRef(null);

  const {
    sessionActive, isConnecting, isAIProcessing, isAISpeaking, isSpeaking,
    messages, caption, detectionResult,
    startSession, stopSession, sendVideoFrame, sendTextMessage,
    error, voiceError,
  } = useScanAI();

  useEffect(() => { setDismissedError(false); }, [error]);

  // Kamera
  useEffect(() => {
    if (mode !== 'camera') {
      setCameraActive(false); setCameraError(null);
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null; return;
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
        setCameraError(err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' ? 'denied' : 'unavailable');
      });
    return () => { cameraStreamRef.current?.getTracks().forEach((t) => t.stop()); cameraStreamRef.current = null; };
  }, [mode]);

  // Sesi AI
  useEffect(() => {
    startSession(mode);
    return () => stopSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Kirim frame tiap 4 detik
  useEffect(() => {
    if (mode !== 'camera' || !cameraActive || !videoRef.current) return;
    const canvas = document.createElement('canvas');
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      sendVideoFrame(canvas.toDataURL('image/jpeg', 0.65).split(',')[1]);
    }, 4000);
    return () => clearInterval(interval);
  }, [mode, cameraActive, sendVideoFrame]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleGalleryPick = useCallback((e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => sendVideoFrame(ev.target.result.split(',')[1]);
    reader.readAsDataURL(file); e.target.value = '';
  }, [sendVideoFrame]);

  const handleModeChange = useCallback((newMode) => { stopSession(); setMode(newMode); }, [stopSession]);

  const handleMicTap = useCallback(() => {
    if (isConnecting || isAIProcessing) return;
    if (sessionActive) stopSession(); else startSession('voice');
  }, [isConnecting, isAIProcessing, sessionActive, stopSession, startSession]);

  const visibleError = !dismissedError && error ? error : null;

  return (
    <div className="sp-root">

      {/* ====== MODE KAMERA ====== */}
      {mode === 'camera' && (
        <div className="sp-cam-root">
          {/* Video full-screen */}
          <video
            ref={videoRef}
            autoPlay playsInline muted
            className="sp-video"
            style={{ display: cameraActive ? 'block' : 'none' }}
          />

          {/* Placeholder kamera */}
          {!cameraActive && (
            <div className="sp-no-cam">
              {cameraError === 'denied' ? (
                <>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <p>Izin kamera diperlukan</p>
                  <p className="sp-no-cam-sub">Aktifkan kamera di pengaturan browser, lalu muat ulang.</p>
                </>
              ) : cameraError === 'unavailable' ? (
                <>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <p>Kamera tidak terdeteksi</p>
                </>
              ) : (
                <div className="sp-cam-loading">
                  <span className="sp-cam-spinner" />
                  <p>Membuka kamera...</p>
                </div>
              )}
            </div>
          )}

          {/* Scan frame corners */}
          <ScanFrame active={sessionActive} />

          {/* Top pill: mode toggle */}
          <div className="sp-top-bar">
            <ScanModeToggle mode={mode} onChange={handleModeChange} />
          </div>

          {/* Error toast */}
          <ErrorToast error={visibleError} onDismiss={() => setDismissedError(true)} />

          {/* Caption AI — muncul di tengah bawah */}
          {caption && (
            <div className="sp-caption-overlay">
              <div className="sp-caption-inner">
                <span className="sp-caption-label">UPTERRA AI</span>
                <p className="sp-caption-text">{caption}</p>
              </div>
            </div>
          )}

          {/* Bottom action bar */}
          <div className="sp-cam-bottom">
            {/* Tombol Galeri kiri */}
            <button className="sp-gallery-btn" onClick={() => fileInputRef.current?.click()} aria-label="Pilih dari galeri">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Pilih dari galeri</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
                <path d="M5 20h14"/>
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGalleryPick} />

            {/* Tombol shutter / stop di tengah */}
            <button
              className={`sp-shutter-btn ${sessionActive ? 'sp-shutter-btn--stop' : ''}`}
              onClick={sessionActive ? stopSession : () => startSession('camera')}
              aria-label={sessionActive ? 'Hentikan' : 'Mulai scan'}
            >
              {sessionActive ? (
                <span className="sp-shutter-stop-icon" />
              ) : (
                <span className="sp-shutter-ring" />
              )}
            </button>

            {/* Placeholder kanan untuk balance */}
            <div className="sp-cam-bottom-spacer" />
          </div>

          {/* Result card */}
          {detectionResult && (
            <div className="sp-result-panel">
              <ScanResultCard result={detectionResult} />
            </div>
          )}
        </div>
      )}

      {/* ====== MODE SUARA ====== */}
      {mode === 'voice' && (
        <div className="sp-voice-root">
          {/* Top pill */}
          <div className="sp-top-bar--light">
            <ScanModeToggle mode={mode} onChange={handleModeChange} />
          </div>

          <div className="sp-voice-body">
            {/* Hint awal */}
            {!sessionActive && !isConnecting && messages.length === 0 && (
              <p className="sp-voice-hint">
                Ceritakan barang atau sampah yang mau diidentifikasi
              </p>
            )}

            {/* Mic button */}
            <button
              className={[
                'sp-mic-btn',
                isSpeaking ? 'sp-mic-btn--speaking' : '',
                isAISpeaking ? 'sp-mic-btn--ai-speaking' : '',
                (isConnecting || isAIProcessing) ? 'sp-mic-btn--loading' : '',
                (sessionActive && !isSpeaking && !isAISpeaking && !isConnecting) ? 'sp-mic-btn--active' : '',
              ].filter(Boolean).join(' ')}
              onClick={handleMicTap}
              aria-label={sessionActive ? 'Hentikan' : 'Mulai'}
            >
              {[1, 2, 3].map((n) => (
                <span key={n} className={`sp-wave sp-wave-${n}${(isSpeaking || isAISpeaking) ? ' sp-wave--active' : ''}`} />
              ))}
              {(isConnecting || isAIProcessing) ? (
                <svg className="sp-spin sp-mic-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg className="sp-mic-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>

            {/* Tap hint */}
            <p className="sp-voice-tap-hint">
              {isConnecting ? 'Menghubungkan...'
                : isAIProcessing ? 'AI sedang berpikir...'
                : isAISpeaking ? 'AI menjawab...'
                : isSpeaking ? 'Mendengarkan...'
                : sessionActive ? 'Bicara sekarang'
                : 'Ketuk dimana saja untuk mulai'}
            </p>

            {/* Caption / transkrip AI */}
            {caption && (
              <div className="sp-voice-caption">
                <p className="sp-caption-text">{caption}</p>
              </div>
            )}

            {/* Voice error */}
            {voiceError && (
              <div className="sp-voice-error">
                <p>{voiceError}</p>
                <button className="sp-text-send" style={{ alignSelf: 'center' }}
                  onClick={() => { stopSession(); setTimeout(() => startSession('voice'), 200); }}>Coba Lagi</button>
              </div>
            )}

            {/* Chat bubbles */}
            <div className="sp-voice-chat">
              {messages.map((m, i) => (
                <div key={i} className={`sp-bubble sp-bubble--${m.role === 'user' ? 'user' : 'ai'}`}>
                  <span className={`sp-chip-label${m.role === 'ai' ? ' sp-chip-ai' : ''}`}>
                    {m.role === 'user' ? 'Kamu' : 'UPTERRA AI'}
                  </span>
                  <p>{m.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Text fallback */}
            <div className="sp-text-fallback sp-text-always">
              <TextInput onSend={sendTextMessage} disabled={isAIProcessing || isAISpeaking} />
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
