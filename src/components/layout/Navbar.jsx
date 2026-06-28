import { useRef, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MapPin, ScanLine, ShoppingBag, User } from "lucide-react";
import { motion } from "motion/react";

const navItems = [
  { to: "/home",    label: "Beranda", icon: Home },
  { to: "/map",     label: "Peta",    icon: MapPin },
  { to: "/scan",    label: "Scan",    icon: ScanLine, center: true },
  { to: "/market",  label: "Pasar",   icon: ShoppingBag },
  { to: "/profile", label: "Akun",    icon: User },
];

// Only non-center items get the sliding pill
const pillItems = navItems.filter((n) => !n.center);

export default function Navbar() {
  const location = useLocation();
  const itemRefs = useRef([]);
  const navRef   = useRef(null);

  // pill position state — x offset and width relative to nav
  const [pill, setPill] = useState({ x: -999, width: 64, ready: false });

  const activeIdx = pillItems.findIndex((n) =>
    location.pathname.startsWith(n.to)
  );

  // Recalculate pill position whenever active tab changes
  useEffect(() => {
    const el  = itemRefs.current[activeIdx];
    const nav = navRef.current;
    if (!el || !nav || activeIdx === -1) return;

    const navRect = nav.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();
    const pillW   = elRect.width + 28;
    const x       = elRect.left - navRect.left + elRect.width / 2 - pillW / 2;

    setPill({ x, width: pillW, ready: true });
  }, [activeIdx, location.pathname]);

  // map pillItems indices back to navItems indices for ref assignment
  // pillItems[0] = navItems[0], pillItems[1] = navItems[1],
  // pillItems[2] = navItems[3], pillItems[3] = navItems[4]
  const pillToNavIndex = pillItems.map((item) =>
    navItems.findIndex((n) => n.to === item.to)
  );

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
      className="fixed bottom-0 left-1/2 z-[2000] w-full max-w-md -translate-x-1/2"
      style={{
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(28px) saturate(200%) brightness(1.1)",
        WebkitBackdropFilter: "blur(28px) saturate(200%) brightness(1.1)",
        borderTop:   "1px solid rgba(255,255,255,0.55)",
        borderLeft:  "1px solid rgba(255,255,255,0.35)",
        borderRight: "1px solid rgba(255,255,255,0.35)",
        borderRadius: "28px 28px 0 0",
        boxShadow:
          "0 -4px 32px rgba(0,0,0,0.10), " +
          "0 -1px 0 rgba(0,0,0,0.06), " +
          "inset 0 1.5px 0 rgba(255,255,255,0.75)",
        padding: "10px 20px 20px",
      }}
    >
      {/* top shine line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, left: "10%", width: "80%", height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.9) 60%, transparent)",
          borderRadius: 1, pointerEvents: "none",
        }}
      />

      {/* ── SHARED SLIDING GLASS PILL ── renders once, slides via layout animation */}
      {pill.ready && activeIdx !== -1 && (
        <motion.span
          aria-hidden="true"
          layoutId="nav-sliding-pill"
          animate={{ x: pill.x, width: pill.width }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          style={{
            position: "absolute",
            top: 8,
            left: 0,
            height: 54,
            borderRadius: 18,
            background:
              "linear-gradient(160deg, rgba(47,168,87,0.22) 0%, rgba(40,160,85,0.10) 100%)",
            border: "1px solid rgba(47,168,87,0.30)",
            backdropFilter: "blur(14px) saturate(180%)",
            WebkitBackdropFilter: "blur(14px) saturate(180%)",
            boxShadow:
              "0 4px 18px rgba(47,168,87,0.18), " +
              "inset 0 1.5px 0 rgba(255,255,255,0.70), " +
              "inset 0 -1px 0 rgba(47,168,87,0.10)",
            pointerEvents: "none",
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          {/* inner top shine */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute", top: 0, left: "12%", width: "76%", height: "45%",
              borderRadius: "0 0 50% 50%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 100%)",
              opacity: 0.8, pointerEvents: "none",
            }}
          />
        </motion.span>
      )}

      <div className="flex items-end justify-between relative">
        {navItems.map(({ to, label, icon: Icon, center }, navIdx) => {
          // ── CENTER FAB (Scan button) ──
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
                      whileHover={{ scale: 1.12, y: -3 }}
                      whileTap={{ scale: 0.91 }}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 340, damping: 22 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white text-white"
                      style={{
                        background: isActive
                          ? "linear-gradient(145deg, #2fa857, #1a6e35)"
                          : "linear-gradient(145deg, #58b874, #2fa857)",
                        boxShadow: isActive
                          ? "0 8px 28px rgba(47,168,87,0.50), 0 2px 8px rgba(47,168,87,0.30), inset 0 1px 0 rgba(255,255,255,0.28)"
                          : "0 4px 16px rgba(47,168,87,0.30), inset 0 1px 0 rgba(255,255,255,0.22)",
                      }}
                    >
                      <motion.span
                        animate={{ rotate: isActive ? 15 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      >
                        <Icon size={28} />
                      </motion.span>
                    </motion.div>
                    <motion.span
                      animate={{ color: isActive ? "#28a055" : "#8d8d8d", y: isActive ? -2 : 0 }}
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

          // ── REGULAR NAV ITEM ──
          // figure out which pillItems index this navItem corresponds to
          const pillIdx = pillItems.findIndex((p) => p.to === to);
          const isActive = location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              ref={(el) => (itemRefs.current[pillIdx] = el)}
              className="flex flex-col items-center gap-1 relative z-10"
              style={{ minWidth: 48, paddingTop: 4 }}
            >
              {/* icon */}
              <motion.span
                animate={{
                  y:     isActive ? -4 : 0,
                  scale: isActive ? 1.18 : 1,
                }}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                className="relative z-10 flex items-center justify-center"
              >
                <Icon
                  size={22}
                  style={{
                    color:      isActive ? "#28a055" : "#8d8d8d",
                    fill:       label === "Beranda" && isActive ? "currentColor" : "none",
                    transition: "color 0.2s ease",
                  }}
                />
              </motion.span>

              {/* label */}
              <motion.span
                animate={{
                  color:      isActive ? "#28a055" : "#8d8d8d",
                  fontWeight: isActive ? 600 : 400,
                  y:          isActive ? -3 : 0,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="relative z-10 text-[12px]"
              >
                {label}
              </motion.span>
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
}
