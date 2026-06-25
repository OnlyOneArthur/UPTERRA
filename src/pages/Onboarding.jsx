import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      localStorage.setItem("upterra_onboarded", "true");
      navigate("/register");
    }
  };

  const handleSkip = () => {
    // for skipping onboarding entirely for entire session
    // localStorage.setItem("upterra_onboarded", "true");
    navigate("/login");
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-poppins">
      <div className="w-full max-w-sm min-h-screen bg-white flex flex-col shadow-xl">
        <div className="flex justify-end px-6 pt-5 min-h-[44px]">
          {!isLast && (
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
            >
              Lewati
            </button>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pt-2 pb-4">
          <img
            src={slide.image}
            alt={`Onboarding ${current + 1}`}
            className="w-full h-full object-contain p-3"
          />
        </div>

        <div className="px-6 pt-2 pb-2 text-center">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {slide.headline}{" "}
            <span className="text-[#238B45]">{slide.headlineHighlight}</span>
          </h2>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            {slide.description}
          </p>
        </div>

        <div className="flex justify-center gap-2 py-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-[#238B45]" : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="px-6 pb-4">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-full bg-[#238B45] text-white font-semibold text-base hover:bg-[#1a6e35] active:scale-[0.98] transition-all duration-200 shadow-md"
          >
            {isLast ? "Daftar" : "Selanjutnya"}
          </button>
        </div>

        <div className="text-center pb-8">
          <p className="text-sm text-gray-400">
            Sudah punya akun?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#238B45] font-semibold hover:underline"
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
