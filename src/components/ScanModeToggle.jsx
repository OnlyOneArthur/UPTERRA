/**
 * ScanModeToggle — Toggle pill Kamera | Suara
 * Sesuai mockup: pill transparan dengan titik hijau + ikon mikrofon
 */
import '../styles/scan.css';

export default function ScanModeToggle({ mode, onChange }) {
  return (
    <div className="smt-root">
      <button
        className={`smt-option ${mode === 'camera' ? 'active' : ''}`}
        onClick={() => onChange('camera')}
      >
        <span className={`smt-dot ${mode === 'camera' ? 'on' : ''}`} />
        Kamera
      </button>
      <button
        className={`smt-option ${mode === 'voice' ? 'active' : ''}`}
        onClick={() => onChange('voice')}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        Suara
      </button>
    </div>
  );
}
