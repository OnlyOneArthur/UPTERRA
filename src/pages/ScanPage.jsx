import { useRef, useState, useEffect, useCallback } from "react";
import ScanFrame from "../components/ScanFrame";
import ScanResultCard from "../components/ScanResultCard";
import BottomNav from "../components/layout/BottomNav";
import { useGeminiLive } from "../hooks/useGeminiLive";
import "../styles/scan.css";

function getSupportedVideoMimeType() {
  const candidates = [
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

function getSupportedAudioMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm"];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export default function ScanPage() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const resultPanelRef = useRef(null);
  const [mode, setMode] = useState("video"); // 'video' | 'voice'
  const [cameraActive, setCameraActive] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [sessionRecordingUrl, setSessionRecordingUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const cameraStreamRef = useRef(null);
  const micOnlyStreamRef = useRef(null);
  const recordingStartedRef = useRef(false);

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
      const warm = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(warm);
      window.speechSynthesis.cancel();
    }
    setAudioUnlocked(true);

    const video = videoRef.current;
    if (video && video.srcObject) {
      video.play().catch(() => {
        setTimeout(() => video.play().catch(() => {}), 50);
      });
    }
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
    video.muted = true;
    video.playsInline = true;

    video.play().catch(() => {});
    setTimeout(() => video.play().catch(() => {}), 120);
    setTimeout(() => video.play().catch(() => {}), 350);
  }, []);

  // Camera hardware is only ever acquired while mode === 'video'. Switching
  // to voice mode tears the track down completely (camera light turns off),
  // rather than just hiding the <video> element. Switching back re-acquires.
  useEffect(() => {
    if (mode !== "video") {
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    let cancelled = false;
    let stream = null;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        cameraStreamRef.current = s;
        setCameraActive(true);
        attachStream(s);
      })
      .catch((err) => {
        console.error(
          "[ScanPage] getUserMedia failed:",
          err?.name,
          err?.message,
        );
        setCameraActive(false);
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
      setCameraActive(false);
    };
  }, [mode, attachStream]);

  const startRecorderFor = useCallback((stream, sourceType) => {
    const mimeType =
      sourceType === "video"
        ? getSupportedVideoMimeType()
        : getSupportedAudioMimeType();
    try {
      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      recorder.__source = sourceType;

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          recordedChunksRef.current.push(evt.data);
        }
      };

      recorder.onstop = () => {
        if (!recordedChunksRef.current.length) return;
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        setSessionRecordingUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      console.info(
        "[ScanPage] recording from",
        sourceType,
        "mimeType:",
        recorder.mimeType,
      );
    } catch (err) {
      console.warn(
        "[ScanPage] MediaRecorder init failed — recording disabled",
        err,
      );
      mediaRecorderRef.current = null;
    }
  }, []);

  // Keeps one continuous recording running across mode switches: records the
  // camera feed in video mode, and seamlessly swaps to a mic-only track when
  // the user flips to voice-only, so a session's download isn't lost/split
  // just because the camera got turned off partway through.
  useEffect(() => {
    if (!sessionActive) {
      if (mediaRecorderRef.current?.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      mediaRecorderRef.current = null;
      micOnlyStreamRef.current?.getTracks().forEach((t) => t.stop());
      micOnlyStreamRef.current = null;
      recordingStartedRef.current = false;
      return;
    }

    const desiredSource = mode === "video" ? "video" : "audio";
    const current = mediaRecorderRef.current;

    if (
      current &&
      current.__source === desiredSource &&
      current.state === "recording"
    ) {
      return; // already recording from the right source
    }

    if (mode === "video" && (!cameraActive || !cameraStreamRef.current)) {
      return; // wait for the camera stream to come back online
    }

    if (current?.state === "recording") {
      try {
        current.stop();
      } catch {}
    }

    if (!recordingStartedRef.current) {
      recordedChunksRef.current = [];
      recordingStartedRef.current = true;
    }

    if (mode === "video") {
      micOnlyStreamRef.current?.getTracks().forEach((t) => t.stop());
      micOnlyStreamRef.current = null;
      startRecorderFor(cameraStreamRef.current, "video");
    } else {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((micStream) => {
          micOnlyStreamRef.current = micStream;
          startRecorderFor(micStream, "audio");
        })
        .catch((err) =>
          console.warn("[ScanPage] mic-only recording unavailable:", err?.name),
        );
    }
  }, [sessionActive, mode, cameraActive, startRecorderFor]);

  useEffect(() => {
    if (!sessionActive || mode !== "video" || !videoRef.current) return;
    const canvas = document.createElement("canvas");
    const iv = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      sendVideoFrame(canvas.toDataURL("image/jpeg", 0.65).split(",")[1]);
    }, 2500);
    return () => clearInterval(iv);
  }, [sessionActive, mode, sendVideoFrame]);

  const handleGalleryPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => sendVideoFrame(ev.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendTextMessage(textInput.trim());
    setTextInput("");
  };

  const lastAiMsg = [...messages].reverse().find((m) => m.role === "ai");
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");

  // Keep the panel height capped and auto-scroll to the newest line
  // instead of letting it grow taller (and creep upward over the camera
  // view) every time a message has more words.
  useEffect(() => {
    const el = resultPanelRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lastAiMsg?.text, lastUserMsg?.text, detectionResult, error]);

  const statusLabel =
    status === "connecting"
      ? "Menghubungkan..."
      : isAISpeaking
        ? "AI Bicara..."
        : isLive
          ? "AI Aktif"
          : status === "error"
            ? "Error"
            : "Memulai...";

  const statusDot =
    status === "connecting"
      ? "connecting"
      : isAISpeaking
        ? "speaking"
        : isLive
          ? "live"
          : "idle";

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] font-poppins"
      onClick={unlockAudio}
    >
      <div
        className="mx-auto max-w-md relative"
        style={{ minHeight: "100dvh" }}
      >
        <div className="sp-root">
          {!audioUnlocked && (
            <div className="sp-unlock-overlay">
              <div className="sp-unlock-card">
                <div className="sp-unlock-icon">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </div>
                <h2 className="sp-unlock-title">UPTERRA AI</h2>
                <p className="sp-unlock-desc">
                  Ketuk untuk mengaktifkan kamera & Gemini Live
                </p>
                <button className="sp-unlock-btn">Mulai Scan</button>
              </div>
            </div>
          )}

          <div className="sp-cam-root">
            {/* video stays mounted at all times, in both modes, so
                videoRef.current is never null when getUserMedia resolves —
                see attachStream(). In voice mode it's simply covered by the
                sp-voice-mode overlay below, and its srcObject is cleared. */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="sp-video"
            />

            <div
              className="sp-mode-switch"
              role="tablist"
              aria-label="Mode percakapan"
            >
              <span
                className={`sp-mode-thumb ${mode === "voice" ? "sp-mode-thumb--right" : ""}`}
                aria-hidden="true"
              />
              <button
                type="button"
                role="tab"
                aria-selected={mode === "video"}
                className={`sp-mode-opt ${mode === "video" ? "sp-mode-opt--active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMode("video");
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Video
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "voice"}
                className={`sp-mode-opt ${mode === "voice" ? "sp-mode-opt--active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setMode("voice");
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </svg>
                Suara
              </button>
            </div>

            {mode === "video" && !cameraActive && (
              <div className="sp-no-cam">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <p>Izin kamera diperlukan</p>
              </div>
            )}

            {mode === "voice" && (
              <div className="sp-voice-mode">
                <div className="sp-mic-wrap">
                  {isLive && !isAISpeaking && !isConnecting && (
                    <>
                      <span className="sp-wave sp-wave-1" />
                      <span className="sp-wave sp-wave-2" />
                      <span className="sp-wave sp-wave-3" />
                    </>
                  )}
                  <div
                    className={`sp-mic-btn ${
                      isConnecting
                        ? "sp-mic-btn--loading"
                        : isAISpeaking
                          ? "sp-mic-btn--speaking"
                          : isLive
                            ? "sp-mic-btn--active"
                            : ""
                    }`}
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </div>
                </div>
                <p className="sp-voice-hint">
                  {isConnecting
                    ? "Menghubungkan..."
                    : isAISpeaking
                      ? "UPTERRA AI sedang bicara..."
                      : isLive
                        ? "Mendengarkan..."
                        : "Memulai..."}
                </p>
              </div>
            )}

            {mode === "video" && <ScanFrame active={sessionActive} />}

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
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Pilih dari galeri
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleGalleryPick}
              />
            </div>

            <form
              className="sp-text-input-wrap"
              onSubmit={handleSendText}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                className="sp-text-input"
                type="text"
                placeholder="Tanya UPTERRA AI..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={!isLive}
              />
              <button
                className="sp-text-send"
                type="submit"
                disabled={!isLive || !textInput.trim()}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            {(detectionResult || lastAiMsg || error || sessionRecordingUrl) && (
              <div className="sp-result-panel" ref={resultPanelRef}>
                {error && (
                  <div className="sp-error">
                    {typeof error === "string"
                      ? error
                      : error.msg || "Terjadi kesalahan."}
                  </div>
                )}
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
