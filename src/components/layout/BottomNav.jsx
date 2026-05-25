import { NavLink } from "react-router-dom";
import { Home, MapPin, ScanLine, ShoppingBag, User } from "lucide-react";

const navItems = [
  { to: "/home", label: "Beranda", icon: Home },
  { to: "/map", label: "Peta", icon: MapPin },
  { to: "/scan", label: "Scan", icon: ScanLine, center: true },
  { to: "/market", label: "Pasar", icon: ShoppingBag },
  { to: "/profile", label: "Akun", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 rounded-t-[28px] bg-white px-7 pb-5 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-end justify-between">
        {navItems.map(({ to, label, icon: Icon, center }) => {
          if (center) {
            return (
              <NavLink
                key={to}
                to={to}
                className="relative -mt-8 flex flex-col items-center"
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white shadow-[0_10px_20px_rgba(47,168,87,0.35)] transition ${
                        isActive
                          ? "bg-[#2fa857] text-white"
                          : "bg-[#58b874] text-white"
                      }`}
                    >
                      <Icon size={28} />
                    </div>
                    <span className="mt-1 text-[12px] text-[#7e7e7e]">
                      Scan
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={24}
                    className={isActive ? "text-[#28a055]" : "text-[#8d8d8d]"}
                    fill={
                      label === "Beranda" && isActive ? "currentColor" : "none"
                    }
                  />
                  <span
                    className={`text-[12px] ${
                      isActive ? "font-medium text-[#28a055]" : "text-[#8d8d8d]"
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
