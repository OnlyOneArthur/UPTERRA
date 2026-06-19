import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Share2,
  ShoppingBag,
  MoreHorizontal,
  MapPin,
  Bookmark,
  Store,
  MessageSquare,
  ShoppingCart,
  X,
} from "lucide-react";

const productData = {
  1: {
    id: 1,
    title: "keyboard apple mac second ...",
    fullTitle: "Keyboard Apple Mac Second Berkualitas | Wireless Magic Keyboard",
    price: 750000,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewCount: 12,
    sold: 8,
    location: "bandung, jawa timur",
    variants: [
      { id: "a", label: "silver", color: "#c0c0c0" },
      { id: "b", label: "space gray", color: "#5a5a5a" },
    ],
  },
  2: {
    id: 2,
    title: "Tas kerajinan daur ulang plastik dan kulit serbaguna | tas belanja | tas barang",
    fullTitle: "Tas kerajinan daur ulang plastik dan kulit serbaguna | tas belanja | tas barang",
    price: 450000,
    image: "https://images.unsplash.com/photo-1614179818511-3da2ebe7c3a0?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewCount: 20,
    sold: 21,
    location: "bandung, jawa timur",
    variants: [
      { id: "a", label: "coklat plastik", color: "#8B6347" },
    ],
  },
  3: {
    id: 3,
    title: "kerajinan pot dari botol kaca",
    fullTitle: "Kerajinan Pot Unik dari Botol Kaca Daur Ulang | Dekorasi Rumah Eco",
    price: 45000,
    image: "https://images.unsplash.com/photo-1585813507835-9f12abaafc00?auto=format&fit=crop&w=600&q=80",
    rating: 4.3,
    reviewCount: 7,
    sold: 15,
    location: "surabaya, jawa timur",
    variants: [
      { id: "a", label: "hijau", color: "#4caf50" },
      { id: "b", label: "bening", color: "#e0f7fa" },
    ],
  },
  4: {
    id: 4,
    title: "RAM laptop 8GB second DDR4",
    fullTitle: "RAM Laptop 8GB Second DDR4 2400MHz | Garansi 3 Bulan",
    price: 280000,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewCount: 5,
    sold: 3,
    location: "jakarta, dki jakarta",
    variants: [
      { id: "a", label: "8GB", color: "#4CAF50" },
      { id: "b", label: "16GB", color: "#2196F3" },
    ],
  },
};

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = productData[id] || productData[2];

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSheet, setShowSheet] = useState(false);
  const [sheetMode, setSheetMode] = useState("cart"); // 'cart' | 'buy'

  const openSheet = (mode) => {
    setSheetMode(mode);
    setShowSheet(true);
  };

  const handleCartConfirm = () => {
    setShowSheet(false);
    navigate("/cart");
  };

  const handleBuyConfirm = () => {
    setShowSheet(false);
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-md relative">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-5">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md active:bg-gray-100"
          >
            <X size={18} className="text-[#333]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-md flex-1 min-w-[140px]">
              <Search size={14} className="text-[#aaa]" />
              <span className="text-[12px] text-[#bbb]">Cari produk second</span>
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md">
              <Share2 size={16} className="text-[#333]" />
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md">
              <ShoppingBag size={16} className="text-[#333]" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3da85e] text-[9px] font-bold text-white">
                6
              </span>
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md">
              <MoreHorizontal size={16} className="text-[#333]" />
            </button>
          </div>
        </div>

        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image}
            alt={product.fullTitle}
            className="w-full h-[340px] object-cover"
            width="400"
            height="340"
            loading="lazy"
          />
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1">
            <span className="text-[11px] text-white">1 / 1</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white px-5 pt-4 pb-3">
          <p className="text-[22px] font-bold text-[#e03535] leading-tight">
            {formatPrice(product.price)}
          </p>

          <div className="mt-2 flex items-center gap-1.5">
            <MapPin size={12} className="text-[#aaa] flex-shrink-0" />
            <span className="text-[12px] text-[#aaa]">{product.location}</span>
          </div>

          <h1 className="mt-2 text-[14px] font-semibold text-[#2d2d2d] leading-snug">
            {product.fullTitle}
          </h1>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-[12px] font-semibold text-[#444]">{product.rating}</span>
                <span className="text-[12px] text-[#aaa]">({product.reviewCount})</span>
              </div>
              <span className="text-[#ddd]">|</span>
              <span className="text-[12px] text-[#aaa]">{product.sold} terjual</span>
            </div>
            <button>
              <Bookmark size={20} className="text-[#aaa]" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-2 bg-[#f4f4f4]" />

        {/* Variants */}
        <div className="bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#2d2d2d]">
              Jenis produk yang tersedia
            </span>
            <ArrowLeft size={16} className="text-[#aaa] rotate-180" />
          </div>
          <div className="mt-3 flex gap-2">
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
                  className="h-5 w-5 rounded-md border border-[#ddd] flex-shrink-0"
                  style={{ backgroundColor: v.color }}
                />
                <span className="text-[11px] text-[#444]">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-2 bg-[#f4f4f4]" />

        {/* Delivery Estimate */}
        <div className="bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#3da85e]" />
            <span className="text-[12px] text-[#555]">
              akan sampai pada 3 – 5 Juni
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-[#f0f0f0] px-5 py-3 flex items-center gap-3">
          <button className="flex items-center justify-center" onClick={() => navigate("/chat/" + product.id)}>
            <Store size={22} className="text-[#3da85e]" />
            <span className="sr-only">Toko</span>
          </button>
          <button className="flex items-center justify-center" onClick={() => navigate("/chat/" + product.id)}>
            <MessageSquare size={22} className="text-[#555]" />
            <span className="sr-only">Obrolan</span>
          </button>
          <button
            onClick={() => openSheet("cart")}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#3da85e] py-3 text-[13px] font-semibold text-[#3da85e] active:bg-[#f0faf3] transition-colors"
          >
            <ShoppingCart size={17} />
            ke keranjang
          </button>
          <button
            onClick={() => openSheet("buy")}
            className="flex flex-1 items-center justify-center rounded-full bg-[#3da85e] py-3 text-[13px] font-semibold text-white active:bg-[#2d8f50] transition-colors"
          >
            Beli Sekarang
          </button>
        </div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-24" />
      </div>

      {/* Bottom Sheet Overlay */}
      {showSheet && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowSheet(false)}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white rounded-t-[24px] shadow-2xl">
            {/* Sheet title */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <span className="text-[13px] font-semibold text-[#2d2d2d]">
                {product.title}
              </span>
              <button onClick={() => setShowSheet(false)}>
                <X size={18} className="text-[#aaa]" />
              </button>
            </div>

            {/* Sheet Product Preview */}
            <div className="px-5 flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
              <img
                src={product.image}
                alt={product.title}
                className="h-[60px] w-[60px] rounded-[12px] object-cover flex-shrink-0"
                width="60"
                height="60"
                loading="lazy"
              />
              <div>
                <p className="text-[16px] font-bold text-[#e03535]">
                  {formatPrice(product.price)}
                </p>
                {selectedVariant && (
                  <p className="text-[11px] text-[#888] mt-0.5">
                    {selectedVariant.label}
                  </p>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            <div className="px-5 pt-4">
              <p className="text-[12px] font-semibold text-[#555] mb-2">Jenis produk yang tersedia</p>
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
                onClick={sheetMode === "cart" ? handleCartConfirm : handleBuyConfirm}
                className="w-full rounded-full bg-[#3da85e] py-4 text-[14px] font-bold text-white active:bg-[#2d8f50] transition-colors"
              >
                {sheetMode === "cart" ? "Tambah ke Keranjang" : "Beli Sekarang"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
