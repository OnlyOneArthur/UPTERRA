import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScanFrame from '../components/ScanFrame';
import ScanModeToggle from '../components/ScanModeToggle';
import ScanResultCard from '../components/ScanResultCard';
import { useScanAI } from '../hooks/useScanAI';
import '../styles/scan.css';

export default function ScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('camera'); // 'camera' | 'voice'
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
    sendAudioChunk,
    sendVideoFrame,
    error,
  } = useScanAI();

  // Start camera stream
  useEffect(() => {
    if (mode === 'camera') {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        .then((s) => {
          setStream(s);
          setCameraActive(true);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(() => setCameraActive(false));
    } else {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
        setCameraActive(false);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  // Send video frame every 2s when session active
  useEffect(() => {
    if (!sessionActive || mode !== 'camera' || !videoRef.current) return;
    const canvas = document.createElement('canvas');
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
      sendVideoFrame(base64);
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionActive, mode]);

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
    <div className="scan-root">
      {/* Camera / dark background */}
      <div className="scan-viewport">
        {mode === 'camera' && cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="scan-video"
          />
        ) : (
          <div className="scan-no-camera">
            {mode === 'voice' ? (
              <div className="scan-voice-visual">
                <div className={`scan-voice-ring ${sessionActive ? 'active' : ''}`}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </div>
                <p className="scan-voice-label">
                  {sessionActive ? 'Mendengarkan...' : 'Mode Suara Aktif'}
                </p>
              </div>
            ) : (
              <div className="scan-cam-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <p>Izin kamera diperlukan</p>
              </div>
            )}
          </div>
        )}

        {/* Scan frame bracket overlay */}
        {mode === 'camera' && <ScanFrame active={sessionActive} />}

        {/* Top mode toggle */}
        <div className="scan-top-bar">
          <ScanModeToggle mode={mode} onChange={setMode} />
        </div>

        {/* Session status badge */}
        {(sessionActive || isConnecting) && (
          <div className="scan-status-badge">
            <span className={`scan-status-dot ${isConnecting ? 'connecting' : 'live'}`} />
            {isConnecting ? 'Menghubungkan AI...' : 'AI Aktif'}
          </div>
        )}

        {/* Gallery pick button */}
        <div className="scan-bottom-overlay">
          <button
            className="scan-gallery-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            className="scan-file-input"
            onChange={handleGalleryPick}
          />
        </div>
      </div>

      {/* Result / Response panel */}
      {(detectionResult || aiResponse || error || transcript) && (
        <div className="scan-panel">
          {error && <div className="scan-error">{error}</div>}
          {detectionResult && <ScanResultCard result={detectionResult} />}
          {transcript && (
            <div className="scan-transcript">
              <span className="scan-label">Kamu:</span> {transcript}
            </div>
          )}
          {aiResponse && (
            <div className="scan-ai-response">
              <span className="scan-label">UPTERRA AI:</span>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>
      )}

      {/* Start / Stop session FAB */}
      <div className="scan-fab-wrap">
        <button
          className={`scan-fab ${sessionActive ? 'stop' : 'start'} ${isConnecting ? 'connecting' : ''}`}
          onClick={handleToggleSession}
          disabled={isConnecting}
          aria-label={sessionActive ? 'Hentikan sesi AI' : 'Mulai sesi AI'}
        >
          {isConnecting ? (
            <svg className="spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : sessionActive ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="scan-tabbar">
        {[
          { label: 'Beranda', icon: 'home', path: '/' },
          { label: 'Peta', icon: 'map', path: '/peta' },
          { label: 'Scan', icon: 'scan', path: '/scan' },
          { label: 'Pasar', icon: 'bag', path: '/pasar' },
          { label: 'Akun', icon: 'user', path: '/akun' },
        ].map((tab) => (
          <button
            key={tab.label}
            className={`scan-tab-item ${tab.path === '/scan' ? 'active' : ''}`}
            onClick={() => tab.path !== '/scan' && navigate(tab.path)}
            aria-label={tab.label}
          >
            <TabIcon name={tab.icon} active={tab.path === '/scan'} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function TabIcon({ name, active }) {
  const color = active ? '#22c55e' : '#9ca3af';
  const icons = {
    home: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    map: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/>
        <line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    scan: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : color} strokeWidth="2">
        <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
        <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
        <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
        <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
        <line x1="7" y1="12" x2="17" y2="12"/>
      </svg>
    ),
    bag: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    user: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  };
  return icons[name] || null;
}
