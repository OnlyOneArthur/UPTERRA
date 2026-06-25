import { useState } from "react";
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
  ShoppingCart,
  X,
} from "lucide-react";

const quickActions = [
  { label: "Pesanan", icon: ClipboardList },
  { label: "Percakapan", icon: MessageSquare },
  { label: "Alamat", icon: MapPin },
  { label: "Riwayat", icon: RotateCcw },
  { label: "Metode Pembayaran", icon: CreditCard },
  { label: "Mulai Penjualan", icon: Store },
];

const categories = ["Semua", "Produk Populer", "komponen PC", "Tas", "Sparepart"];

export const products = [
  {
    id: 1,
    title: "keyboard apple mac second ...",
    price: 750000,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    rating: null,
    sold: null,
    variants: [
      { id: "a", label: "silver", color: "#c0c0c0" },
      { id: "b", label: "space gray", color: "#5a5a5a" },
    ],
  },
  {
    id: 2,
    title: "tas kerajinan daur ulang bah...",
    price: 100000,
    image: "https://images.unsplash.com/photo-1614179818511-3da2ebe7c3a0?auto=format&fit=crop&w=400&q=80",
    rating: 4.7,
    sold: 21,
    variants: [
      { id: "a", label: "coklat plastik", color: "#8B6347" },
    ],
  },
  {
    id: 3,
    title: "kerajinan pot dari botol kaca",
    price: 45000,
    image: "https://images.unsplash.com/photo-1585813507835-9f12abaafc00?auto=format&fit=crop&w=400&q=80",
    rating: null,
    sold: null,
    variants: [
      { id: "a", label: "hijau", color: "#4caf50" },
      { id: "b", label: "bening", color: "#e0f7fa" },
    ],
  },
  {
    id: 4,
    title: "RAM laptop 8GB second DDR4",
    price: 280000,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80",
    rating: null,
    sold: null,
    variants: [
      { id: "a", label: "8GB", color: "#4CAF50" },
      { id: "b", label: "16GB", color: "#2196F3" },
    ],
  },
];

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

