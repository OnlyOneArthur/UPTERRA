import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ClipboardList,
  MessageSquare,
  MapPin,
  RotateCcw,
  CreditCard,
  Store,
  ShoppingBag,
  Settings,
  X,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";

const quickActions = [
  { label: "Pesanan", icon: ClipboardList, path: "/pesanan" },
  { label: "Percakapan", icon: MessageSquare, path: null },
  { label: "Alamat", icon: MapPin, path: null },
  { label: "Riwayat", icon: RotateCcw, path: null },
  { label: "Metode Pembayaran", icon: CreditCard, path: null },
  { label: "Mulai Penjualan", icon: Store, path: null },
];

const categories = [
  "Semua",
  "Produk Populer",
  "komponen PC",
  "Tas",
  "Sparepart",
];

export const products = [
  // ── komponen PC ─────────────────────────────────────────────────────────────
  {
    id: 1,
    title: "Keyboard Apple Magic Keyboard second hand",
    price: 750000,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    rating: 4.5,
    sold: 8,
    category: "komponen PC",
    location: "Bandung, Jawa Barat",
    description:
      "Apple Magic Keyboard second hand kondisi mulus, tuts semua berfungsi normal. Sudah dibersihkan.",
    variants: [
      { label: "silver", color: "#C0C0C0" },
      { label: "space gray", color: "#4a4a4a" },
    ],
  },
  {
    id: 2,
    title: "RAM Laptop 8GB DDR4 second pull-out tested",
    price: 280000,
    image:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80",
    rating: 4.3,
    sold: 15,
    category: "komponen PC",
    location: "Jakarta, DKI Jakarta",
    description:
      "RAM laptop DDR4 8GB second pull-out dari laptop, masih berfungsi normal dan telah ditest.",
    variants: [
      { label: "8GB", color: "#3498db" },
      { label: "16GB", color: "#9b59b6" },
    ],
  },
  {
    id: 3,
    title: "Mouse Logitech MX Master 3 second mulus",
    price: 480000,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80",
    rating: 4.8,
    sold: 12,
    category: "komponen PC",
    location: "Surabaya, Jawa Timur",
    description:
      "Mouse Logitech MX Master 3 second, kondisi sangat baik. Scroll wheel dan semua tombol normal.",
    variants: [
      { label: "hitam", color: "#1a1a1a" },
      { label: "abu", color: "#888888" },
    ],
  },
  {
    id: 4,
    title: "SSD 256GB SATA second laptop desktop",
    price: 195000,
    image:
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80",
    rating: 4.2,
    sold: 30,
    category: "komponen PC",
    location: "Medan, Sumatera Utara",
    description:
      "SSD SATA 256GB second, sudah diformat dan siap pakai. Health 95%+ semua merk acak.",
    variants: [
      { label: "256GB", color: "#27ae60" },
      { label: "512GB", color: "#2980b9" },
    ],
  },

  // ── Tas ─────────────────────────────────────────────────────────────────────
  {
    id: 5,
    title: "Tas kerajinan daur ulang plastik dan kulit serbaguna",
    price: 450000,
    image: "../assets/images/tas-daur-ulang.svg",
    rating: 4.7,
    sold: 21,
    category: "Tas",
    location: "Bandung, Jawa Barat",
    description:
      "Tas kerajinan tangan dari daur ulang plastik dan kulit, serbaguna untuk belanja maupun barang harian.",
    variants: [
      { label: "coklat plastik", color: "#8B6914" },
      { label: "hitam kulit", color: "#1a1a1a" },
    ],
  },
  {
    id: 6,
    title: "Totebag kanvas daur ulang bahan karung goni",
    price: 85000,
    image:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=400&q=80",
    rating: 4.6,
    sold: 44,
    category: "Tas",
    location: "Yogyakarta, DIY",
    description:
      "Totebag ramah lingkungan dari bahan karung goni daur ulang. Kuat dan bisa dipakai belanja harian.",
    variants: [
      { label: "natural", color: "#C4A882" },
      { label: "hitam", color: "#1a1a1a" },
    ],
  },
  {
    id: 7,
    title: "Tas anyaman rotan mini hand bag wanita",
    price: 125000,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80",
    rating: 4.9,
    sold: 58,
    category: "Tas",
    location: "Bali, Bali",
    description:
      "Tas anyaman rotan asli buatan pengrajin lokal Bali. Cocok untuk hangout maupun ke pantai.",
    variants: [
      { label: "natural", color: "#C4A882" },
      { label: "coklat tua", color: "#5D3A1A" },
    ],
  },

  // ── Sparepart ───────────────────────────────────────────────────────────────
  {
    id: 8,
    title: "Baterai laptop Asus VivoBook second ori",
    price: 150000,
    image:
      "https://images.unsplash.com/photo-1603539947678-cd3954ed515d?auto=format&fit=crop&w=400&q=80",
    rating: 4.1,
    sold: 19,
    category: "Sparepart",
    location: "Jakarta, DKI Jakarta",
    description:
      "Baterai laptop Asus VivoBook second original, kapasitas masih 80%+. Cocok untuk pengganti baterai drop.",
    variants: [
      { label: "3 cell", color: "#27ae60" },
      { label: "4 cell", color: "#2980b9" },
    ],
  },
  {
    id: 9,
    title: "Charger laptop universal 65W second good",
    price: 95000,
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
    rating: 4.0,
    sold: 27,
    category: "Sparepart",
    location: "Bandung, Jawa Barat",
    description:
      "Charger laptop universal 65W second, sudah ditest berfungsi normal. Cocok untuk berbagai merek.",
    variants: [
      { label: "Type-C", color: "#555" },
      { label: "barrel", color: "#888" },
    ],
  },
  {
    id: 10,
    title: "Layar LCD laptop 14 inch FHD second",
    price: 380000,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80",
    rating: 4.4,
    sold: 9,
    category: "Sparepart",
    location: "Surabaya, Jawa Timur",
    description:
      "Panel layar LCD 14 inch FHD IPS second, tidak ada dead pixel, backlight merata.",
    variants: [
      { label: "FHD IPS", color: "#3498db" },
      { label: "HD TN", color: "#7f8c8d" },
    ],
  },

  // ── Produk Populer (daur ulang / kerajinan) ──────────────────────────────────
  {
    id: 11,
    title: "Pot kerajinan dari botol kaca daur ulang",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80",
    rating: 4.6,
    sold: 63,
    category: "Produk Populer",
    location: "Surabaya, Jawa Timur",
    description:
      "Pot cantik dari botol kaca daur ulang, cocok untuk tanaman hias mini di meja atau jendela.",
    variants: [
      { label: "bening", color: "#d6eaf8" },
      { label: "hijau", color: "#2ecc71" },
    ],
  },
  {
    id: 12,
    title: "Lampu hias dari botol kaca dan kayu bekas",
    price: 135000,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80",
    rating: 4.8,
    sold: 37,
    category: "Produk Populer",
    location: "Yogyakarta, DIY",
    description:
      "Lampu hias aesthetic dari botol kaca dan kayu palet bekas. Cocok untuk dekorasi kamar atau cafe.",
    variants: [
      { label: "warm white", color: "#FFD580" },
      { label: "cool white", color: "#EAF4FF" },
    ],
  },
  {
    id: 13,
    title: "Dompet anyaman dari plastik daur ulang warna-warni",
    price: 55000,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80",
    rating: 4.5,
    sold: 82,
    category: "Produk Populer",
    location: "Malang, Jawa Timur",
    description:
      "Dompet handmade dari kantong plastik daur ulang yang dianyam rapi. Unik, kuat, dan ramah lingkungan.",
    variants: [
      { label: "warna-warni", color: "#e74c3c" },
      { label: "monokrom", color: "#555" },
    ],
  },
];

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

