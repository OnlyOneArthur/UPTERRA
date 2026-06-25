import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  MapPin,
  X,
  AlertCircle,
  Send,
  ChevronRight,
  Info,
} from "lucide-react";

const KATEGORI = ["Organik", "Anorganik", "Elektronik", "Campuran"];
const VOLUME = [
  { label: "Kecil", sub: "<100 kg", value: "Kecil, < 100 kg" },
  { label: "Sedang", sub: "100-500 kg", value: "Sedang, 100-500 kg" },
  { label: "Besar", sub: ">100 kg", value: "Besar, >100 kg" },
];
const DURASI = ["< 1 hari", "1 - 3 hari", "3 - 7 hari", "> Seminggu"];

const STATUS_INFO = [
  {
    color: "#e03535",
    bg: "#fff0f0",
    dot: "#e03535",
    label: "Kritis : Perlu penanganan segera",
    detail: "durasi >6 HARI DAN volume besar",
  },
  {
    color: "#c97c1a",
    bg: "#fff8ed",
    dot: "#f5a623",
    label: "Perhatian : Perlu tindak lanjut",
    detail: "durasi 1–3 hari ATAU volume sedang",
  },
  {
    color: "#3da85e",
    bg: "#eef8f2",
    dot: "#3da85e",
    label: "Normal : Kondisi masih terkendali",
    detail: "<1 hari ATAU volume kecil",
  },
];

function computeStatus(volume, durasi) {
  if (!volume || !durasi) return null;
  const isBesar = volume === "Besar, >100 kg";
  const isSedang = volume === "Sedang, 100-500 kg";
  const isLong = durasi === "> Seminggu" || durasi === "3 - 7 hari";
  const isMed = durasi === "1 - 3 hari";
  if (isBesar && isLong) return "Kritis";
  if (isSedang || isMed || isBesar) return "Perhatian";
  return "Normal";
}

const STATUS_META = {
  Kritis: { color: "#e03535", bg: "#fff0f0", label: "Kritis : Perlu penanganan segera" },
  Perhatian: { color: "#c97c1a", bg: "#fff8ed", label: "Perhatian : Perlu tindak lanjut" },
  Normal: { color: "#3da85e", bg: "#eef8f2", label: "Normal : Kondisi masih terkendali" },
};

