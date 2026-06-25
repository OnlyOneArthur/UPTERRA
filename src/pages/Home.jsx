import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Camera, ChevronRight, ScanLine } from "lucide-react";
import BottomNav from "../components/layout/BottomNav";
import loginUpterra from "../assets/images/profile.svg";

const categories = ["Organik", "Anorganik", "Limbah Elektronik"];

const wasteCards = {
  Organik: [
    {
      title: "Kompos Dari Dapur",
      image:
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Pupuk dari Ampas Kopi",
      image:
        "https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Eco Enzyme Kulit Buah",
      image:
        "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=800&q=80",
    },
  ],
  Anorganik: [
    {
      title: "Pilah Botol Plastik dengan Benar",
      image:
        "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Kardus Bekas Jadi Cuan",
      image:
        "https://images.unsplash.com/photo-1604186838309-c6715f0d3e6d?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Botol Jadi Pot Estetik",
      image:
        "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80",
    },
  ],
  "Limbah Elektronik": [
    {
      title: "Kabel Rusak Jadi Cuan",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Buang Baterai Bekas dengan Aman",
      image:
        "https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Aman Buang Lampu Bekas",
      image:
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

const dropPoints = [
  {
    name: "TPS3R Sidakarya, Denpasar Selatan",
    meta: "0.8 Km | Buka sampai 17.00",
    badge: "Resmi",
  },
  {
    name: "TPS3R Ubung Gemilang, Denpasar Utara",
    meta: "10 Km | Buka sampai 17.00",
    badge: "Resmi",
  },
  {
    name: "Drop Box E-Waste Mall X",
    meta: "1.2 Km | Buka sampai 22.00",
    badge: "E-Waste",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Anorganik");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f6f4] font-poppins">
      <div className="mx-auto max-w-md px-5 pt-6 pb-28">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#8bd39f] shadow-sm">
              <img src={loginUpterra} alt="UPTERRA" className="h-full w-full" />
            </div>

            <div>
              <h1 className="text-[15px] font-medium text-[#565656]">
                Halo,{" "}
                <span className="font-semibold text-[#2d9b57]">Arthur</span>
              </h1>
              <p className="text-xs text-[#7b7b7b]">
                Yuk, pilah barang bekasmu hari ini
              </p>
            </div>
          </div>

          <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
            <Bell size={18} className="text-[#6a6a6a]" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
              2
            </span>
          </button>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-[28px] bg-[#58a86d] px-5 py-5 text-white shadow-[0_12px_24px_rgba(88,168,109,0.25)]">
          <div className="relative z-10 max-w-[220px]">
            <h2 className="text-[16px] font-bold leading-snug">
              Scan sampahmu,
              <br />
              kenali jenisnya sekarang
            </h2>

            <p className="mt-2 text-[11px] leading-relaxed text-white/85">
              Gunakan kamera atau suara untuk identifikasi sampah dan panduan
              penanganan awal
            </p>

            <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-[#414141] shadow-sm">
              <ScanLine size={16} />
              Mulai Scan
            </button>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-[16px] font-semibold text-[#303030]">
            Mulai Kontribusi
          </h3>

          <div className="mt-3 flex items-center justify-between rounded-[22px] bg-white px-5 py-4 shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
            <div>
              <h4 className="text-[15px] font-semibold text-[#4ba564]">
                Lapor Tumpukan Sampah
              </h4>
              <p className="mt-1 text-[10px] text-[#8f8f8f]">
                Foto &amp; kirim lokasi real-time
              </p>
            </div>

            <button
              onClick={() => navigate("/lapor-sampah")}
              className="inline-flex items-center gap-2 rounded-full bg-[#7fc88f] px-4 py-3 text-xs font-medium text-white active:bg-[#5db078] transition-colors"
            >
              <Camera size={14} />
              Lapor sekarang
            </button>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-[16px] font-semibold text-[#303030]">
            Ayo Kelola Sampahmu
          </h3>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-2 py-2 text-[11px] font-semibold transition ${
                    active
                      ? "bg-[#8dc79a] text-[#247e46]"
                      : "bg-white text-[#b5b5b5]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {wasteCards[activeCategory].map((card) => (
              <article
                key={card.title}
                className="relative min-w-[148px] overflow-hidden rounded-[18px] bg-white shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-[170px] w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-3 pt-10">
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-[11px] font-medium leading-snug text-white">
                      {card.title}
                    </p>

                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#555555]">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-[#303030]">
              Titik Penampungan Terdekat
            </h3>
            <button className="text-sm font-semibold text-[#2d9b57]">
              Lihat Peta
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {dropPoints.map((point, index) => (
              <div
                key={point.name}
                className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3 shadow-[0_6px_14px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                      index === 2 ? "bg-[#9fc8ff]" : "bg-[#bde9c8]"
                    }`}
                  />
                  <div>
                    <h4 className="text-[13px] font-medium leading-snug text-[#3d3d3d]">
                      {point.name}
                    </h4>
                    <p className="mt-0.5 text-[10px] text-[#8a8a8a]">
                      {point.meta}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-4 py-1.5 text-[10px] font-medium ${
                    point.badge === "E-Waste"
                      ? "bg-[#def1ff] text-[#6ba8d7]"
                      : "bg-[#e8f6ff] text-[#7bb8df]"
                  }`}
                >
                  {point.badge}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-[#303030]">
              Rekomendasi Produk Bu'
            </h3>
            <button className="text-sm font-semibold text-[#2d9b57]">
              Lihat Semua
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
