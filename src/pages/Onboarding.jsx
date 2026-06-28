import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import slide1 from "../assets/images/onboarding_card_1.svg";
import slide2 from "../assets/images/onboarding_card_2.svg";
import slide3 from "../assets/images/onboarding_card_3.svg";
import slide4 from "../assets/images/onboarding_card_4.svg";

const slides = [
  {
    image: slide1,
    headline: "Kenali Sampahmu",
    headlineHighlight: "dalam Sekejap",
    description:
      "Gunakan fitur pemindaian kamera dan suara untuk identifikasi jenis sampah rumah tangga hingga limbah elektronik secara akurat.",
  },
  {
    image: slide2,
    headline: "Olah Limbah Elektronik",
    headlineHighlight: "Dengan Aman",
    description:
      "Dapatkan instruksi pembongkaran perangkat rusak untuk memisahkan zat berbahaya dan menyelamatkan komponen yang masih bernilai guna",
  },
  {
    image: slide3,
    headline: "Ubah Limbah Jadi",
    headlineHighlight: "Aset Berharga",
    description:
      "Komponen layak pakai dari perangkatmu bisa dijual kembali melalui marketplace internal atau didaur ulang secara tepat",
  },
  {
    image: slide4,
    headline: "Bersama Ciptakan",
    headlineHighlight: "Lingkungan Bersih",
    description:
      "Tentukan titik penampungan resmi terdekat atau laporkan tumpukan sampah liar di sekitarmu secara real-time",
  },
];

const SLIDE_VARIANTS = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.96 }),
};

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const handleNext = () => {
    if (current < slides.length - 1) {
      goTo(current + 1);
    } else {
      localStorage.setItem("upterra_onboarded", "true");
      navigate("/register");
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div
      className="min-h-screen flex items-center justify-center font-poppins"
      style={{
        background:
          "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #e0f2f1 100%)",
      }}
    >
      {/* background blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div style={{ position:"absolute", top:"-10%", left:"-15%", width:340, height:340, borderRadius:"50%", background:"radial-gradient(circle, rgba(47,168,87,0.20) 0%, transparent 70%)", filter:"blur(40px)" }} />
        <div style={{ position:"absolute", bottom:"10%", right:"-10%", width:260, height:260, borderRadius:"50%", background:"radial-gradient(circle, rgba(64,196,255,0.16) 0%, transparent 70%)", filter:"blur(36px)" }} />
        <div style={{ position:"absolute", top:"45%", left:"25%", width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle, rgba(100,221,150,0.14) 0%, transparent 70%)", filter:"blur(28px)" }} />
      </div>

      {/* glass card container */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="relative z-10 w-full max-w-sm min-h-screen flex flex-col overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.70)",
          boxShadow:
            "0 8px 48px rgba(0,0,0,0.10), " +
            "inset 0 1.5px 0 rgba(255,255,255,0.85), " +
            "inset 0 -1px 0 rgba(0,0,0,0.04)",
        }}
      >
        {/* top shine */}
        <div aria-hidden="true" style={{ position:"absolute", top:0, left:"10%", width:"80%", height:1, background:"linear-gradient(90deg, transparent, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 60%, transparent)", pointerEvents:"none" }} />

        {/* Skip button */}
        <div className="flex justify-end px-6 pt-5 min-h-[44px]">
          <AnimatePresence>
            {!isLast && (
              <motion.button
                key="skip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
                className="text-sm text-gray-400 font-medium"
              >
                Lewati
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* slide image with animation */}
        <div className="flex-1 flex items-center justify-center px-6 pt-2 pb-4 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={current}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={slide.image}
              alt={`Onboarding ${current + 1}`}
              className="w-full h-full object-contain p-3"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50 && current < slides.length - 1) goTo(current + 1);
                if (info.offset.x > 50 && current > 0) goTo(current - 1);
              }}
            />
          </AnimatePresence>
        </div>

        {/* text content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`text-${current}`}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
            className="px-6 pt-2 pb-2 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {slide.headline}{" "}
              <span className="text-[#238B45]">{slide.headlineHighlight}</span>
            </h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* dot indicators */}
        <div className="flex justify-center gap-2 py-5">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              animate={{
                width: i === current ? 24 : 8,
                background: i === current ? "#238B45" : "rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{ height: 8, borderRadius: 99 }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        {/* CTA button — glass style */}
        <div className="px-6 pb-4">
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            className="w-full py-4 rounded-full text-white font-semibold text-base relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #2fa857 0%, #1a6e35 100%)",
              boxShadow:
                "0 6px 24px rgba(47,168,87,0.38), " +
                "0 2px 8px rgba(47,168,87,0.22), " +
                "inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            {/* inner shine */}
            <span aria-hidden="true" style={{ position:"absolute", top:0, left:"15%", width:"70%", height:"50%", background:"linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)", borderRadius:"0 0 50% 50%", pointerEvents:"none" }} />
            {isLast ? "Daftar" : "Selanjutnya"}
          </motion.button>
        </div>

        {/* login link */}
        <div className="text-center pb-8">
          <p className="text-sm text-gray-400">
            Sudah punya akun?{" "}
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-[#238B45] font-semibold hover:underline"
            >
              Masuk
            </motion.button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