export default function LaporSampah() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [lokasi] = useState("Jl. Gatot Subroto, Dauh Puri Kaja ...");
  const [lokasiDetail] = useState("-8.65650, 115.21518");
  const [kategori, setKategori] = useState("");
  const [volume, setVolume] = useState("");
  const [durasi, setDurasi] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [showStatusInfo, setShowStatusInfo] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  const status = computeStatus(volume, durasi);
  const statusMeta = status ? STATUS_META[status] : null;

  const handlePhoto = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const canSubmit = photo && kategori && volume && durasi;

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md pb-10">

        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-white px-5 pt-6 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f2] active:bg-[#e5e5e5] transition-colors"
          >
            <ArrowLeft size={18} className="text-[#333]" />
          </button>
          <h1 className="text-[16px] font-bold text-[#2d2d2d]">Lapor Sampah</h1>
        </header>

        <div className="px-5 pt-5 space-y-5">

          {/* Foto Kondisi Sampah */}
          <section>
            <p className="mb-2 text-[13px] font-semibold text-[#2d2d2d]">Foto Kondisi Sampah</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhoto}
            />
            {photoPreview ? (
              <div className="relative overflow-hidden rounded-[18px]">
                <img
                  src={photoPreview}
                  alt="preview"
                  className="h-[180px] w-full object-cover rounded-[18px]"
                />
                <button
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-[160px] w-full flex-col items-center justify-center gap-3 rounded-[18px] border-2 border-dashed border-[#d8d8d8] bg-white active:bg-[#f9f9f9] transition-colors"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f2f2]">
                  <Camera size={22} className="text-[#aaa]" />
                </div>
                <p className="text-[12px] text-[#bbb]">Foto tumpukan sampah</p>
                <p className="text-[11px] text-[#ccc]">Ambil foto atau pilih dari galeri</p>
              </button>
            )}
          </section>

          {/* Lokasi GPS */}
          <section>
            <p className="mb-2 text-[13px] font-semibold text-[#2d2d2d]">Lokasi GPS</p>
            <div className="flex items-center gap-3 rounded-[16px] bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#eaf6ee] flex-shrink-0">
                <MapPin size={17} className="text-[#3da85e]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#2d2d2d] truncate">{lokasi}</p>
                <p className="text-[11px] text-[#aaa] mt-0.5">{lokasiDetail}</p>
              </div>
              <button className="text-[12px] font-semibold text-[#3da85e] flex-shrink-0">Edit</button>
            </div>
          </section>

          {/* Kategori */}
          <section>
            <p className="mb-2 text-[13px] font-semibold text-[#2d2d2d]">Kategori</p>
            <div className="flex flex-wrap gap-2">
              {KATEGORI.map((k) => (
                <button
                  key={k}
                  onClick={() => setKategori(k)}
                  className={`rounded-full px-4 py-2 text-[12px] font-medium border transition-colors ${
                    kategori === k
                      ? "bg-[#3da85e] border-[#3da85e] text-white"
                      : "bg-white border-[#e0e0e0] text-[#555]"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </section>

          {/* Volume Perkiraan */}
          <section>
            <p className="mb-2 text-[13px] font-semibold text-[#2d2d2d]">Volume Perkiraan</p>
            <div className="flex gap-2">
              {VOLUME.map((v) => (
                <button
                  key={v.label}
                  onClick={() => setVolume(v.value)}
                  className={`flex-1 rounded-[14px] border py-3 text-center transition-colors ${
                    volume === v.value
                      ? "bg-[#3da85e] border-[#3da85e] text-white"
                      : "bg-white border-[#e0e0e0] text-[#555]"
                  }`}
                >
                  <p className={`text-[12px] font-semibold ${ volume === v.value ? "text-white" : "text-[#2d2d2d]" }`}>{v.label}</p>
                  <p className={`text-[10px] mt-0.5 ${ volume === v.value ? "text-white/80" : "text-[#aaa]" }`}>{v.sub}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Durasi */}
          <section>
            <p className="mb-2 text-[13px] font-semibold text-[#2d2d2d]">Durasi Perkiraan Sampah Menumpuk</p>
            <div className="flex gap-1.5 flex-wrap">
              {DURASI.map((d) => (
                <button
                  key={d}
                  onClick={() => setDurasi(d)}
                  className={`rounded-full px-4 py-2 text-[12px] font-medium border transition-colors ${
                    durasi === d
                      ? "bg-[#3da85e] border-[#3da85e] text-white"
                      : "bg-white border-[#e0e0e0] text-[#555]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </section>

          {/* Keterangan */}
          <section>
            <p className="mb-2 text-[13px] font-semibold text-[#2d2d2d]">Keterangan (opsional)</p>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Deskripsikan kondisi tumpukan sampah..."
              rows={3}
              className="w-full rounded-[16px] border-2 border-[#f0f0f0] bg-white px-4 py-3 text-[13px] text-[#2d2d2d] placeholder:text-[#ccc] outline-none focus:border-[#3da85e] transition-colors resize-none"
            />
          </section>

          {/* Status Badge (computed) */}
          {statusMeta && (
            <div
              className="flex items-center gap-2 rounded-[14px] px-4 py-3"
              style={{ backgroundColor: statusMeta.bg }}
            >
              <AlertCircle size={15} style={{ color: statusMeta.color, flexShrink: 0 }} />
              <span className="text-[12px] font-semibold" style={{ color: statusMeta.color }}>
                {statusMeta.label}
              </span>
              <button
                onClick={() => setShowStatusInfo(true)}
                className="ml-auto flex-shrink-0"
              >
                <Info size={15} style={{ color: statusMeta.color }} />
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => canSubmit && setShowConfirmSheet(true)}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-4 text-[14px] font-bold transition-all mb-4 ${
              canSubmit
                ? "bg-[#3da85e] text-white shadow-[0_6px_18px_rgba(61,168,94,0.35)] active:bg-[#2d8f50]"
                : "bg-[#d5d5d5] text-white cursor-not-allowed"
            }`}
          >
            <Send size={16} />
            Kirim laporan
          </button>
        </div>
      </div>

      {/* Status Info Bottom Sheet */}
      {showStatusInfo && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setShowStatusInfo(false)}
        >
          <div
            className="w-full max-w-md rounded-t-[28px] bg-white px-6 pb-8 pt-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e0e0e0]" />
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#888] mb-4">Keterangan Status Sampah</h3>
            <div className="space-y-3">
              {STATUS_INFO.map((s) => (
                <div
                  key={s.label}
                  className="rounded-[16px] px-4 py-3"
                  style={{ backgroundColor: s.bg }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                    <span className="text-[12px] font-semibold" style={{ color: s.color }}>{s.label}</span>
                  </div>
                  <p className="text-[11px] pl-4" style={{ color: s.color + "bb" }}>{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Bottom Sheet */}
      {showConfirmSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={() => setShowConfirmSheet(false)}
        >
          <div
            className="w-full max-w-md rounded-t-[28px] bg-white px-6 pb-8 pt-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#e0e0e0]" />
            <h3 className="text-center text-[16px] font-bold text-[#2d2d2d] mb-1">Kirim laporan ini?</h3>
            <p className="text-center text-[12px] text-[#aaa] mb-5">Pastikan informasi sudah benar sebelum dikirim.</p>

            {/* Preview card */}
            <div className="flex gap-3 rounded-[18px] bg-[#f8f8f8] p-3 mb-3">
              {photoPreview && (
                <img src={photoPreview} alt="preview" className="h-[72px] w-[72px] rounded-[12px] object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#2d2d2d] truncate">{lokasi}</p>
                <p className="text-[11px] text-[#888] mt-0.5">{kategori}</p>
                {statusMeta && (
                  <span
                    className="inline-block mt-1.5 rounded-full px-3 py-1 text-[10px] font-semibold"
                    style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}
                  >
                    {statusMeta.label}
                  </span>
                )}
                <p className="text-[11px] text-[#aaa] mt-1 line-clamp-2">{keterangan || "Sampah numpuk sejak lama."}</p>
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 rounded-[14px] bg-[#f0ebff] px-4 py-3 mb-5">
              <Info size={14} className="text-[#7c4dff] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#7c4dff] leading-relaxed">
                Laporan bisa dibatalkan dalam 10 menit setelah dikirim melalui halaman riwayat laporan.
              </p>
            </div>

            <button
              onClick={() => {
                setShowConfirmSheet(false);
                navigate("/konfirmasi-laporan", {
                  state: {
                    id: "#UPTERRA-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + String(Math.floor(Math.random()*9999)).padStart(4,"0"),
                    lokasi,
                    kategori,
                    volume,
                    durasi,
                    status: statusMeta?.label ?? "",
                    statusColor: statusMeta?.color ?? "#3da85e",
                  },
                });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3da85e] py-4 text-[14px] font-bold text-white shadow-[0_6px_18px_rgba(61,168,94,0.3)] active:bg-[#2d8f50] mb-3 transition-colors"
            >
              <Send size={15} />
              Kirim laporan
            </button>
            <button
              onClick={() => setShowConfirmSheet(false)}
              className="w-full rounded-full border-2 border-[#e0e0e0] bg-white py-3.5 text-[13px] font-semibold text-[#555] active:bg-[#f5f5f5] transition-colors"
            >
              Batal, periksa lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
