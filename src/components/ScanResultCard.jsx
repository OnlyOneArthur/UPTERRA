/**
 * ScanResultCard — Kartu hasil deteksi AI
 * Menampilkan: nama komponen, kategori, status B3, kondisi, dan rekomendasi aksi
 */
import '../styles/scan.css';

const CATEGORY_COLOR = {
  Baterai: '#ef4444',
  PCB: '#f97316',
  Elektronik: '#3b82f6',
  Kabel: '#a855f7',
  Layar: '#06b6d4',
  Plastik: '#6b7280',
  Lainnya: '#9ca3af',
};

export default function ScanResultCard({ result }) {
  if (!result || !result.detected) return null;
  const accentColor = CATEGORY_COLOR[result.category] || '#22c55e';

  return (
    <div className="src-card" style={{ '--accent': accentColor }}>
      <div className="src-header">
        <div className="src-dot" style={{ background: accentColor }} />
        <span className="src-component">{result.component}</span>
        <span className="src-badge" style={{ background: accentColor + '22', color: accentColor }}>
          {result.category}
        </span>
      </div>

      <div className="src-row">
        <div className={`src-b3 ${result.is_b3 ? 'danger' : 'safe'}`}>
          {result.is_b3 ? '⚠️ Mengandung B3' : '✅ Aman'}
        </div>
        <div className="src-condition">{result.condition}</div>
      </div>

      <div className="src-action">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {result.action}
      </div>
    </div>
  );
}
