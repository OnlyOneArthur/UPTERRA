import { useRef, useState, useEffect, useCallback } from 'react';
import ScanFrame from '../components/ScanFrame';
import ScanResultCard from '../components/ScanResultCard';
import BottomNav from '../components/layout/BottomNav';
import { useGeminiLive } from '../hooks/useGeminiLive';
import '../styles/scan.css';

function getSupportedMimeType() {
  const candidates = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

export default function ScanPage() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [sessionRecordingUrl, setSessionRecordingUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const {
    status,
    isLive,
    isConnecting,
    isAISpeaking,
    messages,
    caption,
    detectionResult,
    error,
    startSession,
    stopSession,
    sendVideoFrame,
    sendTextMessage,
    transcript,
    downloadTranscript,
  } = useGeminiLive();

  const sessionActive = isLive;

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

  useEffect(() => {
    if (!audioUnlocked) return;
    startSession();
    return () => stopSession();
  }, [audioUnlocked]);

  const attachStream = useCallback((stream) => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    const tryPlay = () => {
      video.play().catch(() => {});
    };
    if (video.readyState >= 1) {
      tryPlay();
    } else {
      video.onloadedmetadata = tryPlay;
    }
  }, []);

  useEffect(() => {
    let localStream = null;

    const initMediaRecorder = (stream) => {
      const mimeType = getSupportedMimeType();
      try {
        const options = mimeType ? { mimeType } : {};
        const recorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = recorder;
        recordedChunksRef.current = [];

        recorder.ondataavailable = (evt) => {
          if (evt.data && evt.data.size > 0) {
            recordedChunksRef.current.push(evt.data);
          }
        };

        recorder.onstop = () => {
          if (!recordedChunksRef.current.length) return;
          const blob = new Blob(recordedChunksRef.current, {
            type: mimeType || 'video/webm',
          });
          setSessionRecordingUrl(URL.createObjectURL(blob));
        };

        console.info('[ScanPage] MediaRecorder ready, mimeType:', recorder.mimeType);
      } catch (err) {
        console.warn('[ScanPage] MediaRecorder init failed — recording disabled', err);
        mediaRecorderRef.current = null;
      }
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((s) => {
        localStream = s;
        setCameraActive(true);
        attachStream(s);
        initMediaRecorder(s);
      })
      .catch(() => setCameraActive(false));

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [attachStream]);

  useEffect(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (sessionActive && recorder.state === 'inactive') {
      recordedChunksRef.current = [];
      try {
        recorder.start();
      } catch (err) {
        console.warn('[ScanPage] recorder.start failed', err);
      }
    } else if (!sessionActive && recorder.state === 'recording') {
      try {
        recorder.stop();
      } catch (err) {
        console.warn('[ScanPage] recorder.stop failed', err);
      }
    }
  }, [sessionActive]);

  useEffect(() => {
    if (!sessionActive || !videoRef.current) return;
    const canvas = document.createElement('canvas');
    const iv = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      sendVideoFrame(canvas.toDataURL('image/jpeg', 0.65).split(',')[1]);
    }, 2500);
    return () => clearInterval(iv);
  }, [sessionActive, sendVideoFrame]);

  const handleGalleryPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => sendVideoFrame(ev.target.result.split(',')[1]);
    reader.readAsDataURL(file);
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendTextMessage(textInput.trim());
    setTextInput('');
  };

  const lastAiMsg = [...messages].reverse().find((m) => m.role === 'ai');
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');

  const statusLabel =
    status === 'connecting' ? 'Menghubungkan...' :
    isAISpeaking            ? 'AI Bicara...'     :
    isLive                  ? 'AI Aktif'          :
    status === 'error'      ? 'Error'             : 'Memulai...';

  const statusDot =
    status === 'connecting' ? 'connecting' :
    isAISpeaking            ? 'speaking'   :
    isLive                  ? 'live'        : 'idle';

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-poppins" onClick={unlockAudio}>
      <div className="mx-auto max-w-md relative" style={{ minHeight: '100dvh' }}>
        <div className="sp-root">

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
                <p className="sp-unlock-desc">Ketuk untuk mengaktifkan kamera & Gemini Live</p>
                <button className="sp-unlock-btn">Mulai Scan</button>
              </div>
            </div>
          )}

          <div className="sp-cam-root">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="sp-video"
              />
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

            {audioUnlocked && (
              <div className="sp-status-badge">
                <span className={`sp-status-dot ${statusDot}`} />
                {statusLabel}
              </div>
            )}

            {caption && (
              <div className="sp-caption-overlay">
                <p>{caption}</p>
              </div>
            )}

            <div className="sp-gallery-wrap">
              <button
                className="sp-gallery-btn"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
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

            <form className="sp-text-input-wrap" onSubmit={handleSendText} onClick={(e) => e.stopPropagation()}>
              <input
                className="sp-text-input"
                type="text"
                placeholder="Tanya UPTERRA AI..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={!isLive}
              />
              <button className="sp-text-send" type="submit" disabled={!isLive || !textInput.trim()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>

            {(detectionResult || lastAiMsg || error || sessionRecordingUrl) && (
              <div className="sp-result-panel">
                {error && <div className="sp-error">{typeof error === 'string' ? error : error.msg || 'Terjadi kesalahan.'}</div>}
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

                {transcript.length > 0 && (
                  <button
                    className="sp-download-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTranscript();
                    }}
                  >
                    Download transcript sesi
                  </button>
                )}

                {sessionRecordingUrl && (
                  <a
                    className="sp-download-btn"
                    href={sessionRecordingUrl}
                    download="upterra-gemini-session.webm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download rekaman sesi
                  </a>
                )}
              </div>
            )}
          </div>

          <BottomNav />
        </div>
      </div>
    </div>
  );
}
