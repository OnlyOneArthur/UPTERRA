import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Bookmark, ShoppingCart, ChevronRight } from "lucide-react";
import BottomNav from "../components/layout/BottomNav";

const products = [
  {
    id: 1,
    title: "keyboard apple mac second kondisi mulus",
    price: 750000,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    location: "bandung, jawa timur",
    rating: 4.2,
    reviews: 15,
    sold: 8,
    variants: [{ label: "hitam", color: "#2d2d2d" }, { label: "putih", color: "#f0f0f0" }],
    description:
      "Keyboard Apple Mac kondisi second mulus, tidak ada kerusakan berarti. Cocok untuk pengguna MacBook yang membutuhkan pengganti keyboard.",
  },
  {
    id: 2,
    title: "Tas kerajinan daur ulang plastik dan kulit serbaguna | tas belanja | tas barang",
    price: 100000,
    image:
      "https://images.unsplash.com/photo-1614179818511-3da2ebe7c3a0?auto=format&fit=crop&w=800&q=80",
    location: "bandung, jawa timur",
    rating: 4.7,
    reviews: 20,
    sold: 21,
    variants: [{ label: "coklat plastik", color: "#c4a882" }],
    description:
      "Tas serbaguna hasil daur ulang plastik dan kulit, cocok untuk belanja harian. Ramah lingkungan dan kuat.",
  },
  {
    id: 3,
    title: "kerajinan pot dari botol kaca bekas",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1585813507835-9f12abaafc00?auto=format&fit=crop&w=800&q=80",
    location: "surabaya, jawa timur",
    rating: 4.5,
    reviews: 8,
    sold: 12,
    variants: [{ label: "hijau", color: "#6bc47a" }, { label: "bening", color: "#e0f7ff" }],
    description:
      "Pot tanaman unik dari botol kaca bekas. Cocok untuk mempercantik sudut ruangan atau meja kerja.",
  },
  {
    id: 4,
    title: "RAM laptop 8GB second DDR4",
    price: 280000,
    image:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
    location: "jakarta, DKI jakarta",
    rating: 4.8,
    reviews: 32,
    sold: 45,
    variants: [{ label: "8GB DDR4", color: "#a0c4ff" }],
    description:
      "RAM laptop second 8GB DDR4, sudah ditest berfungsi normal. Cocok untuk upgrade laptop lama.",
  },
];

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === parseInt(id)) || products[1];

  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0].label);

  return (
    <div className="min-h-screen bg-[#f6f6f4] font-poppins">
      <div className="mx-auto max-w-md pb-36">
        {/* Top bar */}
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]"
          >
            <ArrowLeft size={18} className="text-[#555]" />
          </button>

          <div className="mx-3 flex flex-1 items-center gap-2 rounded-full bg-[#f4f4f4] px-4 py-2">
            <span className="flex-1 text-[12px] text-[#bbb]">Cari produk second</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]">
              <Share2 size={16} className="text-[#555]" />
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#3da85e]">
              <ShoppingCart size={17} className="text-white" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-[#3da85e] text-[9px] font-bold text-[#3da85e]">
                6
              </span>
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#555]">
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
            </button>
          </div>
        </header>

        {/* Product Image */}
        <div className="relative bg-white">
          <img
            src={product.image}
            alt={product.title}
            className="h-[260px] w-full object-cover"
            width="480"
            height="260"
            loading="lazy"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white">
            1 / 1
          </span>
        </div>

        {/* Product Info */}
        <div className="bg-white px-5 py-4">
          <p className="text-[22px] font-bold text-[#e03535]">{formatPrice(product.price)}</p>
          <div className="mt-1 flex items-center gap-1 text-[#8a8a8a]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-[11px]">{product.location}</span>
          </div>
          <h1 className="mt-2 text-[14px] font-semibold leading-snug text-[#2d2d2d]">{product.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-yellow-400 text-[14px]">★</span>
            <span className="text-[12px] font-medium text-[#555]">{product.rating}</span>
            <span className="text-[12px] text-[#aaa]">({product.reviews})</span>
            <span className="mx-1 text-[#ddd]">|</span>
            <span className="text-[12px] text-[#aaa]">{product.sold} terjual</span>
            <button className="ml-auto">
              <Bookmark size={18} className="text-[#aaa]" />
            </button>
          </div>
        </div>

        {/* Variants */}
        <div className="mt-2 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#2d2d2d]">Jenis produk yang tersedia</p>
            <ChevronRight size={16} className="text-[#aaa]" />
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {product.variants.map((v) => (
              <button
                key={v.label}
                onClick={() => setSelectedVariant(v.label)}
                className={`flex flex-col items-center rounded-[10px] border px-3 py-2 text-[11px] font-medium transition ${
                  selectedVariant === v.label
                    ? "border-[#3da85e] bg-[#f0faf3] text-[#3da85e]"
                    : "border-[#e0e0e0] bg-[#f9f9f9] text-[#888]"
                }`}
              >
                <div
                  className="h-8 w-8 rounded-[6px] mb-1"
                  style={{ backgroundColor: v.color }}
                />
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div className="mt-2 bg-white px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[14px]">🚚</span>
            <span className="text-[11px] text-[#555]">akan sampai pada 3 - 5 Juni</span>
          </div>
        </div>

        {/* Description */}
        <div className="mt-2 bg-white px-5 py-4">
          <p className="text-[13px] font-semibold text-[#2d2d2d]">Deskripsi Produk</p>
          <p className="mt-2 text-[12px] leading-relaxed text-[#666]">{product.description}</p>
        </div>

        {/* Store */}
        <div className="mt-2 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3da85e]">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z" fill="white" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2d2d2d]">UPTERRA Store</p>
              <p className="text-[10px] text-[#aaa]">Bandung, Jawa Barat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 bg-white px-5 pt-3 pb-6 shadow-[0_-4px_18px_rgba(0,0,0,0.08)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#2d2d2d]">Kuantitas</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd] text-[#555] text-lg"
            >
              −
            </button>
            <span className="min-w-[20px] text-center text-[14px] font-semibold text-[#2d2d2d]">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd] text-[#555] text-lg"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#3da85e] py-3 text-[13px] font-semibold text-[#3da85e]">
            <ShoppingCart size={16} />
            ke keranjang
          </button>
          <button className="flex-1 rounded-full bg-[#3da85e] py-3 text-[13px] font-bold text-white">
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
