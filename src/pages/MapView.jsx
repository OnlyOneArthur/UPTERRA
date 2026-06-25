import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Navigation, MapPin, X, SlidersHorizontal } from "lucide-react";
import BottomNav from "../components/layout/BottomNav";

const dropPoints = [
  {
    id: 1,
    name: "TPS3R Sidakarya",
    address: "Jl. Sidakarya, Denpasar Selatan",
    meta: "0.8 Km | Buka sampai 17.00",
    type: "organik",
    badge: "Organik",
    badgeColor: "#3da85e",
    lat: -8.7195,
    lng: 115.2196,
  },
  {
    id: 2,
    name: "TPS3R Ubung Gemilang",
    address: "Jl. Ubung, Denpasar Utara",
    meta: "10 Km | Buka sampai 17.00",
    type: "organik",
    badge: "Organik",
    badgeColor: "#3da85e",
    lat: -8.6312,
    lng: 115.2031,
  },
  {
    id: 3,
    name: "Drop Box E-Waste Mall Bali",
    address: "Jl. Sunset Road, Kuta",
    meta: "1.2 Km | Buka sampai 22.00",
    type: "limbah",
    badge: "Limbah Elektronik",
    badgeColor: "#4a90d9",
    lat: -8.7194,
    lng: 115.1686,
  },
  {
    id: 4,
    name: "Bank Sampah Denpasar Barat",
    address: "Jl. Gunung Agung, Denpasar Barat",
    meta: "2.5 Km | Buka sampai 15.00",
    type: "anorganik",
    badge: "Anorganik",
    badgeColor: "#e0963b",
    lat: -8.6753,
    lng: 115.1997,
  },
  {
    id: 5,
    name: "TPS3R Sanur",
    address: "Jl. Danau Poso, Sanur",
    meta: "3.1 Km | Buka sampai 16.00",
    type: "organik",
    badge: "Organik",
    badgeColor: "#3da85e",
    lat: -8.7065,
    lng: 115.2623,
  },
  {
    id: 6,
    name: "Depo Sampah Anorganik Renon",
    address: "Jl. Raya Puputan, Renon",
    meta: "1.8 Km | Buka sampai 16.00",
    type: "anorganik",
    badge: "Anorganik",
    badgeColor: "#e0963b",
    lat: -8.6832,
    lng: 115.2321,
  },
  {
    id: 7,
    name: "E-Waste Center Gatsu",
    address: "Jl. Gatot Subroto, Denpasar",
    meta: "4.0 Km | Buka sampai 18.00",
    type: "limbah",
    badge: "Limbah Elektronik",
    badgeColor: "#4a90d9",
    lat: -8.6601,
    lng: 115.2178,
  },
];

const filters = [
  { key: "semua", label: "Semua", color: "#238B45" },
  { key: "organik", label: "Organik", color: "#3da85e" },
  { key: "anorganik", label: "Anorganik", color: "#e0963b" },
  { key: "limbah", label: "Limbah Elektronik", color: "#4a90d9" },
];

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve(window.L);
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.L) { clearInterval(interval); resolve(window.L); }
      }, 50);
    }
  });
}

