import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Import ONLY the icon mark now
import logoIcon from "../assets/logo/logo_upterra.svg";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasOnboarded = localStorage.getItem("upterra_onboarded");
      navigate(hasOnboarded ? "/login" : "/onboarding");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-poppins">
      <div className="flex flex-col items-center gap-6">
        {/* Brand Compound Layout */}
        <div className="flex flex-col items-center gap-3">
          {/* 1. Only the icon spins smoothly on its center axis */}
          <img
            src={logoIcon}
            alt="UpTerra Icon"
            className="w-16 h-16 animate-spin [animation-duration:3s] [animation-timing-function:linear]"
          />

          {/* 2. Text Logo styled to match your brand */}
          <h1 className="text-3xl font-extrabold tracking-[0.15em] text-[#1A4D2E] uppercase">
            UpTerra
          </h1>
        </div>

        {/* 3. Sleek loading dots at the bottom */}
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-[#238B45] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#238B45] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-[#238B45] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
