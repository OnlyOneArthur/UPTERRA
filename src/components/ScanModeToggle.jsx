/**
 * ScanModeToggle — Camera | Live (Gemini) | Voice toggle
 */
export default function ScanModeToggle({ mode, onChange }) {
  const modes = [
    { id: 'camera', label: 'Kamera' },
    { id: 'live',   label: 'Gemini Live' },
    { id: 'voice',  label: 'Suara' },
  ];

  return (
    <div className="smt-root">
      {modes.map((m) => (
        <button
          key={m.id}
          className={`smt-btn ${mode === m.id ? 'smt-btn--active' : ''}`}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
