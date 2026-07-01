import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";

const DUMMY_LAPORAN = [
  {
    id: "#UPTERRA-20260528-0047",
    lokasi: "Jl. Gatot Subroto, Dauh Puri ...",
    waktu: "28 Mei 2026 - 09.41",
    status: "Dikirim",
    foto: "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782387765/lapor_1_nowh4i.png",
  },
  {
    id: "#UPTERRA-20260528-0047",
    lokasi: "Jl. Gatot Subroto, Dauh Puri ...",
    waktu: "28 Mei 2026 - 09.41",
    status: "Dibatalkan",
    foto: "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782387765/lapor_2_t4ro5f.png",
  },
  {
    id: "#UPTERRA-20260425-0030",
    lokasi: "Jl. Dewi Sri, Astina Selatan ...",
    waktu: "25 April 2026 - 09.41",
    status: "Selesai",
    foto: "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782387766/lapor_3_ezxrvn.png",
  },
  {
    id: "#UPTERRA-20260402-XXXX",
    lokasi: "Jl. X, Y, Z ...",
    waktu: "02 April 2026 - 09.41",
    status: "Selesai",
    foto: "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782387766/lapor_4_npgl6r.png",
  },
];

const STATUS_FILTERS = ["Semua", "Dikirim", "Diproses", "Selesai"];

const STATUS_CONFIG = {
  Dikirim: { bg: "#dbeafe", text: "#1d64d8", dot: "#1d64d8" },
  Diproses: { bg: "#fef9c3", text: "#a16207", dot: "#a16207" },
  Selesai: { bg: "#dcfce7", text: "#15803d", dot: "#15803d" },
  Dibatalkan: { bg: "#fee2e2", text: "#dc2626", dot: "#dc2626" },
};

export default function LaporanSaya() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");

  const summary = {
    total: DUMMY_LAPORAN.length + 3,
    Dikirim: DUMMY_LAPORAN.filter((l) => l.status === "Dikirim").length,
    Diproses: 0,
    Selesai: DUMMY_LAPORAN.filter((l) => l.status === "Selesai").length,
    Dibatalkan: DUMMY_LAPORAN.filter((l) => l.status === "Dibatalkan").length,
  };

  const filtered = DUMMY_LAPORAN.filter((l) => {
    const matchFilter = activeFilter === "Semua" || l.status === activeFilter;
    const matchSearch =
      l.lokasi.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md pb-10">
        {/* Header */}
        <header className="flex items-center gap-3 bg-white px-5 pt-6 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0]"
          >
            <ChevronLeft size={18} className="text-[#2d2d2d]" />
          </button>
          <h1 className="text-[15px] font-bold text-[#2d2d2d]">Laporan Saya</h1>
        </header>

        <div className="px-5 pt-5">
          {/* Search Bar */}
          <div className="flex items-center gap-2 rounded-full bg-white border border-[#e8e8e8] px-4 py-2.5 mb-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <Search size={15} className="text-[#bbb] flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari laporan sampah yang pernah saya kirim"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[12px] text-[#555] placeholder-[#bbb] outline-none"
            />
          </div>

          {/* Summary Card */}
          <div className="rounded-[20px] bg-white shadow-[0_4px_14px_rgba(61,168,94,0.12)] border border-[#e8f5ee] mb-4 p-4">
            {/* Total */}
            <div className="mb-3">
              <p className="text-[11px] text-[#aaa] font-medium mb-0.5">
                Total Laporan
              </p>
              <p className="text-[26px] font-extrabold text-[#2d2d2d] leading-none">
                {summary.total}{" "}
                <span className="text-[14px] font-bold text-[#2d2d2d]">
                  Laporan
                </span>
              </p>
              <p className="text-[11px] text-[#aaa] mt-0.5">
                telah berhasil kamu lapor
              </p>
            </div>

            {/* Status Pills */}
            <div className="grid grid-cols-4 gap-2">
              {[
                {
                  label: "Terkirim",
                  count: summary.Dikirim,
                  color: "#1d64d8",
                },
                {
                  label: "Diproses",
                  count: summary.Diproses,
                  color: "#a16207",
                },
                {
                  label: "Selesai",
                  count: summary.Selesai,
                  color: "#15803d",
                },
                {
                  label: "Dibatalkan",
                  count: summary.Dibatalkan,
                  color: "#dc2626",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center rounded-[14px] bg-[#f8f8f8] py-2.5 px-1"
                >
                  <span className="text-[16px] mb-1">{item.emoji}</span>
                  <span
                    className="text-[15px] font-extrabold"
                    style={{ color: item.color }}
                  >
                    {item.count}
                  </span>
                  <span className="text-[9px] text-[#aaa] font-medium mt-0.5 text-center leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                  activeFilter === f
                    ? "bg-[#2d2d2d] text-white"
                    : "bg-white text-[#555] border border-[#e0e0e0]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Report List */}
          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-[#aaa] text-[13px]">
                Tidak ada laporan ditemukan.
              </div>
            ) : (
              filtered.map((laporan, i) => {
                const cfg =
                  STATUS_CONFIG[laporan.status] ?? STATUS_CONFIG["Dikirim"];
                return (
                  <div
                    key={i}
                    onClick={() =>
                      navigate("/detail-laporan", { state: laporan })
                    }
                    className="flex gap-3 rounded-[18px] bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer active:bg-[#fafafa] transition-colors"
                  >
                    {/* Foto placeholder */}
                    <div className="flex-shrink-0 h-[68px] w-[68px] rounded-[12px] bg-[#e8f5ee] flex items-center justify-center overflow-hidden">
                      {laporan.foto ? (
                        <img
                          src={laporan.foto}
                          alt="laporan"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[28px]">🗑️</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <p className="text-[13px] font-bold text-[#2d2d2d] truncate">
                          {laporan.lokasi}
                        </p>
                        <p className="text-[11px] text-[#aaa] mt-0.5">
                          {laporan.waktu}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] text-[#bbb] truncate max-w-[60%]">
                          ID Laporan : {laporan.id}
                        </p>
                        {/* Status Badge */}
                        <span
                          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                          style={{ backgroundColor: cfg.bg, color: cfg.text }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: cfg.dot }}
                          />
                          {laporan.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
