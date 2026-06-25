import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Navigation, MapPin, X } from "lucide-react";

const dropPoints = [
  {
    id: 1,
    name: "TPS3R Sidakarya",
    address: "Jl. Sidakarya, Denpasar Selatan",
    meta: "0.8 Km | Buka sampai 17.00",
    badge: "Resmi",
    badgeColor: "#4ba564",
    lat: -8.7195,
    lng: 115.2196,
  },
  {
    id: 2,
    name: "TPS3R Ubung Gemilang",
    address: "Jl. Ubung, Denpasar Utara",
    meta: "10 Km | Buka sampai 17.00",
    badge: "Resmi",
    badgeColor: "#4ba564",
    lat: -8.6312,
    lng: 115.2031,
  },
  {
    id: 3,
    name: "Drop Box E-Waste Mall Bali",
    address: "Jl. Sunset Road, Kuta",
    meta: "1.2 Km | Buka sampai 22.00",
    badge: "E-Waste",
    badgeColor: "#4a90d9",
    lat: -8.7194,
    lng: 115.1686,
  },
  {
    id: 4,
    name: "Bank Sampah Denpasar Barat",
    address: "Jl. Gunung Agung, Denpasar Barat",
    meta: "2.5 Km | Buka sampai 15.00",
    badge: "Resmi",
    badgeColor: "#4ba564",
    lat: -8.6753,
    lng: 115.1997,
  },
  {
    id: 5,
    name: "TPS3R Sanur",
    address: "Jl. Danau Poso, Sanur",
    meta: "3.1 Km | Buka sampai 16.00",
    badge: "Resmi",
    badgeColor: "#4ba564",
    lat: -8.7065,
    lng: 115.2623,
  },
];

function loadLeaflet() {
  return new Promise((resolve) => {
    // Already loaded
    if (window.L) {
      resolve(window.L);
      return;
    }

    // CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // JS — only append once
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve(window.L);
      script.onerror = () => console.error("Failed to load Leaflet");
      document.head.appendChild(script);
    } else {
      // Script tag exists but L not ready yet — poll
      const interval = setInterval(() => {
        if (window.L) {
          clearInterval(interval);
          resolve(window.L);
        }
      }, 50);
    }
  });
}

export default function MapView() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    let destroyed = false;

    loadLeaflet().then((L) => {
      if (destroyed || !mapRef.current || mapInstanceRef.current) return;

      setLeafletLoaded(true);

      const map = L.map(mapRef.current, {
        center: [-8.6705, 115.2126],
        zoom: 13,
        zoomControl: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const createIcon = (color) =>
        L.divIcon({
          className: "",
          html: `<div style="
            width:32px;height:32px;
            background:${color};
            border:3px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 4px 12px rgba(0,0,0,0.25);
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });

      dropPoints.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], {
          icon: createIcon(point.badgeColor),
        }).addTo(map);

        marker.on("click", () => {
          setSelectedPoint(point);
          map.setView([point.lat, point.lng], 15, { animate: true });
        });
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
    });

    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const flyToPoint = (point) => {
    setSelectedPoint(point);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([point.lat, point.lng], 16, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  return (
    <div className="relative flex flex-col" style={{ height: "100dvh" }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center gap-3 bg-white px-4 pt-5 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f2] active:bg-[#e5e5e5] transition-colors"
        >
          <ArrowLeft size={18} className="text-[#333]" />
        </button>
        <div>
          <h1 className="text-[15px] font-bold text-[#2d2d2d]">
            Titik Penampungan Sampah
          </h1>
          <p className="text-[11px] text-[#888]">{dropPoints.length} lokasi terdekat</p>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="flex-1"
        style={{ marginTop: "72px", marginBottom: "260px" }}
      />

      {/* Loading overlay */}
      {!leafletLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#f6f6f4] z-[999]"
          style={{ top: "72px", bottom: "260px" }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-4 border-[#3da85e] border-t-transparent animate-spin" />
            <p className="text-[13px] text-[#888]">Memuat peta...</p>
          </div>
        </div>
      )}

      {/* Selected Point Info Card */}
      {selectedPoint && (
        <div
          className="absolute z-[1001] left-4 right-4 bg-white rounded-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] p-4"
          style={{ bottom: "268px" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div
                className="mt-1 flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedPoint.badgeColor + "20" }}
              >
                <MapPin size={16} style={{ color: selectedPoint.badgeColor }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#2d2d2d] leading-snug">
                  {selectedPoint.name}
                </p>
                <p className="text-[11px] text-[#888] mt-0.5">{selectedPoint.address}</p>
                <p className="text-[10px] text-[#aaa] mt-0.5">{selectedPoint.meta}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f2f2]"
            >
              <X size={14} className="text-[#888]" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#3da85e] py-2.5 text-[12px] font-semibold text-white active:bg-[#2d8f50] transition-colors"
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.lat},${selectedPoint.lng}`;
                window.open(url, "_blank");
              }}
            >
              <Navigation size={13} />
              Navigasi
            </button>
            <span
              className="flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-semibold"
              style={{
                backgroundColor: selectedPoint.badgeColor + "18",
                color: selectedPoint.badgeColor,
              }}
            >
              {selectedPoint.badge}
            </span>
          </div>
        </div>
      )}

      {/* Bottom List */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.10)]"
        style={{ height: "260px" }}
      >
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-[#e0e0e0]" />
        </div>
        <p className="px-5 text-[13px] font-semibold text-[#2d2d2d] pb-2">
          Semua Lokasi
        </p>
        <div className="overflow-y-auto px-4 pb-4" style={{ height: "198px" }}>
          {dropPoints.map((point) => (
            <button
              key={point.id}
              onClick={() => flyToPoint(point)}
              className={`w-full flex items-center gap-3 rounded-[16px] px-3 py-3 mb-1.5 text-left transition-colors ${
                selectedPoint?.id === point.id
                  ? "bg-[#f0faf3]"
                  : "bg-[#fafafa] active:bg-[#f0f0f0]"
              }`}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                style={{ backgroundColor: point.badgeColor + "20" }}
              >
                <MapPin size={15} style={{ color: point.badgeColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#2d2d2d] truncate">
                  {point.name}
                </p>
                <p className="text-[10px] text-[#999] mt-0.5">{point.meta}</p>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-[9px] font-semibold flex-shrink-0"
                style={{
                  backgroundColor: point.badgeColor + "18",
                  color: point.badgeColor,
                }}
              >
                {point.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