export default function Market() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.totalCount());
  const searchRef = useRef(null);

  // Combined filter: category + search query
  const filtered = products.filter((p) => {
    const matchesCategory =
      activeCategory === "Semua" || p.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const clearSearch = () => {
    setSearchQuery("");
    searchRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md pb-24">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white px-5 pt-6 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3da85e]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"
                    fill="white"
                  />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-[#2d2d2d] tracking-tight">
                UPTERRA
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]"
                aria-label="Settings"
              >
                <Settings size={16} className="text-[#555]" />
              </button>
              <button
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]"
                aria-label="Keranjang"
                onClick={() => navigate("/cart")}
              >
                <ShoppingBag size={18} className="text-[#555]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3da85e] text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div
            className={`mt-4 flex items-center gap-3 rounded-full px-4 py-3 transition-all ${
              isSearchFocused
                ? "bg-white border-2 border-[#3da85e] shadow-[0_0_0_3px_rgba(61,168,94,0.12)]"
                : "bg-[#f4f4f4] border-2 border-transparent"
            }`}
          >
            <Search
              size={16}
              className={isSearchFocused ? "text-[#3da85e]" : "text-[#aaa]"}
            />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Cari produk second..."
              className="flex-1 bg-transparent text-[13px] text-[#2d2d2d] outline-none placeholder:text-[#bbb]"
              aria-label="Cari produk"
            />
            {searchQuery.length > 0 && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearSearch}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ccc] active:bg-[#bbb]"
                aria-label="Hapus pencarian"
              >
                <X size={11} className="text-white" />
              </button>
            )}
          </div>
        </header>

        {/* ── Search Results Mode ── */}
        {searchQuery.trim() !== "" ? (
          <div className="px-5 pt-4">
            <p className="mb-3 text-[12px] text-[#888]">
              {filtered.length > 0
                ? `${filtered.length} hasil untuk "${searchQuery}"`
                : `Tidak ada hasil untuk "${searchQuery}"`}
            </p>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-[14px] font-semibold text-[#2d2d2d]">
                  Produk tidak ditemukan
                </p>
                <p className="mt-1 text-[12px] text-[#aaa] max-w-[220px]">
                  Coba kata kunci lain atau lihat kategori yang tersedia
                </p>
                <button
                  onClick={clearSearch}
                  className="mt-5 rounded-full bg-[#3da85e] px-6 py-2 text-[12px] font-semibold text-white"
                >
                  Lihat Semua Produk
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Normal Browse Mode ── */
          <>
            {/* Quick Actions */}
            <div className="bg-white px-5 pb-5 pt-4">
              <div className="grid grid-cols-6 gap-1">
                {quickActions.map(({ label, icon: Icon, path }) => (
                  <button
                    key={label}
                    onClick={() => path && navigate(path)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f2f2f2]">
                      <Icon size={20} className="text-[#555]" />
                    </div>
                    <span className="text-center text-[9px] leading-tight text-[#777]">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Banner */}
            <div className="mx-5 mt-4">
              <div className="relative overflow-hidden rounded-[20px] bg-[#3da85e] px-5 py-5">
                <div className="relative z-10 max-w-[55%]">
                  <h2 className="text-[14px] font-bold leading-snug text-white">
                    Selamat datang di UPTERRA marketplace
                  </h2>
                  <p className="mt-1 text-[10px] leading-relaxed text-white/80">
                    100% produk daur ulang dan elektronik second berkualitas
                  </p>
                  <button className="mt-3 rounded-full border border-white px-4 py-1.5 text-[11px] font-semibold text-white">
                    Lihat Produk
                  </button>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <img
                    src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=180&q=80"
                    alt="produk featured"
                    className="h-[90px] w-[90px] rounded-[12px] object-cover opacity-90"
                    width="90"
                    height="90"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mt-5 flex gap-1 overflow-x-auto px-5 pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-semibold transition-all ${
                    activeCategory === cat
                      ? "text-[#3da85e] border-b-2 border-[#3da85e]"
                      : "text-[#aaa]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="mt-3 grid grid-cols-2 gap-3 px-5">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  navigate={navigate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, navigate }) {
  return (
    <button
      onClick={() => navigate(`/market/${product.id}`)}
      className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.07)] text-left active:scale-[0.98] transition-transform"
    >
      <img
        src={product.image}
        alt={product.title}
        className="h-[150px] w-full object-cover"
        width="200"
        height="150"
        loading="lazy"
      />
      <div className="px-3 py-2.5">
        <p className="text-[12px] font-medium leading-snug text-[#3d3d3d] line-clamp-2">
          {product.title}
        </p>
        <p className="mt-1 text-[13px] font-bold text-[#e03535]">
          {formatPrice(product.price)}
        </p>
        {product.rating && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[11px] text-yellow-400">★</span>
            <span className="text-[10px] text-[#888]">
              {product.rating} | {product.sold} terjual
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
