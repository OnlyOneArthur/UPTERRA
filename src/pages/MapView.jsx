import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Navigation,
  MapPin,
  X,
  SlidersHorizontal,
  AlertTriangle,
  Camera,
  Trash2,
} from "lucide-react";
import BottomNav from "../components/layout/BottomNav";

// ─── Titik Pengumpulan Sampah Terpilah (BUKAN TPA) ───────────────────────────
// Hanya fasilitas resmi: TPS3R, Dropbox E-Waste, dan Bank Sampah
const dropPoints = [
  {
    id: 1,
    name: "TPS3R Sidakarya",
    address: "Jl. Sidakarya, Denpasar Selatan",
    meta: "0.8 Km | Buka sampai 17.00",
    type: "tps3r",
    badge: "TPS3R",
    badgeColor: "#3da85e",
    desc: "Pengolahan Reduce, Reuse, Recycle",
    lat: -8.7195,
    lng: 115.2196,
  },
  {
    id: 2,
    name: "TPS3R Ubung Gemilang",
    address: "Jl. Ubung, Denpasar Utara",
    meta: "10 Km | Buka sampai 17.00",
    type: "tps3r",
    badge: "TPS3R",
    badgeColor: "#3da85e",
    desc: "Pengolahan Reduce, Reuse, Recycle",
    lat: -8.6312,
    lng: 115.2031,
  },
  {
    id: 3,
    name: "Drop Box E-Waste Mall Bali",
    address: "Jl. Sunset Road, Kuta",
    meta: "1.2 Km | Buka sampai 22.00",
    type: "ewaste",
    badge: "Dropbox E-Waste",
    badgeColor: "#4a90d9",
    desc: "Dropbox resmi perangkat elektronik",
    lat: -8.7194,
    lng: 115.1686,
  },
  {
    id: 4,
    name: "Bank Sampah Denpasar Barat",
    address: "Jl. Gunung Agung, Denpasar Barat",
    meta: "2.5 Km | Buka sampai 15.00",
    type: "banksampah",
    badge: "Bank Sampah",
    badgeColor: "#e0963b",
    desc: "Setoran material daur ulang harian",
    lat: -8.6753,
    lng: 115.1997,
  },
  {
    id: 5,
    name: "TPS3R Sanur",
    address: "Jl. Danau Poso, Sanur",
    meta: "3.1 Km | Buka sampai 16.00",
    type: "tps3r",
    badge: "TPS3R",
    badgeColor: "#3da85e",
    desc: "Pengolahan Reduce, Reuse, Recycle",
    lat: -8.7065,
    lng: 115.2623,
  },
  {
    id: 6,
    name: "Bank Sampah Renon",
    address: "Jl. Raya Puputan, Renon",
    meta: "1.8 Km | Buka sampai 16.00",
    type: "banksampah",
    badge: "Bank Sampah",
    badgeColor: "#e0963b",
    desc: "Setoran material daur ulang harian",
    lat: -8.6832,
    lng: 115.2321,
  },
  {
    id: 7,
    name: "E-Waste Center Gatsu",
    address: "Jl. Gatot Subroto, Denpasar",
    meta: "4.0 Km | Buka sampai 18.00",
    type: "ewaste",
    badge: "Dropbox E-Waste",
    badgeColor: "#4a90d9",
    desc: "Dropbox resmi perangkat elektronik",
    lat: -8.6601,
    lng: 115.2178,
  },
];

