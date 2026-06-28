import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MapPin, ScanLine, ShoppingBag, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { to: "/home",    label: "Beranda", icon: Home },
  { to: "/map",     label: "Peta",    icon: MapPin },
  { to: "/scan",    label: "Scan",    icon: ScanLine, center: true },
  { to: "/market",  label: "Pasar",   icon: ShoppingBag },
  { to: "/profile", label: "Akun",    icon: User },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
      className="fixed bottom-0 left-1/2 z-[2000] w-full max-w-md -translate-x-1/2"
      style={{
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(28px) saturate(200%) brightness(1.1)",
        WebkitBackdropFilter: "blur(28px) saturate(200%) brightness(1.1)",
        borderTop: "1px solid rgba(255,255,255,0.55)",
        borderLeft: "1px solid rgba(255,255,255,0.35)",
        borderRight: "1px solid rgba(255,255,255,0.35)",
        borderRadius: "28px 28px 0 0",
        boxShadow:
          "0 -4px 32px rgba(0,0,0,0.10), " +
          "0 -1px 0 rgba(0,0,0,0.06), " +
          "inset 0 1.5px 0 rgba(255,255,255,0.75)",
        padding: "10px 20px 20px",
      }}
    >
      {/* subtle inner gradient shine at top edge */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          width: "80%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.9) 60%, transparent)",
          borderRadius: 1,
          pointerEvents: "none",
        }}
      />

      <div className="flex items-end justify-between relative">
        {navItems.map(({ to, label, icon: Icon, center }, idx) => {
          if (center) {
            return (
              <NavLink
                key={to}
                to={to}
                className="relative -mt-8 flex flex-col items-center"
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.93 }}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      className={`flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white text-white`}
                      style={{
                        background: isActive
                          ? "linear-gradient(145deg, #2fa857, #1a6e35)"
                          : "linear-gradient(145deg, #58b874, #2fa857)",
                        boxShadow: isActive
                          ? "0 8px 24px rgba(47,168,87,0.45), 0 2px 8px rgba(47,168,87,0.3), inset 0 1px 0 rgba(255,255,255,0.3)"
                          : "0 4px 16px rgba(47,168,87,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
                      }}
                    >
                      <Icon size={28} />
                    </motion.div>
                    <motion.span
                      animate={{ color: isActive ? "#28a055" : "#8d8d8d" }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 text-[12px] font-medium"
                    >
                      Scan
                    </motion.span>
                  </>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 relative z-10"
              style={{ minWidth: 48, paddingTop: 4 }}
            >
              {({ isActive }) => (
                <>
                  {/* active pill indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: -4,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          background:
                            "linear-gradient(160deg, rgba(47,168,87,0.22) 0%, rgba(40,160,85,0.10) 100%)",
                          border: "1px solid rgba(47,168,87,0.28)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          boxShadow:
                            "0 4px 16px rgba(47,168,87,0.15), inset 0 1.5px 0 rgba(255,255,255,0.65)",
                          zIndex: 0,
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.span
                    animate={{
                      y: isActive ? -3 : 0,
                      scale: isActive ? 1.15 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <Icon
                      size={22}
                      style={{
                        color: isActive ? "#28a055" : "#8d8d8d",
                        fill:
                          label === "Beranda" && isActive ? "currentColor" : "none",
                        transition: "color 0.22s ease",
                      }}
                    />
                  </motion.span>

                  <motion.span
                    animate={{
                      color: isActive ? "#28a055" : "#8d8d8d",
                      fontWeight: isActive ? 600 : 400,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 text-[12px]"
                  >
                    {label}
                  </motion.span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
}
