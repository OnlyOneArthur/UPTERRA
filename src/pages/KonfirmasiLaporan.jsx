import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ChevronRight } from "lucide-react";

export default function KonfirmasiLaporan() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const detail = state ?? {
    id: "#UPTERRA-20260528-0047",
    lokasi: "Jl. Gatot Subroto ...",
    kategori: "Anorganik",
    volume: "Kecil, < 100 kg",
    durasi: "3 - 7 hari",
    status: "Perhatian : Perlu tindak lanjut",
    statusColor: "#c97c1a",
  };

  const rows = [
    { label: "Lokasi", value: detail.lokasi },
    { label: "Kategori", value: detail.kategori },
    { label: "Volume Perkiraan", value: detail.volume },
    { label: "Durasi Perkiraan", value: detail.durasi },
    { label: "Waktu", value: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) + " - " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) },
    { label: "Status", value: detail.status, color: detail.statusColor },
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md pb-10">

        {/* Top Bar */}
        <header className="flex items-center justify-between bg-white px-5 pt-6 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <h1 className="text-[15px] font-bold text-[#2d2d2d]">Konfirmasi Laporan Berhasil</h1>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf6ee]">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M8 6L3 12L8 18" stroke="#3da85e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 6L21 12L16 18" stroke="#3da85e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>

        <div className="px-5 pt-6">

          {/* Success Card */}
          <div className="flex flex-col items-center rounded-[24px] bg-white px-6 py-8 shadow-[0_4px_18px_rgba(0,0,0,0.06)] mb-5">
            {/* Check Icon */}
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#eaf6ee] bg-[#eaf6ee]">
              <CheckCircle size={44} className="text-[#3da85e]" strokeWidth={1.5} />
            </div>

            <p className="text-[11px] font-medium text-[#aaa] mb-1">Laporan Terkirim</p>
            <h2 className="text-[17px] font-bold text-[#3da85e] mb-3 text-center">
              Laporan berhasil dikirim!
            </h2>
            <p className="text-center text-[12px] text-[#888] max-w-[240px] leading-relaxed mb-5">
              Terima kasih sudah berkontribusi menjaga lingkungan sekitar tetap bersih bersama UPTERRA.
            </p>

            {/* ID Laporan */}
            <div className="rounded-full border border-[#e0e0e0] bg-[#fafafa] px-5 py-2">
              <span className="text-[12px] font-medium text-[#555]">ID Laporan : <span className="font-bold text-[#2d2d2d]">{detail.id}</span></span>
            </div>
          </div>

          {/* Detail Table */}
          <div className="rounded-[20px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden mb-5">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#f0f0f0]">
              <ChevronRight size={15} className="text-[#3da85e]" />
              <span className="text-[12px] font-bold text-[#2d2d2d]">Detail Laporan</span>
            </div>
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-start justify-between gap-4 px-5 py-3 ${ i !== rows.length - 1 ? "border-b border-[#f9f9f9]" : "" }`}
              >
                <span className="text-[12px] text-[#aaa] flex-shrink-0">{row.label}</span>
                <span
                  className="text-[12px] font-medium text-right max-w-[55%]"
                  style={{ color: row.color ?? "#2d2d2d" }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <button
            onClick={() => navigate("/lapor-sampah")}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3da85e] py-4 text-[14px] font-bold text-white shadow-[0_6px_18px_rgba(61,168,94,0.3)] active:bg-[#2d8f50] mb-3 transition-colors"
          >
            Lapor tumpukan lain
          </button>
          <button
            onClick={() => navigate("/home")}
            className="w-full rounded-full border-2 border-[#e0e0e0] bg-white py-3.5 text-[13px] font-semibold text-[#555] active:bg-[#f5f5f5] transition-colors"
          >
            Kembali ke beranda
          </button>
        </div>
      </div>
    </div>
  );
}