// ─── Titik Pembuangan Sampah Resmi Per Desa (TPS Desa) ───────────────────────
const tpsDesaPoints = [
  {
    id: "desa-1",
    name: "TPS Desa Sidakarya",
    address: "Desa Sidakarya, Denpasar Selatan",
    meta: "Buka: 06.00 - 18.00 | Kapasitas: 5 ton/hari",
    type: "tpsdesa",
    badge: "TPS Desa",
    badgeColor: "#7c3aed",
    desc: "Tempat pembuangan sampah resmi Desa Sidakarya",
    lat: -8.721,
    lng: 115.218,
  },
  {
    id: "desa-2",
    name: "TPS Desa Pemogan",
    address: "Desa Pemogan, Denpasar Selatan",
    meta: "Buka: 05.00 - 17.00 | Kapasitas: 4 ton/hari",
    type: "tpsdesa",
    badge: "TPS Desa",
    badgeColor: "#7c3aed",
    desc: "Tempat pembuangan sampah resmi Desa Pemogan",
    lat: -8.732,
    lng: 115.205,
  },
  {
    id: "desa-3",
    name: "TPS Desa Ubung Kaja",
    address: "Desa Ubung Kaja, Denpasar Utara",
    meta: "Buka: 06.00 - 18.00 | Kapasitas: 6 ton/hari",
    type: "tpsdesa",
    badge: "TPS Desa",
    badgeColor: "#7c3aed",
    desc: "Tempat pembuangan sampah resmi Desa Ubung Kaja",
    lat: -8.625,
    lng: 115.207,
  },
  {
    id: "desa-4",
    name: "TPS Desa Sanur Kaja",
    address: "Desa Sanur Kaja, Denpasar Selatan",
    meta: "Buka: 06.00 - 16.00 | Kapasitas: 3 ton/hari",
    type: "tpsdesa",
    badge: "TPS Desa",
    badgeColor: "#7c3aed",
    desc: "Tempat pembuangan sampah resmi Desa Sanur Kaja",
    lat: -8.692,
    lng: 115.265,
  },
  {
    id: "desa-5",
    name: "TPS Desa Renon",
    address: "Desa Renon, Denpasar Selatan",
    meta: "Buka: 05.30 - 17.30 | Kapasitas: 5 ton/hari",
    type: "tpsdesa",
    badge: "TPS Desa",
    badgeColor: "#7c3aed",
    desc: "Tempat pembuangan sampah resmi Desa Renon",
    lat: -8.687,
    lng: 115.234,
  },
  {
    id: "desa-6",
    name: "TPS Desa Dauh Puri",
    address: "Desa Dauh Puri, Denpasar Barat",
    meta: "Buka: 06.00 - 18.00 | Kapasitas: 4 ton/hari",
    type: "tpsdesa",
    badge: "TPS Desa",
    badgeColor: "#7c3aed",
    desc: "Tempat pembuangan sampah resmi Desa Dauh Puri",
    lat: -8.663,
    lng: 115.21,
  },
  {
    id: "desa-7",
    name: "TPS Desa Tonja",
    address: "Desa Tonja, Denpasar Utara",
    meta: "Buka: 06.00 - 17.00 | Kapasitas: 3.5 ton/hari",
    type: "tpsdesa",
    badge: "TPS Desa",
    badgeColor: "#7c3aed",
    desc: "Tempat pembuangan sampah resmi Desa Tonja",
    lat: -8.645,
    lng: 115.228,
  },
  {
    id: "desa-8",
    name: "TPS Desa Kesiman",
    address: "Desa Kesiman, Denpasar Timur",
    meta: "Buka: 05.00 - 17.00 | Kapasitas: 4 ton/hari",
    type: "tpsdesa",
    badge: "TPS Desa",
    badgeColor: "#7c3aed",
    desc: "Tempat pembuangan sampah resmi Desa Kesiman",
    lat: -8.671,
    lng: 115.245,
  },
];