export default function MapView() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const filtered = dropPoints.filter((p) => {
    const matchType = activeFilter === "semua" || p.type === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

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
        attribution: "\u00a9 OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const createIcon = (color) =>
        L.divIcon({
          className: "",
          html: `<div style="width:32px;height:32px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.25);"></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });

      dropPoints.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], {
          icon: createIcon(point.badgeColor),
        }).addTo(map);
        markersRef.current.push({ id: point.id, marker, point });
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

  // Show/hide markers based on active filter
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    markersRef.current.forEach(({ point, marker }) => {
      const visible = activeFilter === "semua" || point.type === activeFilter;
      if (visible) {
        if (!mapInstanceRef.current.hasLayer(marker)) marker.addTo(mapInstanceRef.current);
      } else {
        if (mapInstanceRef.current.hasLayer(marker)) mapInstanceRef.current.removeLayer(marker);
      }
    });
    if (selectedPoint && activeFilter !== "semua" && selectedPoint.type !== activeFilter) {
      setSelectedPoint(null);
    }
  }, [activeFilter]);

  const flyToPoint = (point) => {
    setSelectedPoint(point);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([point.lat, point.lng], 16, { animate: true, duration: 0.8 });
    }
  };

  const HEADER_H = 130;
  const BOTTOM_H = 280;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-poppins">
      <div className="relative w-full max-w-sm bg-white shadow-xl overflow-hidden" style={{ height: "100dvh" }}>

        {/* Header: search + filter chips */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-white px-4 pt-5 pb-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[#f4f4f4] rounded-full px-4 py-2.5">
            <Search size={15} className="text-[#aaa] flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kondisi lokasi sampah"
              className="flex-1 bg-transparent text-[13px] text-[#333] placeholder:text-[#bbb] outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-[#aaa]" />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition ${
                showFilterPanel
                  ? "bg-[#238B45] text-white border-[#238B45]"
                  : "bg-white text-[#555] border-[#e0e0e0]"
              }`}
            >
              <SlidersHorizontal size={12} />
              Filter
            </button>
            {filters.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold border transition"
                  style={{
                    backgroundColor: isActive ? f.color : "white",
                    color: isActive ? "white" : "#777",
                    borderColor: isActive ? f.color : "#e0e0e0",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter legend panel */}
        {showFilterPanel && (
          <div
            className="absolute left-4 right-4 z-[1001] bg-white rounded-[16px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-4"
            style={{ top: `${HEADER_H + 8}px` }}
          >
            <p className="text-[12px] font-bold text-[#2d2d2d] mb-3">Kategori Titik Penampungan</p>
            {[
              { color: "#3da85e", label: "Organik", desc: "Sampah sisa makanan, daun, dll" },
              { color: "#e0963b", label: "Anorganik", desc: "Plastik, kertas, kaca, kaleng" },
              { color: "#4a90d9", label: "Limbah Elektronik", desc: "Baterai, kabel, perangkat rusak" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-[12px] font-semibold text-[#333]">{item.label}</p>
                  <p className="text-[10px] text-[#aaa]">{item.desc}</p>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowFilterPanel(false)}
              className="mt-2 w-full rounded-full bg-[#f4f4f4] py-2 text-[12px] font-semibold text-[#555] active:bg-[#e8e8e8] transition"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Map */}
        <div
          ref={mapRef}
          className="absolute left-0 right-0"
          style={{ top: `${HEADER_H}px`, bottom: `${BOTTOM_H}px` }}
        />

        {/* Loading overlay */}
        {!leafletLoaded && (
          <div
            className="absolute left-0 right-0 flex items-center justify-center bg-[#f6f6f4] z-[999]"
            style={{ top: `${HEADER_H}px`, bottom: `${BOTTOM_H}px` }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-4 border-[#3da85e] border-t-transparent animate-spin" />
              <p className="text-[13px] text-[#888]">Memuat peta...</p>
            </div>
          </div>
        )}

        {/* Selected Point Card */}
        {selectedPoint && (
          <div
            className="absolute z-[1001] left-4 right-4 bg-white rounded-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] p-4"
            style={{ bottom: `${BOTTOM_H + 8}px` }}
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
                  <p className="text-[13px] font-semibold text-[#2d2d2d] leading-snug">{selectedPoint.name}</p>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#3da85e] py-2.5 text-[12px] font-semibold text-white active:bg-[#2d8f50] transition"
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
                style={{ backgroundColor: selectedPoint.badgeColor + "18", color: selectedPoint.badgeColor }}
              >
                {selectedPoint.badge}
              </span>
            </div>
          </div>
        )}

        {/* Bottom Sheet */}
        <div
          className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.10)]"
          style={{ height: `${BOTTOM_H}px` }}
        >
          <div className="flex items-center justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-[#e0e0e0]" />
          </div>
          <div className="flex items-center justify-between px-5 pb-2">
            <p className="text-[13px] font-semibold text-[#2d2d2d]">
              {activeFilter === "semua" ? "Semua Lokasi" : filters.find(f => f.key === activeFilter)?.label}
              <span className="ml-1.5 text-[11px] font-normal text-[#aaa]">({filtered.length})</span>
            </p>
          </div>

          <div className="overflow-y-auto px-4 pb-20" style={{ height: `${BOTTOM_H - 70}px` }}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-8 text-center">
                <MapPin size={28} className="text-[#ccc]" />
                <p className="mt-2 text-[13px] font-semibold text-[#aaa]">Tidak ada lokasi ditemukan</p>
              </div>
            ) : (
              filtered.map((point) => (
                <button
                  key={point.id}
                  onClick={() => flyToPoint(point)}
                  className={`w-full flex items-center gap-3 rounded-[16px] px-3 py-3 mb-1.5 text-left transition-colors ${
                    selectedPoint?.id === point.id ? "bg-[#f0faf3]" : "bg-[#fafafa] active:bg-[#f0f0f0]"
                  }`}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                    style={{ backgroundColor: point.badgeColor + "20" }}
                  >
                    <MapPin size={15} style={{ color: point.badgeColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#2d2d2d] truncate">{point.name}</p>
                    <p className="text-[10px] text-[#999] mt-0.5">{point.meta}</p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[9px] font-semibold flex-shrink-0"
                    style={{ backgroundColor: point.badgeColor + "18", color: point.badgeColor }}
                  >
                    {point.badge}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
