import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MapPin, ScanLine, ShoppingBag, User } from "lucide-react";

const navItems = [
  { to: "/home",    label: "Beranda", icon: Home },
  { to: "/map",     label: "Peta",    icon: MapPin },
  { to: "/scan",    label: "Scan",    icon: ScanLine, center: true },
  { to: "/market",  label: "Pasar",   icon: ShoppingBag },
  { to: "/profile", label: "Akun",    icon: User },
];

const DOM_ORDER = navItems
  .map((n, i) => (!n.center ? i : null))
  .filter((i) => i !== null);

export default function BottomNav() {
  const location  = useLocation();
  const navRef    = useRef(null);
  const itemRefs  = useRef([]);
  const pillRef   = useRef(null);
  // track whether we've done the initial snap
  const readyRef  = useRef(false);

  const nonCenterItems = navItems.filter((n) => !n.center);
  const activeIndex    = nonCenterItems.findIndex((n) =>
    location.pathname.startsWith(n.to)
  );

  function movePill(animated) {
    if (activeIndex === -1) return;
    const domIdx  = DOM_ORDER[activeIndex];
    const el      = itemRefs.current[domIdx];
    const nav     = navRef.current;
    const pill    = pillRef.current;
    if (!el || !nav || !pill) return;

    const navRect = nav.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();
    const pillW   = Math.max(elRect.width + 28, 76);
    const left    = elRect.left - navRect.left + elRect.width / 2 - pillW / 2;

    // Toggle transition via attribute — avoids React re-render race
    if (animated) {
      pill.style.transition =
        "left 0.42s cubic-bezier(0.34,1.28,0.64,1), " +
        "width 0.42s cubic-bezier(0.34,1.28,0.64,1), " +
        "opacity 0.18s ease";
    } else {
      pill.style.transition = "none";
    }

    pill.style.left    = left + "px";
    pill.style.width   = pillW + "px";
    pill.style.opacity = "1";
  }

  // Runs on every pathname change (including initial mount)
  useEffect(() => {
    if (!readyRef.current) {
      // Mount: wait for 2 frames so flex layout is measured, then SNAP
      let r2;
      const r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => {
          movePill(false);          // snap, no animation
          readyRef.current = true;
        });
      });
      return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    }
    // Subsequent navigations: SLIDE
    movePill(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2"
      style={{
        background:           "rgba(255,255,255,0.72)",
        backdropFilter:       "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderTop:            "1px solid rgba(255,255,255,0.5)",
        borderRadius:         "28px 28px 0 0",
        boxShadow:            "0 -6px 32px rgba(0,0,0,0.10), 0 -1px 0 rgba(255,255,255,0.6) inset",
        padding:              "10px 20px 20px",
      }}
    >
      {/* Glass pill — position controlled directly via ref, NOT React state */}
      <span
        ref={pillRef}
        aria-hidden="true"
        style={{
          position:             "absolute",
          top:                  8,
          left:                 "-999px",   // hidden off-screen until first snap
          width:                76,
          height:               54,
          borderRadius:         16,
          background:           "rgba(40,160,85,0.11)",
          border:               "1.5px solid rgba(40,160,85,0.24)",
          backdropFilter:       "blur(10px) saturate(160%)",
          WebkitBackdropFilter: "blur(10px) saturate(160%)",
          boxShadow:            "0 2px 12px rgba(40,160,85,0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
          opacity:              0,
          transition:           "none",
          transform:            "translateZ(0)",
          pointerEvents:        "none",
        }}
      />

      <div className="flex items-end justify-between relative">
        {navItems.map(({ to, label, icon: Icon, center }, idx) => {
          if (center) {
            return (
              <NavLink key={to} to={to} className="relative -mt-8 flex flex-col items-center">
                {({ isActive }) => (
                  <>
                    <div
                      style={{
                        transition: "transform 0.25s cubic-bezier(0.34,1.26,0.64,1)",
                        transform:  isActive ? "scale(1.12)" : "scale(1)",
                      }}
                      className={`flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white shadow-[0_10px_20px_rgba(47,168,87,0.35)] ${
                        isActive ? "bg-[#2fa857]" : "bg-[#58b874]"
                      } text-white`}
                    >
                      <Icon size={28} />
                    </div>
                    <span className="mt-1 text-[12px]" style={{ color: isActive ? "#28a055" : "#8d8d8d", transition: "color 0.2s ease" }}>
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
              ref={(el) => (itemRefs.current[idx] = el)}
              className="flex flex-col items-center gap-1 relative z-10"
              style={{ minWidth: 48, paddingTop: 4 }}
            >
              {({ isActive }) => (
                <>
                  <span
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      transition:     "transform 0.30s cubic-bezier(0.34,1.56,0.64,1)",
                      transform:      isActive ? "translateY(-2px) scale(1.14)" : "translateY(0) scale(1)",
                    }}
                  >
                    <Icon
                      size={22}
                      style={{
                        color:      isActive ? "#28a055" : "#8d8d8d",
                        fill:       label === "Beranda" && isActive ? "currentColor" : "none",
                        transition: "color 0.2s ease",
                      }}
                    />
                  </span>
                  <span
                    style={{
                      fontSize:   12,
                      color:      isActive ? "#28a055" : "#8d8d8d",
                      fontWeight: isActive ? 600 : 400,
                      transition: "color 0.2s ease, transform 0.30s cubic-bezier(0.34,1.56,0.64,1)",
                      transform:  isActive ? "translateY(-1px)" : "translateY(0)",
                    }}
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