// ─── Titik Sampah Sembarangan Pre-loaded ─────────────────────────────────────
// Data awal sampah liar yang sudah diketahui (sebelum laporan warga)
const preloadedIllegalDumps = [
  {
    id: "illegal-1",
    name: "Sampah Liar — Jl. Ahmad Yani",
    address: "Jl. Ahmad Yani, Denpasar Timur",
    meta: "Dilaporkan: 28 Jun 2026",
    type: "laporan",
    badge: "Sampah Liar",
    badgeColor: "#e03535",
    desc: "Tumpukan sampah campuran di pinggir jalan",
    lat: -8.671,
    lng: 115.239,
    isReport: true,
    isPreloaded: true,
  },
  {
    id: "illegal-2",
    name: "Sampah Liar — Sungai Badung",
    address: "Bantaran Sungai Badung, Denpasar Barat",
    meta: "Dilaporkan: 25 Jun 2026",
    type: "laporan",
    badge: "Sampah Liar",
    badgeColor: "#e03535",
    desc: "Pembuangan sampah ilegal di bantaran sungai",
    lat: -8.676,
    lng: 115.205,
    isReport: true,
    isPreloaded: true,
  },
  {
    id: "illegal-3",
    name: "Sampah Liar — Lahan Kosong Ubung",
    address: "Lahan Kosong Jl. Cokroaminoto, Ubung",
    meta: "Dilaporkan: 22 Jun 2026",
    type: "laporan",
    badge: "Sampah Liar",
    badgeColor: "#e03535",
    desc: "Tumpukan sampah organik & anorganik di lahan kosong",
    lat: -8.638,
    lng: 115.201,
    isReport: true,
    isPreloaded: true,
  },
  {
    id: "illegal-4",
    name: "Sampah Liar — Pasar Kumbasari",
    address: "Sekitar Pasar Kumbasari, Denpasar",
    meta: "Dilaporkan: 20 Jun 2026",
    type: "laporan",
    badge: "Sampah Liar",
    badgeColor: "#e03535",
    desc: "Sisa sampah pasar yang tidak terangkut",
    lat: -8.662,
    lng: 115.2158,
    isReport: true,
    isPreloaded: true,
  },
  {
    id: "illegal-5",
    name: "Sampah Liar — Jl. Sunset Road",
    address: "Jl. Sunset Road, Kuta Utara",
    meta: "Dilaporkan: 18 Jun 2026",
    type: "laporan",
    badge: "Sampah Liar",
    badgeColor: "#e03535",
    desc: "Pembuangan sampah elektronik & plastik sembarangan",
    lat: -8.705,
    lng: 115.172,
    isReport: true,
    isPreloaded: true,
  },
  {
    id: "illegal-6",
    name: "Sampah Liar — Pantai Sanur Utara",
    address: "Pantai Sanur bagian Utara",
    meta: "Dilaporkan: 15 Jun 2026",
    type: "laporan",
    badge: "Sampah Liar",
    badgeColor: "#e03535",
    desc: "Sampah plastik dan organik di area pantai",
    lat: -8.695,
    lng: 115.263,
    isReport: true,
    isPreloaded: true,
  },
];

