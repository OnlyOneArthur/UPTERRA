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
  const location   = useLocation();
  const navRef     = useRef(null);
  const itemRefs   = useRef([]);
  const pillRef    = useRef(null);
  const shineRef   = useRef(null);
  const readyRef   = useRef(false);

  const nonCenterItems = navItems.filter((n) => !n.center);
  const activeIndex    = nonCenterItems.findIndex((n) =>
    location.pathname.startsWith(n.to)
  );

  const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  const DURATION = "0.44s";

  function movePill(animated) {
    if (activeIndex === -1) return;
    const domIdx = DOM_ORDER[activeIndex];
    const el     = itemRefs.current[domIdx];
    const nav    = navRef.current;
    const pill   = pillRef.current;
    const shine  = shineRef.current;
    if (!el || !nav || !pill) return;

    const navRect = nav.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();
    const pillW   = Math.max(elRect.width + 32, 80);
    const left    = elRect.left - navRect.left + elRect.width / 2 - pillW / 2;

    if (animated) {
      pill.style.transition =
        `left ${DURATION} ${SPRING}, ` +
        `width ${DURATION} ${SPRING}, ` +
        `opacity 0.20s ease, ` +
        `transform ${DURATION} ${SPRING}`;
      if (shine) shine.style.transition = `opacity 0.20s ease`;
      pill.style.transform = "scaleY(0.88) scaleX(0.94)";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pill.style.transform = "scaleY(1) scaleX(1)";
        });
      });
    } else {
      pill.style.transition = "none";
      pill.style.transform  = "scaleY(1) scaleX(1)";
    }

    pill.style.left    = left + "px";
    pill.style.width   = pillW + "px";
    pill.style.opacity = "1";

    if (shine && animated) {
      shine.style.opacity = "0.85";
      setTimeout(() => { shine.style.opacity = "0.45"; }, 180);
    }
  }

  useEffect(() => {
    if (!readyRef.current) {
      let r2;
      const r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => {
          movePill(false);
          readyRef.current = true;
        });
      });
      return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    }
    movePill(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <nav
      ref={navRef}
      // z-[2000] ensures navbar always renders above map tiles (z-[1000]) and bottom sheet
      className="fixed bottom-0 left-1/2 z-[2000] w-full max-w-md -translate-x-1/2"
      style={{
        background:           "rgba(249,249,249,0.78)",
        backdropFilter:       "blur(28px) saturate(200%) brightness(1.08)",
        WebkitBackdropFilter: "blur(28px) saturate(200%) brightness(1.08)",
        borderTop:            "0.5px solid rgba(255,255,255,0.62)",
        borderRadius:         "28px 28px 0 0",
        boxShadow:
          "0 -1px 0 rgba(0,0,0,0.08), " +
          "0 -6px 32px rgba(0,0,0,0.08), " +
          "inset 0 1px 0 rgba(255,255,255,0.70)",
        padding: "10px 20px 20px",
      }}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        style={{
          position:    "absolute",
          top:         8,
          left:        "-999px",
          width:       80,
          height:      54,
          borderRadius: 18,
          background:
            "linear-gradient(160deg, rgba(47,168,87,0.18) 0%, rgba(40,160,85,0.09) 100%)",
          border:               "1px solid rgba(47,168,87,0.30)",
          backdropFilter:       "blur(14px) saturate(180%)",
          WebkitBackdropFilter: "blur(14px) saturate(180%)",
          boxShadow:
            "0 3px 14px rgba(47,168,87,0.18), " +
            "inset 0 1.5px 0 rgba(255,255,255,0.70), " +
            "inset 0 -1px 0 rgba(47,168,87,0.12)",
          opacity:       0,
          transition:    "none",
          transform:     "scaleY(1) scaleX(1)",
          transformOrigin: "center center",
          pointerEvents: "none",
          overflow:      "hidden",
        }}
      >
        <span
          ref={shineRef}
          aria-hidden="true"
          style={{
            position:   "absolute",
            top:        0,
            left:       "10%",
            width:      "80%",
            height:     "40%",
            borderRadius: "0 0 50% 50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 100%)",
            opacity:    0.45,
            transition: "opacity 0.20s ease",
            pointerEvents: "none",
          }}
        />
      </span>

      <div className="flex items-end justify-between relative">
        {navItems.map(({ to, label, icon: Icon, center }, idx) => {
          if (center) {
            return (
              <NavLink key={to} to={to} className="relative -mt-8 flex flex-col items-center">
                {({ isActive }) => (
                  <>
                    <div
                      style={{
                        transition: `transform 0.28s ${SPRING}`,
                        transform:  isActive ? "scale(1.12)" : "scale(1)",
                      }}
                      className={`flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white shadow-[0_10px_20px_rgba(47,168,87,0.35)] ${
                        isActive ? "bg-[#2fa857]" : "bg-[#58b874]"
                      } text-white`}
                    >
                      <Icon size={28} />
                    </div>
                    <span
                      className="mt-1 text-[12px]"
                      style={{
                        color:      isActive ? "#28a055" : "#8d8d8d",
                        transition: "color 0.2s ease",
                      }}
                    >
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
                      transition:     `transform 0.32s ${SPRING}`,
                      transform:      isActive
                        ? "translateY(-3px) scale(1.15)"
                        : "translateY(0) scale(1)",
                    }}
                  >
                    <Icon
                      size={22}
                      style={{
                        color:      isActive ? "#28a055" : "#8d8d8d",
                        fill:       label === "Beranda" && isActive ? "currentColor" : "none",
                        transition: "color 0.22s ease",
                      }}
                    />
                  </span>
                  <span
                    style={{
                      fontSize:   12,
                      color:      isActive ? "#28a055" : "#8d8d8d",
                      fontWeight: isActive ? 600 : 400,
                      letterSpacing: isActive ? "-0.2px" : "0",
                      transition:
                        `color 0.22s ease, ` +
                        `font-weight 0.22s ease, ` +
                        `transform 0.32s ${SPRING}`,
                      transform: isActive ? "translateY(-2px)" : "translateY(0)",
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