// ─── Bottom Sheet (shared between cart & buy) ───────────────────────────────
function ProductSheet({ product, mode, onClose, onConfirm }) {
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white rounded-t-[24px] shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#e0e0e0]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3">
          <span className="text-[13px] font-semibold text-[#2d2d2d] line-clamp-1">
            {product.title}
          </span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2f2f2] flex-shrink-0"
          >
            <X size={15} className="text-[#888]" />
          </button>
        </div>

        {/* Product Preview */}
        <div className="px-5 flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
          <img
            src={product.image}
            alt={product.title}
            className="h-[60px] w-[60px] rounded-[12px] object-cover flex-shrink-0"
            width="60"
            height="60"
          />
          <div>
            <p className="text-[16px] font-bold text-[#e03535]">
              {formatPrice(product.price)}
            </p>
            {selectedVariant && (
              <p className="text-[11px] text-[#888] mt-0.5">
                Varian: {selectedVariant.label}
              </p>
            )}
          </div>
        </div>

        {/* Variant Selector */}
        {product.variants?.length > 0 && (
          <div className="px-5 pt-4">
            <p className="text-[12px] font-semibold text-[#555] mb-2">
              Pilih Varian
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 transition-all ${
                    selectedVariant?.id === v.id
                      ? "border-[#3da85e] bg-[#f0faf3]"
                      : "border-[#e0e0e0] bg-white"
                  }`}
                >
                  <div
                    className="h-5 w-5 rounded-md border border-[#ddd]"
                    style={{ backgroundColor: v.color }}
                  />
                  <span className="text-[11px] text-[#444]">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#2d2d2d]">Kuantitas</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f2] text-[18px] font-bold text-[#555] active:bg-[#e0e0e0]"
            >
              −
            </button>
            <span className="text-[15px] font-semibold text-[#2d2d2d] min-w-[16px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f2] text-[18px] font-bold text-[#555] active:bg-[#e0e0e0]"
            >
              +
            </button>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="px-5 pb-8 pt-2">
          <button
            onClick={() => onConfirm({ product, variant: selectedVariant, quantity, mode })}
            className="w-full rounded-full bg-[#3da85e] py-4 text-[14px] font-bold text-white active:bg-[#2d8f50] transition-colors"
          >
            {mode === "cart" ? "Tambah ke Keranjang" : "Beli Sekarang"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Market Page ────────────────────────────────────────────────────────
export default function Market() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sheet, setSheet] = useState(null); // { product, mode }
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const openSheet = (e, product, mode) => {
    e.stopPropagation(); // prevent card click from navigating
    setSheet({ product, mode });
  };

  const handleConfirm = ({ mode }) => {
    if (mode === "cart") {
      setCartCount((c) => c + 1);
      setSheet(null);
      // optionally show a toast here
    } else {
      setSheet(null);
      navigate("/cart");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="bg-white px-5 pt-6 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
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
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]">
                <Settings size={17} className="text-[#555]" />
              </button>
              <button
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]"
                onClick={() => navigate("/cart")}
              >
                <ShoppingBag size={17} className="text-[#555]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3da85e] text-[9px] font-bold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex items-center gap-3 rounded-full bg-[#f4f4f4] px-4 py-3">
            <Search size={16} className="text-[#aaa] flex-shrink-0" />
            <span className="flex-1 text-[13px] text-[#bbb]">Cari produk second</span>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="bg-white px-4 pb-5 pt-4">
          <div className="grid grid-cols-6 gap-1">
            {quickActions.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="flex flex-col items-center gap-1.5 active:opacity-70"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f2f2f2]">
                  <Icon size={19} className="text-[#555]" />
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
            <div className="relative z-10 max-w-[58%]">
              <h2 className="text-[13px] font-bold leading-snug text-white">
                Selamat datang di UPTERRA marketplace
              </h2>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/80">
                100% produk daur ulang dan elektronik second berkualitas
              </p>
              <button className="mt-3 rounded-full border border-white px-4 py-1.5 text-[11px] font-semibold text-white active:bg-white/10">
                Lihat Produk
              </button>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
        <div className="mt-5 flex gap-0 overflow-x-auto px-5 pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 text-[12px] font-semibold transition-all ${
                activeCategory === cat
                  ? "border-b-2 border-[#3da85e] text-[#3da85e]"
                  : "text-[#aaa]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="mt-3 grid grid-cols-2 gap-3 px-4 pb-28">
          {products.map((product) => (
            // ── Outer: div (not button) to allow nested buttons ──
            <div
              key={product.id}
              className="overflow-hidden rounded-[18px] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.07)] flex flex-col"
            >
              {/* Clickable image + info area → navigate to detail */}
              <button
                onClick={() => navigate(`/market/${product.id}`)}
                className="text-left active:opacity-90 transition-opacity flex-1"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-[140px] w-full object-cover"
                  width="200"
                  height="140"
                  loading="lazy"
                />
                <div className="px-3 pt-2.5 pb-1">
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

              {/* ── Action Buttons Row ── */}
              <div className="flex gap-1.5 px-2.5 pb-2.5 pt-1">
                <button
                  onClick={(e) => openSheet(e, product, "cart")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-full border border-[#3da85e] py-2 text-[10px] font-semibold text-[#3da85e] active:bg-[#f0faf3] transition-colors"
                >
                  <ShoppingCart size={11} />
                  Keranjang
                </button>
                <button
                  onClick={(e) => openSheet(e, product, "buy")}
                  className="flex flex-1 items-center justify-center rounded-full bg-[#3da85e] py-2 text-[10px] font-semibold text-white active:bg-[#2d8f50] transition-colors"
                >
                  Beli
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sheet */}
      {sheet && (
        <ProductSheet
          product={sheet.product}
          mode={sheet.mode}
          onClose={() => setSheet(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