const filters = [
  { key: "semua", label: "Semua", color: "#238B45" },
  { key: "tps3r", label: "TPS3R", color: "#3da85e" },
  { key: "banksampah", label: "Bank Sampah", color: "#e0963b" },
  { key: "ewaste", label: "Dropbox E-Waste", color: "#4a90d9" },
  { key: "tpsdesa", label: "TPS Desa", color: "#7c3aed" },
  { key: "laporan", label: "Sampah Liar", color: "#e03535" },
];

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
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
  const markersRef = useRef([]);
  const reportMarkersRef = useRef([]);
  const tpsDesaMarkersRef = useRef([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // ─── Crowdsourced illegal dump reports — pre-loaded + user-added ──────────
  const [illegalDumps, setIllegalDumps] = useState(preloadedIllegalDumps);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportPhoto, setReportPhoto] = useState(null);
  const [reportPhotoPreview, setReportPhotoPreview] = useState(null);
  const [reportGps, setReportGps] = useState(null);
  const [reportGpsLoading, setReportGpsLoading] = useState(false);
  const [reportKategori, setReportKategori] = useState("");
  const reportFileRef = useRef(null);

  const filtered = dropPoints.filter((p) => {
    if (activeFilter === "laporan" || activeFilter === "tpsdesa") return false;
    const matchType = activeFilter === "semua" || p.type === activeFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const filteredTpsDesa = tpsDesaPoints.filter((p) => {
    const matchType = activeFilter === "semua" || activeFilter === "tpsdesa";
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const filteredReports = illegalDumps.filter(
    () => activeFilter === "semua" || activeFilter === "laporan",
  );

  // ─── Init map ─────────────────────────────────────────────────────────────
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

      // ─── Drop points (TPS3R, Bank Sampah, E-Waste) markers
      dropPoints.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], {
          icon: createIcon(point.badgeColor),
        }).addTo(map);
        markersRef.current.push({ id: point.id, marker, point });
        marker.on("click", () => {
          setSelectedPoint({ ...point, isReport: false });
          map.setView([point.lat, point.lng], 15, { animate: true });
        });
      });

      // ─── TPS Desa markers (purple bin icon)
      tpsDesaPoints.forEach((point) => {
        const desaIcon = L.divIcon({
          className: "",
          html: `<div style="width:34px;height:34px;background:#7c3aed;border:3px solid white;border-radius:8px;box-shadow:0 4px 12px rgba(124,58,237,0.35);display:flex;align-items:center;justify-content:center;"><span style="font-size:16px;"></span></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -38],
        });
        const marker = L.marker([point.lat, point.lng], {
          icon: desaIcon,
        }).addTo(map);
        tpsDesaMarkersRef.current.push({ id: point.id, marker, point });
        marker.on("click", () => {
          setSelectedPoint({ ...point, isReport: false });
          map.setView([point.lat, point.lng], 15, { animate: true });
        });
      });

      // ─── Pre-loaded illegal dump markers
      preloadedIllegalDumps.forEach((report) => {
        const reportIcon = L.divIcon({
          className: "",
          html: `<div style="width:32px;height:32px;background:#e03535;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(224,53,53,0.4);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:13px;">⚠</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });
        const marker = L.marker([report.lat, report.lng], {
          icon: reportIcon,
        }).addTo(map);
        reportMarkersRef.current.push({ id: report.id, marker });
        marker.on("click", () => {
          setSelectedPoint({ ...report, isReport: true });
          map.setView([report.lat, report.lng], 15, { animate: true });
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

  // ─── Sync facility markers with filter ───────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    markersRef.current.forEach(({ point, marker }) => {
      const visible = activeFilter === "semua" || activeFilter === point.type;
      if (visible) {
        if (!mapInstanceRef.current.hasLayer(marker))
          marker.addTo(mapInstanceRef.current);
      } else {
        if (mapInstanceRef.current.hasLayer(marker))
          mapInstanceRef.current.removeLayer(marker);
      }
    });
    // Sync TPS Desa markers
    tpsDesaMarkersRef.current.forEach(({ marker }) => {
      const visible = activeFilter === "semua" || activeFilter === "tpsdesa";
      if (visible) {
        if (!mapInstanceRef.current.hasLayer(marker))
          marker.addTo(mapInstanceRef.current);
      } else {
        if (mapInstanceRef.current.hasLayer(marker))
          mapInstanceRef.current.removeLayer(marker);
      }
    });
    if (selectedPoint && !selectedPoint.isReport) {
      if (activeFilter !== "semua" && selectedPoint.type !== activeFilter) {
        setSelectedPoint(null);
      }
    }
  }, [activeFilter]);

  // ─── Sync illegal dump markers with state (user-added only) ──────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    // Remove only user-added (non-preloaded) markers
    reportMarkersRef.current = reportMarkersRef.current.filter(
      ({ id, marker }) => {
        const isPreloaded = preloadedIllegalDumps.some((p) => p.id === id);
        if (!isPreloaded) {
          if (mapInstanceRef.current.hasLayer(marker))
            mapInstanceRef.current.removeLayer(marker);
          return false;
        }
        return true;
      },
    );

    // Toggle visibility of all report markers based on filter
    reportMarkersRef.current.forEach(({ marker }) => {
      const visible = activeFilter === "semua" || activeFilter === "laporan";
      if (visible) {
        if (!mapInstanceRef.current.hasLayer(marker))
          marker.addTo(mapInstanceRef.current);
      } else {
        if (mapInstanceRef.current.hasLayer(marker))
          mapInstanceRef.current.removeLayer(marker);
      }
    });

    if (activeFilter !== "laporan" && activeFilter !== "semua") return;

    // Add newly user-added dumps (not preloaded)
    illegalDumps
      .filter((r) => !r.isPreloaded)
      .filter((r) => !reportMarkersRef.current.some((m) => m.id === r.id))
      .forEach((report) => {
        const reportIcon = L.divIcon({
          className: "",
          html: `<div style="width:32px;height:32px;background:#e03535;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(224,53,53,0.4);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:13px;">⚠</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });
        const marker = L.marker([report.lat, report.lng], {
          icon: reportIcon,
        }).addTo(mapInstanceRef.current);
        reportMarkersRef.current.push({ id: report.id, marker });
        marker.on("click", () => {
          setSelectedPoint({ ...report, isReport: true });
          mapInstanceRef.current.setView([report.lat, report.lng], 15, {
            animate: true,
          });
        });
      });
  }, [illegalDumps, activeFilter]);

  const flyToPoint = (point, isReport = false) => {
    setSelectedPoint({ ...point, isReport });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([point.lat, point.lng], 16, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  // ─── GPS detection for report ─────────────────────────────────────────────
  const detectGps = () => {
    setReportGpsLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setReportGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
        });
        setReportGpsLoading(false);
      },
      () => {
        setReportGps({
          lat: -8.6705,
          lng: 115.2126,
          label: "Denpasar (perkiraan)",
        });
        setReportGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  };

  // ─── Submit illegal dump report ───────────────────────────────────────────
  const handleSubmitReport = () => {
    if (!reportPhoto || !reportGps) return;
    const newReport = {
      id: Date.now(),
      name: `Laporan Sampah Liar #${illegalDumps.filter((d) => !d.isPreloaded).length + 1}`,
      address: reportGps.label,
      meta: new Date().toLocaleString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      }),
      type: "laporan",
      badge: "Sampah Liar",
      badgeColor: "#e03535",
      desc: reportKategori || "Tumpukan sampah liar",
      photoPreview: reportPhotoPreview,
      lat: reportGps.lat,
      lng: reportGps.lng,
      isReport: true,
      isPreloaded: false,
    };
    setIllegalDumps((prev) => [newReport, ...prev]);
    setReportPhoto(null);
    setReportPhotoPreview(null);
    setReportGps(null);
    setReportKategori("");
    setShowReportSheet(false);
    setTimeout(() => flyToPoint(newReport, true), 300);
  };

  const HEADER_H = 130;
  const NAV_H = 74;
  const SHEET_CONTENT_H = 210;
  const BOTTOM_TOTAL = SHEET_CONTENT_H + NAV_H;

  const canSubmitReport = reportPhoto && reportGps;

  // Determine what to show in the bottom list
  const isLaporanFilter = activeFilter === "laporan";
  const isTpsDesaFilter = activeFilter === "tpsdesa";
  const listItems = isLaporanFilter
    ? filteredReports
    : isTpsDesaFilter
      ? filteredTpsDesa
      : activeFilter === "semua"
        ? [...filtered, ...filteredTpsDesa]
        : filtered;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-poppins">
      <div
        className="relative w-full max-w-sm bg-white shadow-xl overflow-hidden"
        style={{ height: "100dvh" }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-white px-4 pt-5 pb-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2 bg-[#f4f4f4] rounded-full px-4 py-2.5">
            <Search size={15} className="text-[#aaa] flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari fasilitas pengumpulan sampah"
              className="flex-1 bg-transparent text-[13px] text-[#333] placeholder:text-[#bbb] outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-[#aaa]" />
              </button>
            )}
          </div>
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
            <p className="text-[12px] font-bold text-[#2d2d2d] mb-1">
              Legenda Titik di Peta
            </p>
            <p className="text-[10px] text-[#aaa] mb-3">
              Berbagai jenis fasilitas & laporan sampah di wilayahmu
            </p>
            {[
              {
                color: "#3da85e",
                label: "TPS3R",
                desc: "Tempat Pengolahan Sampah 3R dikelola desa/komunitas",
              },
              {
                color: "#e0963b",
                label: "Bank Sampah",
                desc: "Menerima setoran material daur ulang harian",
              },
              {
                color: "#4a90d9",
                label: "Dropbox E-Waste",
                desc: "Titik resmi pemerintah/swasta untuk limbah elektronik",
              },
              {
                color: "#7c3aed",
                label: "TPS Desa",
                desc: "Tempat pembuangan sampah resmi tingkat desa",
              },
              {
                color: "#e03535",
                label: "Sampah Liar",
                desc: "Titik sampah buang sembarangan — data awal & laporan warga",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 mb-2">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-[12px] font-semibold text-[#333]">
                    {item.label}
                  </p>
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
          style={{ top: `${HEADER_H}px`, bottom: `${BOTTOM_TOTAL}px` }}
        />

        {/* Loading overlay */}
        {!leafletLoaded && (
          <div
            className="absolute left-0 right-0 flex items-center justify-center bg-[#f6f6f4] z-[999]"
            style={{ top: `${HEADER_H}px`, bottom: `${BOTTOM_TOTAL}px` }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-4 border-[#3da85e] border-t-transparent animate-spin" />
              <p className="text-[13px] text-[#888]">Memuat peta...</p>
            </div>
          </div>
        )}

        {/* FAB — Lapor Sampah Liar */}
        <button
          onClick={() => {
            setShowReportSheet(true);
            detectGps();
          }}
          className="absolute z-[1001] flex items-center gap-2 rounded-full px-4 py-3 text-white text-[12px] font-bold shadow-[0_4px_16px_rgba(224,53,53,0.35)] active:scale-95 transition-transform"
          style={{
            bottom: `${BOTTOM_TOTAL + 72}px`,
            right: "16px",
            backgroundColor: "#e03535",
          }}
        >
          <AlertTriangle size={14} />
          Lapor Sampah
        </button>

        {/* Selected Point Card */}
        {selectedPoint && (
          <div
            className="absolute z-[1001] left-4 right-4 bg-white rounded-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] p-4"
            style={{ bottom: `${BOTTOM_TOTAL + 8}px` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div
                  className="mt-1 flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedPoint.badgeColor + "20" }}
                >
                  {selectedPoint.isReport ? (
                    <AlertTriangle
                      size={16}
                      style={{ color: selectedPoint.badgeColor }}
                    />
                  ) : selectedPoint.type === "tpsdesa" ? (
                    <Trash2
                      size={16}
                      style={{ color: selectedPoint.badgeColor }}
                    />
                  ) : (
                    <MapPin
                      size={16}
                      style={{ color: selectedPoint.badgeColor }}
                    />
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#2d2d2d] leading-snug">
                    {selectedPoint.name}
                  </p>
                  <p className="text-[11px] text-[#888] mt-0.5">
                    {selectedPoint.address}
                  </p>
                  <p className="text-[10px] text-[#aaa] mt-0.5">
                    {selectedPoint.meta}
                  </p>
                  {selectedPoint.desc && (
                    <p className="text-[10px] text-[#aaa] mt-0.5 italic">
                      {selectedPoint.desc}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f2f2]"
              >
                <X size={14} className="text-[#888]" />
              </button>
            </div>
            {selectedPoint.photoPreview && (
              <img
                src={selectedPoint.photoPreview}
                alt="Foto laporan"
                className="mt-3 w-full h-[100px] object-cover rounded-[12px]"
              />
            )}
            <div className="mt-3 flex gap-2">
              {!selectedPoint.isReport && (
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
              )}
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

        {/* Bottom Sheet */}
        <div
          className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.10)]"
          style={{ height: `${BOTTOM_TOTAL}px` }}
        >
          <div className="flex items-center justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-[#e0e0e0]" />
          </div>
          <div className="flex items-center justify-between px-5 pb-2">
            <p className="text-[13px] font-semibold text-[#2d2d2d]">
              {activeFilter === "semua"
                ? "Semua Titik di Peta"
                : activeFilter === "laporan"
                  ? "Titik Sampah Sembarangan"
                  : activeFilter === "tpsdesa"
                    ? "TPS Resmi Per Desa"
                    : filters.find((f) => f.key === activeFilter)?.label}
              <span className="ml-1.5 text-[11px] font-normal text-[#aaa]">
                (
                {activeFilter === "laporan"
                  ? filteredReports.length
                  : activeFilter === "tpsdesa"
                    ? filteredTpsDesa.length
                    : activeFilter === "semua"
                      ? filtered.length +
                        filteredTpsDesa.length +
                        filteredReports.length
                      : filtered.length}
                )
              </span>
            </p>
          </div>

          {/* Scrollable list */}
          <div
            className="overflow-y-auto px-4"
            style={{ height: `${SHEET_CONTENT_H - 60}px` }}
          >
            {activeFilter === "laporan" ? (
              filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-6 text-center">
                  <AlertTriangle size={28} className="text-[#ccc]" />
                  <p className="mt-2 text-[13px] font-semibold text-[#aaa]">
                    Belum ada data sampah liar
                  </p>
                  <p className="text-[11px] text-[#ccc] mt-1">
                    Tekan tombol merah di peta untuk melapor
                  </p>
                </div>
              ) : (
                filteredReports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => flyToPoint(r, true)}
                    className={`w-full flex items-center gap-3 rounded-[16px] px-3 py-3 mb-1.5 text-left transition-colors ${
                      selectedPoint?.id === r.id
                        ? "bg-[#fff0f0]"
                        : "bg-[#fafafa] active:bg-[#f5f5f5]"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 bg-[#fff0f0]">
                      <AlertTriangle size={15} className="text-[#e03535]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#2d2d2d] truncate">
                        {r.name}
                      </p>
                      <p className="text-[10px] text-[#999] mt-0.5 truncate">
                        {r.address}
                      </p>
                    </div>
                    <span className="rounded-full px-2.5 py-1 text-[9px] font-semibold flex-shrink-0 bg-[#fff0f0] text-[#e03535]">
                      {r.isPreloaded ? "Terverifikasi" : "Sampah Liar"}
                    </span>
                  </button>
                ))
              )
            ) : isTpsDesaFilter ? (
              filteredTpsDesa.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-8 text-center">
                  <Trash2 size={28} className="text-[#ccc]" />
                  <p className="mt-2 text-[13px] font-semibold text-[#aaa]">
                    Tidak ada TPS Desa ditemukan
                  </p>
                </div>
              ) : (
                filteredTpsDesa.map((point) => (
                  <button
                    key={point.id}
                    onClick={() => flyToPoint(point)}
                    className={`w-full flex items-center gap-3 rounded-[16px] px-3 py-3 mb-1.5 text-left transition-colors ${
                      selectedPoint?.id === point.id
                        ? "bg-[#f3eeff]"
                        : "bg-[#fafafa] active:bg-[#f5f5f5]"
                    }`}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                      style={{ backgroundColor: "#7c3aed20" }}
                    >
                      <Trash2 size={15} style={{ color: "#7c3aed" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#2d2d2d] truncate">
                        {point.name}
                      </p>
                      <p className="text-[10px] text-[#999] mt-0.5 truncate">
                        {point.meta}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[9px] font-semibold flex-shrink-0"
                      style={{ backgroundColor: "#7c3aed18", color: "#7c3aed" }}
                    >
                      TPS Desa
                    </span>
                  </button>
                ))
              )
            ) : filtered.length === 0 &&
              (activeFilter !== "semua" || filteredTpsDesa.length === 0) ? (
              <div className="flex flex-col items-center justify-center pt-8 text-center">
                <MapPin size={28} className="text-[#ccc]" />
                <p className="mt-2 text-[13px] font-semibold text-[#aaa]">
                  Tidak ada lokasi ditemukan
                </p>
              </div>
            ) : (
              [
                ...filtered,
                ...(activeFilter === "semua" ? filteredTpsDesa : []),
              ].map((point) => (
                <button
                  key={point.id}
                  onClick={() => flyToPoint(point)}
                  className={`w-full flex items-center gap-3 rounded-[16px] px-3 py-3 mb-1.5 text-left transition-colors ${
                    selectedPoint?.id === point.id
                      ? point.type === "tpsdesa"
                        ? "bg-[#f3eeff]"
                        : "bg-[#f0faf3]"
                      : "bg-[#fafafa] active:bg-[#f0f0f0]"
                  }`}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0"
                    style={{ backgroundColor: point.badgeColor + "20" }}
                  >
                    {point.type === "tpsdesa" ? (
                      <Trash2 size={15} style={{ color: point.badgeColor }} />
                    ) : (
                      <MapPin size={15} style={{ color: point.badgeColor }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#2d2d2d] truncate">
                      {point.name}
                    </p>
                    <p className="text-[10px] text-[#999] mt-0.5">
                      {point.meta}
                    </p>
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
              ))
            )}
          </div>
        </div>

        {/* Report Sampah Liar Bottom Sheet */}
        {showReportSheet && (
          <div
            className="fixed inset-0 z-[2000] flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setShowReportSheet(false)}
          >
            <div
              className="w-full max-w-sm rounded-t-[28px] bg-white px-5 pb-8 pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e0e0e0]" />
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-[#e03535]" />
                <h3 className="text-[15px] font-bold text-[#2d2d2d]">
                  Lapor Sampah Buang Sembarangan
                </h3>
              </div>

              {/* Photo */}
              <p className="text-[12px] font-semibold text-[#2d2d2d] mb-2">
                Foto Tumpukan Sampah
              </p>
              <input
                ref={reportFileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setReportPhoto(file);
                  setReportPhotoPreview(URL.createObjectURL(file));
                }}
              />
              {reportPhotoPreview ? (
                <div className="relative mb-3">
                  <img
                    src={reportPhotoPreview}
                    alt="preview"
                    className="h-[140px] w-full object-cover rounded-[16px]"
                  />
                  <button
                    onClick={() => {
                      setReportPhoto(null);
                      setReportPhotoPreview(null);
                    }}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => reportFileRef.current?.click()}
                  className="flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[#e0e0e0] bg-[#fafafa] mb-3 active:bg-[#f5f5f5] transition"
                >
                  <Camera size={20} className="text-[#bbb]" />
                  <p className="text-[11px] text-[#ccc]">
                    Ambil foto kondisi sampah
                  </p>
                </button>
              )}

              {/* GPS */}
              <p className="text-[12px] font-semibold text-[#2d2d2d] mb-2">
                Koordinat GPS
              </p>
              <div className="flex items-center gap-3 rounded-[14px] bg-[#f4f4f4] px-4 py-3 mb-3">
                <MapPin size={15} className="text-[#3da85e] flex-shrink-0" />
                {reportGpsLoading ? (
                  <p className="text-[12px] text-[#aaa]">
                    Mendeteksi lokasi...
                  </p>
                ) : reportGps ? (
                  <p className="text-[12px] text-[#2d2d2d]">
                    {reportGps.label}
                  </p>
                ) : (
                  <p className="text-[12px] text-[#bbb]">
                    Lokasi belum terdeteksi
                  </p>
                )}
              </div>

              {/* Kategori */}
              <p className="text-[12px] font-semibold text-[#2d2d2d] mb-2">
                Jenis Sampah (opsional)
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {["Organik", "Anorganik", "Elektronik", "Campuran"].map((k) => (
                  <button
                    key={k}
                    onClick={() =>
                      setReportKategori(reportKategori === k ? "" : k)
                    }
                    className={`rounded-full px-3 py-1.5 text-[11px] font-medium border transition ${
                      reportKategori === k
                        ? "bg-[#e03535] border-[#e03535] text-white"
                        : "bg-white border-[#e0e0e0] text-[#555]"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmitReport}
                disabled={!canSubmitReport}
                className={`w-full rounded-full py-3.5 text-[13px] font-bold transition ${
                  canSubmitReport
                    ? "bg-[#e03535] text-white shadow-[0_4px_14px_rgba(224,53,53,0.3)] active:bg-[#c42d2d]"
                    : "bg-[#ddd] text-white cursor-not-allowed"
                }`}
              >
                Tandai di Peta
              </button>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}
