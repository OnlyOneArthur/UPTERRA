import { useEffect, useRef, useState } from "react";
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

const pillItems = navItems.filter((n) => !n.center);
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function BottomNav() {
  const location = useLocation();
  const navRef   = useRef(null);
  // KEY FIX: refs on plain <div>s, NOT on <NavLink> (NavLink does not forward refs)
  const itemRefs = useRef(pillItems.map(() => null));
  const pillRef  = useRef(null);
  const shineRef = useRef(null);
  const isFirstRender = useRef(true);

  const activeIdx = pillItems.findIndex((n) =>
    location.pathname.startsWith(n.to)
  );

  function movePill(animate) {
    if (activeIdx === -1) return;
    const el   = itemRefs.current[activeIdx];
    const nav  = navRef.current;
    const pill = pillRef.current;
    if (!el || !nav || !pill) return;

    const navRect = nav.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();
    const pillW   = Math.max(elRect.width + 28, 72);
    const left    = elRect.left - navRect.left + elRect.width / 2 - pillW / 2;

    if (animate) {
      pill.style.transition =
        `left 0.44s ${SPRING}, width 0.44s ${SPRING}, opacity 0.2s ease, transform 0.44s ${SPRING}`;
      // squish then spring back
      pill.style.transform = "scaleY(0.86) scaleX(0.93)";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        pill.style.transform = "scaleY(1) scaleX(1)";
      }));
      // shine flash
      const shine = shineRef.current;
      if (shine) {
        shine.style.transition = "opacity 0.2s ease";
        shine.style.opacity = "0.9";
        setTimeout(() => { shine.style.opacity = "0.45"; }, 200);
      }
    } else {
      pill.style.transition = "none";
      pill.style.transform  = "scaleY(1) scaleX(1)";
    }

    pill.style.left    = left + "px";
    pill.style.width   = pillW + "px";
    pill.style.opacity = "1";
  }

  useEffect(() => {
    // double-rAF to ensure browser has fully laid out before measuring
    let r1, r2;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        const firstTime = isFirstRender.current;
        isFirstRender.current = false;
        movePill(!firstTime); // no animation on first mount, spring on tab changes
      });
    });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-1/2 z-[2000] w-full max-w-md -translate-x-1/2"
      style={{
        background:           "rgba(255,255,255,0.18)",
        backdropFilter:       "blur(28px) saturate(200%) brightness(1.1)",
        WebkitBackdropFilter: "blur(28px) saturate(200%) brightness(1.1)",
        borderTop:            "1px solid rgba(255,255,255,0.55)",
        borderLeft:           "1px solid rgba(255,255,255,0.30)",
        borderRight:          "1px solid rgba(255,255,255,0.30)",
        borderRadius:         "28px 28px 0 0",
        boxShadow:
          "0 -4px 32px rgba(0,0,0,0.10)," +
          "0 -1px 0 rgba(0,0,0,0.06)," +
          "inset 0 1.5px 0 rgba(255,255,255,0.78)",
        padding: "10px 20px 20px",
      }}
    >
      {/* top-edge shine */}
      <div aria-hidden="true" style={{ position:"absolute", top:0, left:"10%", width:"80%", height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.95) 40%,rgba(255,255,255,0.95) 60%,transparent)", pointerEvents:"none" }} />

      {/* sliding glass pill — single element, moves via CSS transition */}
      <span
        ref={pillRef}
        aria-hidden="true"
        style={{
          position:             "absolute",
          top:                  8,
          left:                 "-999px",   // starts offscreen, movePill() sets real pos
          width:                72,
          height:               54,
          borderRadius:         18,
          background:           "linear-gradient(160deg,rgba(47,168,87,0.22) 0%,rgba(40,160,85,0.10) 100%)",
          border:               "1px solid rgba(47,168,87,0.32)",
          backdropFilter:       "blur(14px) saturate(180%)",
          WebkitBackdropFilter: "blur(14px) saturate(180%)",
          boxShadow:            "0 4px 18px rgba(47,168,87,0.18),inset 0 1.5px 0 rgba(255,255,255,0.72),inset 0 -1px 0 rgba(47,168,87,0.10)",
          opacity:              0,
          transition:           "none",
          transform:            "scaleY(1) scaleX(1)",
          transformOrigin:      "center center",
          pointerEvents:        "none",
          overflow:             "hidden",
          zIndex:               0,
        }}
      >
        <span
          ref={shineRef}
          aria-hidden="true"
          style={{
            position:     "absolute", top:0, left:"10%", width:"80%", height:"42%",
            borderRadius: "0 0 50% 50%",
            background:   "linear-gradient(180deg,rgba(255,255,255,0.70) 0%,transparent 100%)",
            opacity:      0.45,
            transition:   "opacity 0.2s ease",
            pointerEvents:"none",
          }}
        />
      </span>

      <div className="flex items-end justify-between relative">
        {navItems.map(({ to, label, icon: Icon, center }) => {

          /* ── CENTER FAB ── */
          if (center) {
            return (
              <NavLink key={to} to={to} className="relative -mt-8 flex flex-col items-center">
                {({ isActive }) => (
                  <>
                    <motion.div
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      whileHover={{ scale: 1.13, y: -3 }}
                      whileTap={{ scale: 0.91 }}
                      transition={{ type:"spring", stiffness:340, damping:22 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white text-white"
                      style={{
                        background: isActive
                          ? "linear-gradient(145deg,#2fa857,#1a6e35)"
                          : "linear-gradient(145deg,#58b874,#2fa857)",
                        boxShadow: isActive
                          ? "0 8px 28px rgba(47,168,87,0.48),inset 0 1px 0 rgba(255,255,255,0.28)"
                          : "0 4px 16px rgba(47,168,87,0.30),inset 0 1px 0 rgba(255,255,255,0.22)",
                      }}
                    >
                      <motion.span
                        animate={{ rotate: isActive ? 12 : 0 }}
                        transition={{ type:"spring", stiffness:300, damping:18 }}
                      >
                        <Icon size={28} />
                      </motion.span>
                    </motion.div>
                    <span style={{ fontSize:12, marginTop:4, color: isActive ? "#28a055" : "#8d8d8d", transition:"color 0.2s" }}>
                      Scan
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          /* ── REGULAR ITEMS ── */
          const pillIdx  = pillItems.findIndex((p) => p.to === to);
          const isActive = location.pathname.startsWith(to);

          return (
            // plain <div> — always measurable by getBoundingClientRect
            <div
              key={to}
              ref={(el) => { itemRefs.current[pillIdx] = el; }}
              style={{ minWidth: 48 }}
            >
              <NavLink
                to={to}
                className="flex flex-col items-center gap-1 relative z-10"
                style={{ paddingTop: 4 }}
              >
                <motion.span
                  animate={{ y: isActive ? -4 : 0, scale: isActive ? 1.18 : 1 }}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.86 }}
                  transition={{ type:"spring", stiffness:380, damping:26 }}
                  className="flex items-center justify-center"
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

                <motion.span
                  animate={{
                    color:      isActive ? "#28a055" : "#8d8d8d",
                    y:          isActive ? -3 : 0,
                  }}
                  transition={{ type:"spring", stiffness:380, damping:28 }}
                  style={{ fontSize:12, fontWeight: isActive ? 600 : 400 }}
                >
                  {label}
                </motion.span>
              </NavLink>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
