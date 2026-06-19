import { useNavigate } from "react-router-dom";
import loginUpterra from "../assets/images/login_upterra.svg";
import trashCan from "../assets/images/trash_can.svg";

export default function Login() {
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    navigate("/home");
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] font-poppins">
      <div className="mx-auto min-h-screen max-w-md bg-[#f6f6f6] shadow-sm">
        <div className="relative overflow-hidden bg-linear-to-r from-[#238B45] via-[#69b57f] to-[#d8efdf] px-5 pt-3 pb-5">
          <img
            src={loginUpterra}
            alt=""
            className="pointer-events-none absolute top-0 right-0 w-20 select-none opacity-95 sm:w-40"
          />

          <div className="relative z-10 text-white">
            <h1 className="text-3xl font-bold leading-none">halo !</h1>
            <p className="mt-1 text-sm leading-snug">
              selamat datang
              <br />
              kembali di UPTERRA
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center rounded-md border border-[#238B45] bg-white px-2 py-1 text-xs text-[#238B45]"
            >
              kembali
            </button>
          </div>
        </div>

        <div className="-mt-8 min-h-[70vh] rounded-t-[34px] bg-[#f6f6f6] px-6 pt-6 pb-10">
          <div className="flex flex-col items-center">
            <img
              src={trashCan}
              alt="Trash can"
              className="mb-3 h-25 w-25 object-contain"
            />
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full rounded-full bg-white px-5 py-3 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-full bg-white px-5 py-3 text-sm shadow-[0_4px_12px_rgba(0,0,0,0.08)] outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center justify-between px-1 text-[11px]">
              <label className="flex items-center gap-2 text-gray-500">
                <input type="checkbox" className="accent-[#238B45]" />
                Ingat akun saya
              </label>

              <button type="button" className="font-semibold text-[#238B45]">
                Lupa Password
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-[#238B45] py-3 text-sm font-semibold text-white transition hover:bg-[#1c6f37]"
            >
              Login
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <p className="text-[11px] text-gray-400">Atau login menggunakan</p>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <div className="flex justify-center gap-5">
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            >
              G
            </button>

            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
            >
              ☁️
            </button>
          </div>

          <p className="mt-6 text-center text-[12px] text-gray-500">
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-[#238B45]"
            >
              Buat Akun
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
