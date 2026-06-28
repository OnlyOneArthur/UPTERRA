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

// Only the 4 non-center items get the sliding pill
const pillItems = navItems.filter((n) => !n.center);

// spring-like easing for the slide
const SPRING_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const SLIDE_DURATION = "0.42s";

export default function BottomNav() {
  const location    = useLocation();
  const navRef      = useRef(null);
  const pillRef     = useRef(null);
  const shineRef    = useRef(null);
  // plain div refs — NavLink does NOT forward refs so we wrap in <div>
  const itemRefs    = useRef([null, null, null, null]);
  const isFirstRef  = useRef(true);

  const activeIdx = pillItems.findIndex((n) =>
    location.pathname.startsWith(n.to)
  );

  useEffect(() => {
    // double rAF: ensures layout is fully painted before we measure
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        const el   = itemRefs.current[activeIdx];
        const nav  = navRef.current;
        const pill = pillRef.current;
        if (!el || !nav || !pill || activeIdx === -1) return;

        const navRect = nav.getBoundingClientRect();
        const elRect  = el.getBoundingClientRect();
        const pillW   = elRect.width + 24;
        const pillX   = elRect.left - navRect.left + elRect.width / 2 - pillW / 2;

        const first = isFirstRef.current;
        isFirstRef.current = false;

        if (first) {
          // no animation on first mount — just snap into place
          pill.style.transition = "none";
        } else {
          // smooth spring slide on every tab change
          pill.style.transition = [
            `left ${SLIDE_DURATION} ${SPRING_EASE}`,
            `width ${SLIDE_DURATION} ${SPRING_EASE}`,
            `opacity 0.15s ease`,
          ].join(", ");

          // shine flash effect
          const shine = shineRef.current;
          if (shine) {
            shine.style.transition = "opacity 0.15s ease";
            shine.style.opacity = "1";
            setTimeout(() => { shine.style.opacity = "0.45"; }, 220);
          }
        }

        pill.style.left    = pillX + "px";
        pill.style.width   = pillW + "px";
        pill.style.opacity = "1";
      });
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-1/2 z-[2000] w-full max-w-md -translate-x-1/2"
      style={{
        background:           "rgba(255,255,255,0.20)",
        backdropFilter:       "blur(28px) saturate(200%) brightness(1.08)",
        WebkitBackdropFilter: "blur(28px) saturate(200%) brightness(1.08)",
        borderTop:            "1px solid rgba(255,255,255,0.60)",
        borderLeft:           "1px solid rgba(255,255,255,0.30)",
        borderRight:          "1px solid rgba(255,255,255,0.30)",
        borderRadius:         "28px 28px 0 0",
        boxShadow:
          "0 -4px 32px rgba(0,0,0,0.09)," +
          "inset 0 1.5px 0 rgba(255,255,255,0.80)",
        padding: "10px 20px 20px",
      }}
    >
      {/* top shine line */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: "10%", width: "80%", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 60%, transparent)",
        pointerEvents: "none",
      }} />

      {/* THE SLIDING GLASS PILL — one element, moves left/right via CSS transition */}
      <span
        ref={pillRef}
        aria-hidden="true"
        style={{
          position:             "absolute",
          top:                  8,
          left:                 "-999px",  // offscreen until first measurement
          width:                72,
          height:               54,
          borderRadius:         18,
          background:           "linear-gradient(160deg, rgba(47,168,87,0.20) 0%, rgba(40,160,85,0.08) 100%)",
          border:               "1px solid rgba(47,168,87,0.28)",
          backdropFilter:       "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          boxShadow:
            "0 4px 20px rgba(47,168,87,0.16)," +
            "inset 0 1.5px 0 rgba(255,255,255,0.75)," +
            "inset 0 -1px 0 rgba(47,168,87,0.08)",
          opacity:              0,
          transition:           "none",
          pointerEvents:        "none",
          overflow:             "hidden",
          zIndex:               0,
        }}
      >
        {/* inner highlight shine */}
        <span
          ref={shineRef}
          aria-hidden="true"
          style={{
            position:      "absolute", top: 0, left: "12%",
            width:         "76%",     height: "44%",
            borderRadius:  "0 0 50% 50%",
            background:    "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, transparent 100%)",
            opacity:       0.45,
            pointerEvents: "none",
          }}
        />
      </span>

      {/* NAV ITEMS */}
      <div className="flex items-end justify-between relative">
        {navItems.map(({ to, label, icon: Icon, center }) => {

          /* CENTER FAB */
          if (center) {
            return (
              <NavLink key={to} to={to} className="relative -mt-8 flex flex-col items-center">
                {({ isActive }) => (
                  <>
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white text-white"
                      style={{
                        background: isActive
                          ? "linear-gradient(145deg, #2fa857, #1a6e35)"
                          : "linear-gradient(145deg, #58b874, #2fa857)",
                        boxShadow: "0 8px 24px rgba(47,168,87,0.38), inset 0 1px 0 rgba(255,255,255,0.25)",
                        transition: "background 0.3s ease",
                      }}
                    >
                      <Icon size={28} />
                    </div>
                    <span style={{ fontSize: 12, marginTop: 4, transition: "color 0.2s", color: isActive ? "#28a055" : "#8d8d8d" }}>
                      Scan
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          /* REGULAR ITEMS */
          const pillIdx  = pillItems.findIndex((p) => p.to === to);
          const isActive = location.pathname.startsWith(to);

          return (
            // plain <div> wrapper — this is what we measure with getBoundingClientRect
            <div
              key={to}
              ref={(el) => { itemRefs.current[pillIdx] = el; }}
              style={{ minWidth: 52 }}
            >
              <NavLink
                to={to}
                className="flex flex-col items-center gap-1 relative z-10 w-full"
                style={{ paddingTop: 6 }}
              >
                {/* icon — only color changes, no bounce */}
                <Icon
                  size={22}
                  style={{
                    color:      isActive ? "#28a055" : "#9a9a9a",
                    fill:       label === "Beranda" && isActive ? "currentColor" : "none",
                    transition: "color 0.22s ease",
                  }}
                />
                {/* label — only color + weight changes */}
                <span
                  style={{
                    fontSize:      12,
                    color:         isActive ? "#28a055" : "#9a9a9a",
                    fontWeight:    isActive ? 600 : 400,
                    transition:    "color 0.22s ease, font-weight 0.2s ease",
                    letterSpacing: isActive ? "-0.2px" : "0",
                  }}
                >
                  {label}
                </span>
              </NavLink>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
