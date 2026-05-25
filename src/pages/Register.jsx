import { useNavigate } from "react-router-dom";
import loginUpterra from "../assets/images/login_upterra.svg";
export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f6f6] font-poppins">
      <div className="max-w-md mx-auto min-h-screen bg-[#f6f6f6] shadow-sm">
        <div className="relative bg-linear-to-r from-[#238B45] via-[#69b57f] to-[#d8efdf] px-5 pt-15 pb-14 overflow-hidden">
          <img
            src={loginUpterra}
            alt=""
            className="absolute top-0 right-0 w-25 sm:w-40 opacity-95 pointer-events-none select-none"
          />
        </div>

        <div className="-mt-6 rounded-t-[34px] bg-[#f6f6f6] px-6 pt-6 pb-10 min-h-[75vh]">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center text-xs text-gray-500"
          >
            ← kembali
          </button>

          <div className="mb-5">
            <h1 className="text-4xl font-bold text-[#238B45]">Sign Up</h1>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-500">
              Silakan bergabung dengan kami, isi data pribadi untuk membuat
              akun.
            </p>
          </div>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full rounded-full bg-white px-5 py-3 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none placeholder:text-gray-400"
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-full bg-white px-5 py-3 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none placeholder:text-gray-400"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-full bg-white px-5 py-3 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none placeholder:text-gray-400"
            />

            <input
              type="text"
              placeholder="No Tel"
              className="w-full rounded-full bg-white px-5 py-3 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none placeholder:text-gray-400"
            />

            <label className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-gray-500">
              <input type="checkbox" className="mt-0.5 accent-[#238B45]" />
              <span>
                Saya setuju dengan{" "}
                <span className="font-semibold text-[#238B45]">
                  syarat & ketentuan
                </span>{" "}
                aplikasi ini
              </span>
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-[#238B45] py-3 text-sm font-semibold text-white transition hover:bg-[#1c6f37]"
            >
              Sign Up
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <p className="text-[11px] text-gray-400">
              Atau sign up menggunakan
            </p>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="flex justify-center gap-5">
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              G
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              ☁️
            </button>
          </div>

          <p className="mt-6 text-center text-[12px] text-gray-500">
            Sudah punya akun ?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-[#238B45]"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
