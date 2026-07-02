import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Camera, ChevronRight, ScanLine } from "lucide-react";
import BottomNav from "../components/layout/BottomNav";
import loginUpterra from "../assets/images/profile.svg";
import { motion } from "framer-motion";

const categories = ["Organik", "Anorganik", "Limbah Elektronik"];

const wasteCards = {
  Organik: [
    {
      title: "Kompos Dari Dapur",
      image:
        "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782380141/organik_1_rye2kr.png",
    },
    {
      title: "Pupuk dari Ampas Kopi",
      image:
        "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782380458/organik_2_oonfoz.png",
    },
    {
      title: "Eco Enzyme Kulit Buah",
      image:
        "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782380645/organik_3_uckg7y.png",
    },
  ],
  Anorganik: [
    {
      title: "Pilah Botol Plastik dengan Benar",
      image:
        "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782380844/anorganik_1_xm6ms4.png",
    },
    {
      title: "Kardus Bekas Jadi Cuan",
      image:
        "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782380844/anorganik_2_c3g28z.png",
    },
    {
      title: "Botol Jadi Pot Estetik",
      image:
        "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782380845/anorganik_3_il01ul.png",
    },
  ],
  "Limbah Elektronik": [
    {
      title: "Kabel Rusak Jadi Cuan",
      image:
        "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782381068/limbah_1_vh9wgt.png",
    },
    {
      title: "Buang Baterai Bekas dengan Aman",
      image:
        "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782381069/limbah_2_cyecdr.png",
    },
    {
      title: "Aman Buang Lampu Bekas",
      image:
        "https://res.cloudinary.com/mzzvuzn8/image/upload/v1782381069/limbah_3_l1cfr3.png",
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

          <button
            onClick={() => navigate("/notifications")}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)] active:bg-gray-50 transition"
          >
            <Bell size={18} className="text-[#6a6a6a]" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
              2
            </span>
          </button>
        </header>

        <section
          className="relative mt-6 overflow-hidden rounded-[28px] px-5 py-5 text-white"
          style={{
            background:
              "linear-gradient(135deg, rgba(88,168,109,0.88) 0%, rgba(47,135,78,0.94) 100%)",
            backdropFilter: "blur(24px) saturate(200%)",
            WebkitBackdropFilter: "blur(24px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.30)",
            boxShadow:
              "0 12px 32px rgba(47,168,87,0.22), inset 0 1.5px 0 rgba(255,255,255,0.28)",
          }}
        >
          {/* decorative blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-4 h-44 w-44 rounded-full"
            style={{ background: "rgba(255,255,255,0.09)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 right-6 h-32 w-32 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />

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
            <button
              onClick={() => navigate("/scan")}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-[#1f7a3d] transition-opacity active:opacity-70"
              style={{
                background: "rgba(255,255,255,0.90)",
                boxShadow:
                  "0 4px 14px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)",
              }}
            >
              <ScanLine size={16} />
              Mulai Scan
            </button>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-[16px] font-semibold text-[#303030]">
            Mulai Kontribusi
          </h3>

          <div
            className="mt-3 flex items-center justify-between rounded-[22px] px-5 py-4"
            style={{
              background: "rgba(255,255,255,0.52)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.78)",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.07), inset 0 1.5px 0 rgba(255,255,255,0.90)",
            }}
          >
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
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-semibold text-[#1f7a3d] transition-colors active:opacity-80"
              style={{
                background: "rgba(127,200,143,0.32)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(100,180,120,0.32)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.80)",
              }}
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

          {/* Glass pill track */}
          <div
            className="relative mt-3 grid grid-cols-3 gap-0 p-[5px]"
            style={{
              background: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(14px) saturate(160%)",
              WebkitBackdropFilter: "blur(14px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.72)",
              borderRadius: 999,
              boxShadow:
                "0 4px 18px rgba(0,0,0,0.07)," +
                "inset 0 1px 0 rgba(255,255,255,0.90)",
            }}
          >
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="relative z-10 rounded-full px-2 py-[9px] text-[11px] font-semibold transition-colors duration-200"
                  style={{ color: isActive ? "#1f7a3d" : "#b5b5b5" }}
                >
                  {/* sliding glass pill — lives inside the active button */}
                  {isActive && (
                    <motion.span
                      layoutId="category-pill"
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 28,
                        mass: 0.9,
                      }}
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 999,
                        background:
                          "linear-gradient(145deg, rgba(141,199,154,0.55) 0%, rgba(88,168,109,0.20) 100%)",
                        border: "1px solid rgba(100,190,130,0.40)",
                        backdropFilter: "blur(10px) saturate(180%)",
                        WebkitBackdropFilter: "blur(10px) saturate(180%)",
                        boxShadow:
                          "0 3px 14px rgba(47,168,87,0.18)," +
                          "inset 0 1px 0 rgba(255,255,255,0.80)",
                        overflow: "hidden",
                        zIndex: -1,
                      }}
                    >
                      {/* inner top shine */}
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "10%",
                          width: "80%",
                          height: "40%",
                          borderRadius: "0 0 50% 50%",
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)",
                        }}
                      />
                    </motion.span>
                  )}
                  {category}
                </button>
              );
            })}
          </div>

          {/* cards stay exactly the same */}
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {wasteCards[activeCategory].map((card) => (
              <article
                key={card.title}
                className="relative min-w-[148px] overflow-hidden rounded-[18px] flex-shrink-0"
                style={{
                  border: "1px solid rgba(255,255,255,0.60)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
                }}
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
                    <button
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.82)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.90)",
                      }}
                    >
                      <ChevronRight size={16} className="text-[#555]" />
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
                className="flex items-center justify-between rounded-[20px] px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.52)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.78)",
                  boxShadow:
                    "0 6px 18px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.90)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{
                      background:
                        index === 2
                          ? "rgba(130,170,240,0.70)"
                          : "rgba(100,200,130,0.70)",
                      boxShadow:
                        index === 2
                          ? "0 0 0 3px rgba(130,170,240,0.18)"
                          : "0 0 0 3px rgba(100,200,130,0.18)",
                    }}
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
                  className="rounded-full px-4 py-1.5 text-[10px] font-medium"
                  style={
                    point.badge === "E-Waste"
                      ? {
                          background: "rgba(130,185,240,0.22)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          border: "1px solid rgba(100,150,220,0.28)",
                          color: "#2a5fa8",
                        }
                      : {
                          background: "rgba(120,210,150,0.22)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          border: "1px solid rgba(100,180,120,0.28)",
                          color: "#2d7a45",
                        }
                  }
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
              Rekomendasi Produk
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
