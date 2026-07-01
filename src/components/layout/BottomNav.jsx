import { useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, MapPin, ScanLine, ShoppingBag, User } from "lucide-react";

const navItems = [
  { to: "/home", label: "Beranda", icon: Home },
  { to: "/map", label: "Peta", icon: MapPin },
  { to: "/scan", label: "Scan", icon: ScanLine, center: true },
  { to: "/market", label: "Pasar", icon: ShoppingBag },
  { to: "/profile", label: "Akun", icon: User },
];

const pillItems = navItems.filter((n) => !n.center);

const SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.9,
};

export default function BottomNav() {
  const location = useLocation();

  const activeIdx = pillItems.findIndex((n) =>
    location.pathname.startsWith(n.to),
  );

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-[2000] w-full max-w-md -translate-x-1/2"
      style={{
        background: "rgba(255,255,255,1)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        borderLeft: "1px solid rgba(0,0,0,0.04)",
        borderRight: "1px solid rgba(0,0,0,0.04)",
        borderRadius: "28px 28px 0 0",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.09)",
        padding: "10px 20px 20px",
      }}
    >
      <div className="flex items-end justify-between relative">
        {navItems.map(({ to, label, icon: Icon, center }) => {
          /* CENTER FAB */
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
                      className="flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white text-white"
                      style={{
                        background: isActive
                          ? "linear-gradient(145deg, #2fa857, #1a6e35)"
                          : "linear-gradient(145deg, #58b874, #2fa857)",
                        boxShadow:
                          "0 8px 24px rgba(47,168,87,0.38), inset 0 1px 0 rgba(255,255,255,0.25)",
                        transition: "background 0.3s ease",
                      }}
                    >
                      <Icon size={28} />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        marginTop: 4,
                        transition: "color 0.2s",
                        color: isActive ? "#28a055" : "#8d8d8d",
                      }}
                    >
                      Scan
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          /* REGULAR ITEMS */
          const isActive = location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 relative z-10"
              style={{ minWidth: 52, paddingTop: 6 }}
            >
              {/* ACTIVE PILL — no blur */}
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  aria-hidden="true"
                  transition={SPRING}
                  style={{
                    position: "absolute",
                    inset: "-6px -12px",
                    borderRadius: 18,
                    background:
                      "linear-gradient(160deg, rgba(47,168,87,0.15) 0%, rgba(40,160,85,0.06) 100%)",
                    border: "1px solid rgba(47,168,87,0.22)",
                    backdropFilter: "none",
                    WebkitBackdropFilter: "none",
                    boxShadow: "0 4px 20px rgba(47,168,87,0.12)",
                    zIndex: 0,
                  }}
                />
              )}

              <Icon
                size={22}
                style={{
                  position: "relative",
                  zIndex: 1,
                  color: isActive ? "#28a055" : "#9a9a9a",
                  fill:
                    label === "Beranda" && isActive ? "currentColor" : "none",
                  transition: "color 0.22s ease",
                }}
              />
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: 12,
                  color: isActive ? "#28a055" : "#9a9a9a",
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.22s ease, font-weight 0.2s ease",
                  letterSpacing: isActive ? "-0.2px" : "0",
                }}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
