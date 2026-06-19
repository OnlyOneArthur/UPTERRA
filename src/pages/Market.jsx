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
} from "lucide-react";
import BottomNav from "../components/layout/BottomNav";
import { useCartStore } from "../store/cartStore";

const quickActions = [
  { label: "Pesanan", icon: ClipboardList, route: "/pesanan" },
  { label: "Percakapan", icon: MessageSquare, route: null },
  { label: "Alamat", icon: MapPin, route: null },
  { label: "Riwayat", icon: RotateCcw, route: null },
  { label: "Metode Pembayaran", icon: CreditCard, route: null },
  { label: "Mulai Penjualan", icon: Store, route: null },
];

const categories = ["Semua", "Produk Populer", "komponen PC", "Tas", "Sparepart"];

const products = [
  {
    id: 1,
    title: "keyboard apple mac second hand",
    price: 750000,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    rating: null,
    sold: null,
  },
  {
    id: 2,
    title: "tas kerajinan daur ulang plastik dan kulit serbaguna | ...",
    price: 450000,
    image:
      "https://images.unsplash.com/photo-1614179818511-3da2ebe7c3a0?auto=format&fit=crop&w=400&q=80",
    rating: 4.7,
    sold: 21,
  },
  {
    id: 3,
    title: "kerajinan pot dari botol kaca",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1585813507835-9f12abaafc00?auto=format&fit=crop&w=400&q=80",
    rating: null,
    sold: null,
  },
  {
    id: 4,
    title: "RAM laptop 8GB second DDR4",
    price: 280000,
    image:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80",
    rating: null,
    sold: null,
  },
];

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

export default function Market() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.totalCount());

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md pb-28">
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
            <div className="flex items-center gap-3">
              <button
                aria-label="Settings"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]"
              >
                <Settings size={17} className="text-[#666]" />
              </button>
              <button
                aria-label="Keranjang"
                onClick={() => navigate("/cart")}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]"
              >
                <ShoppingBag size={17} className="text-[#666]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#3da85e] text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-full bg-[#f4f4f4] px-4 py-3">
            <Search size={15} className="text-[#bbb]" />
            <span className="flex-1 text-[13px] text-[#c0c0c0]">
              Cari produk second
            </span>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="bg-white px-5 pb-5 pt-4">
          <div className="grid grid-cols-6 gap-1">
            {quickActions.map(({ label, icon: Icon, route }) => (
              <button
                key={label}
                onClick={() => route && navigate(route)}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#f2f2f2]">
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
            <div className="relative z-10 max-w-[58%]">
              <h2 className="text-[14px] font-bold leading-snug text-white">
                Selamat datang di UPTERRA marketplace
              </h2>
              <p className="mt-1 text-[10px] leading-relaxed text-white/80">
                100% produk daur ulang dan elektronik second berkualitas
              </p>
              <button className="mt-3 rounded-full border border-white px-4 py-1.5 text-[11px] font-semibold text-white active:bg-white/20">
                Lihat Produk
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=180&q=80"
              alt="produk unggulan"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-[90px] w-[90px] rounded-[12px] object-cover opacity-90"
              width="90"
              height="90"
              loading="lazy"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-5 flex gap-1 overflow-x-auto px-5 pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 text-[12px] font-semibold transition-all ${
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
        <div className="mt-3 grid grid-cols-2 gap-3 px-5">
          {products.map((product) => (
            <button
              key={product.id}
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
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
