/**
 * ScanFrame — Corner bracket overlay untuk area scan
 * Mirip dengan desain mockup: 4 sudut bracket putih di atas camera feed
 */
import '../styles/scan.css';

export default function ScanFrame({ active }) {
  return (
    <div className={`scan-frame ${active ? 'scanning' : ''}`}>
      {/* 4 corner brackets */}
      <span className="sf-corner sf-tl" />
      <span className="sf-corner sf-tr" />
      <span className="sf-corner sf-bl" />
      <span className="sf-corner sf-br" />

      {/* Scanning line animation */}
      {active && <div className="sf-scan-line" />}
    </div>
  );
}
