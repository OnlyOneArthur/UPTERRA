import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import fullLogo from "../assets/logo/full_logo_upterra.svg";
import logo from "../assets/logo/logo_upterra.svg";

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
      <div className="flex flex-col items-center gap-4">
        <img src={logo} alt="UPTERRA" className="w-48 animate-spin" />
        <div className="mt-8 flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#238B45] animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-[#238B45] animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-[#238B45] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
