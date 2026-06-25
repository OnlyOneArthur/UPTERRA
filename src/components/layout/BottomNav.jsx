import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MapPin, ScanLine, ShoppingBag, User } from "lucide-react";

const navItems = [
  { to: "/home",    label: "Beranda", icon: Home },
  { to: "/map",     label: "Peta",    icon: MapPin },
  { to: "/scan",    label: "Scan",    icon: ScanLine, center: true },
  { to: "/market",  label: "Pasar",   icon: ShoppingBag },
  { to: "/profile", label: "Akun",    icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const navRef   = useRef(null);
  const itemRefs = useRef([]);

  // pill position state
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });

  // find active index (exclude center scan button from pill)
  const nonCenterItems = navItems.filter((n) => !n.center);
  const activeIndex = nonCenterItems.findIndex((n) =>
    location.pathname.startsWith(n.to)
  );

  useEffect(() => {
    if (activeIndex === -1 || !navRef.current) return;

    // Map nonCenterItems index back to DOM refs index
    // itemRefs are stored in render order (0-4), center item at index 2 is skipped for pill
    const domOrder = navItems
      .map((n, i) => (!n.center ? i : null))
      .filter((i) => i !== null);
    const domIdx = domOrder[activeIndex];

    const el  = itemRefs.current[domIdx];
    const nav = navRef.current;
    if (!el || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();

    setPill({
      left:    elRect.left - navRect.left + elRect.width / 2 - 36,
      width:   72,
      opacity: 1,
    });
  }, [activeIndex, location.pathname]);

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2"
      style={{
        /* glassmorphism background */
        background:           "rgba(255, 255, 255, 0.72)",
        backdropFilter:       "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderTop:            "1px solid rgba(255,255,255,0.45)",
        borderRadius:         "28px 28px 0 0",
        boxShadow:            "0 -6px 32px rgba(0,0,0,0.10), 0 -1px 0 rgba(255,255,255,0.6) inset",
        padding:              "12px 28px 20px",
      }}
    >
      {/* Sliding glass pill indicator */}
      <span
        aria-hidden="true"
        style={{
          position:         "absolute",
          top:              10,
          left:             pill.left,
          width:            pill.width,
          height:           34,
          borderRadius:     999,
          background:       "rgba(40,160,85,0.13)",
          border:           "1px solid rgba(40,160,85,0.18)",
          backdropFilter:   "blur(8px)",
          opacity:          pill.opacity,
          transform:        "translateZ(0)",
          transition:       "left 0.38s cubic-bezier(0.34,1.26,0.64,1), opacity 0.2s ease",
          pointerEvents:    "none",
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
                    <div
                      style={{
                        transition: "transform 0.25s cubic-bezier(0.34,1.26,0.64,1), box-shadow 0.25s ease",
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
                      style={{ color: isActive ? "#28a055" : "#8d8d8d",
                               transition: "color 0.2s ease" }}
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
              style={{ minWidth: 44 }}
            >
              {({ isActive }) => (
                <>
                  {/* icon with pop animation */}
                  <span
                    style={{
                      display:    "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                      transform:  isActive ? "translateY(-3px) scale(1.15)" : "translateY(0) scale(1)",
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

                  {/* label fade + slide */}
                  <span
                    style={{
                      fontSize:   12,
                      color:      isActive ? "#28a055" : "#8d8d8d",
                      fontWeight: isActive ? 600 : 400,
                      transition: "color 0.2s ease, font-weight 0.2s ease, transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
                      transform:  isActive ? "translateY(-2px)" : "translateY(0)",
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
