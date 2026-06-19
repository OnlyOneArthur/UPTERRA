import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Share2,
  ShoppingBag,
  MoreVertical,
  MapPin,
  Bookmark,
  ChevronRight,
  MessageSquare,
  Store,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";

const productData = {
  1: {
    id: 1,
    title: "Keyboard Apple Mac Second",
    fullTitle:
      "Keyboard apple mac second berkualitas | keyboard wireless | keyboard bluetooth",
    price: 750000,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    reviews: 12,
    sold: 8,
    location: "bandung, jawa timur",
    variants: [
      { id: 1, label: "putih", color: "#e8e8e8" },
      { id: 2, label: "hitam", color: "#2d2d2d" },
    ],
    deliveryDate: "3 - 5 Juni",
  },
  2: {
    id: 2,
    title: "Tas Kerajinan Daur Ulang Plastik dan Kulit Serbaguna",
    fullTitle:
      "Tas kerajinan daur ulang plastik dan kulit serbaguna | tas belanja | tas barang",
    price: 450000,
    image:
      "https://images.unsplash.com/photo-1614179818511-3da2ebe7c3a0?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 20,
    sold: 21,
    location: "bandung, jawa timur",
    variants: [
      { id: 1, label: "coklat plastik", color: "#c9a96e" },
      { id: 2, label: "hitam kulit", color: "#2d2d2d" },
    ],
    deliveryDate: "3 - 5 Juni",
  },
  3: {
    id: 3,
    title: "Kerajinan Pot Dari Botol Kaca",
    fullTitle:
      "Kerajinan pot dari botol kaca daur ulang | pot bunga unik | dekorasi rumah",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1585813507835-9f12abaafc00?auto=format&fit=crop&w=800&q=80",
    rating: 4.3,
    reviews: 7,
    sold: 15,
    location: "surabaya, jawa timur",
    variants: [{ id: 1, label: "natural", color: "#8fbc8f" }],
    deliveryDate: "4 - 6 Juni",
  },
  4: {
    id: 4,
    title: "RAM Laptop 8GB Second DDR4",
    fullTitle: "RAM laptop 8GB second DDR4 | memori laptop | upgrade RAM",
    price: 280000,
    image:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviews: 9,
    sold: 33,
    location: "jakarta, dki jakarta",
    variants: [
      { id: 1, label: "8GB", color: "#5b8dd9" },
      { id: 2, label: "16GB", color: "#7c4dbb" },
    ],
    deliveryDate: "2 - 4 Juni",
  },
};

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Parse id as number to correctly look up productData
  const product = productData[Number(id)] || productData[2];

  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.totalCount());
  const addOrder = useOrderStore((s) => s.addOrder);

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSheet, setShowSheet] = useState(false);
  const [sheetMode, setSheetMode] = useState("buy"); // 'buy' | 'cart'
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const openSheet = (mode) => {
    // Reset quantity each time sheet opens
    setQuantity(1);
    setSheetMode(mode);
    setShowSheet(true);
  };

  const handleConfirm = () => {
    setShowSheet(false);
    if (sheetMode === "cart") {
      addItem(product, selectedVariant, quantity);
      showToast("Produk ditambahkan ke keranjang!");
    } else {
      // Beli Sekarang: create order immediately and go to pesanan
      addOrder(
        [{ ...product, variantLabel: selectedVariant.label, quantity }],
        product.price * quantity
      );
      navigate("/pesanan");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md">
        {/* Toast */}
        {toast && (
          <div className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-[#2d2d2d] px-5 py-2.5 shadow-lg">
            <span className="text-[13px] font-medium text-white">{toast}</span>
          </div>
        )}

        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image}
            alt={product.title}
            className="h-[340px] w-full object-cover"
            width="450"
            height="340"
            loading="lazy"
          />

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-4">
            <button
              aria-label="Kembali"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md active:bg-white"
            >
              <X size={18} className="text-[#333]" />
            </button>
            <div className="flex items-center gap-2">
              <button
                aria-label="Bagikan"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md"
              >
                <Share2 size={16} className="text-[#333]" />
              </button>
              <button
                aria-label="Keranjang"
                onClick={() => navigate("/cart")}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md"
              >
                <ShoppingBag size={16} className="text-[#333]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3da85e] text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                aria-label="Lainnya"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md"
              >
                <MoreVertical size={16} className="text-[#333]" />
              </button>
            </div>
          </div>

          {/* Image counter */}
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1">
            <span className="text-[11px] font-medium text-white">1 / 1</span>
          </div>
        </div>

        {/* Product Info Card */}
        <div className="bg-white px-5 pt-5 pb-4">
          <p className="text-[22px] font-bold text-[#e03535]">
            {formatPrice(product.price)}
          </p>
          <div className="mt-2 flex items-center gap-1">
            <MapPin size={13} className="text-[#aaa]" />
            <span className="text-[12px] text-[#aaa]">{product.location}</span>
          </div>
          <h1 className="mt-3 text-[15px] font-semibold leading-snug text-[#2d2d2d]">
            {product.fullTitle}
          </h1>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-[14px]">★</span>
              <span className="text-[13px] font-semibold text-[#3d3d3d]">
                {product.rating}
              </span>
              <span className="text-[12px] text-[#bbb]">({product.reviews})</span>
              <span className="text-[#ddd] mx-1">|</span>
              <span className="text-[12px] text-[#888]">{product.sold} terjual</span>
            </div>
            <button
              aria-label="Simpan"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="text-[#ccc] active:scale-90 transition-transform"
            >
              <Bookmark
                size={20}
                className={
                  isBookmarked
                    ? "fill-[#3da85e] text-[#3da85e]"
                    : "text-[#ccc]"
                }
              />
            </button>
          </div>
        </div>

        <div className="h-2 bg-[#f0f0f0]" />

        {/* Variants */}
        <div className="bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#2d2d2d]">
              Jenis produk yang tersedia
            </span>
            <ChevronRight size={16} className="text-[#ccc]" />
          </div>
          <div className="mt-3 flex gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`h-11 w-11 rounded-[10px] border-2 transition-all ${
                  selectedVariant.id === v.id
                    ? "border-[#3da85e] scale-105"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: v.color }}
                aria-label={v.label}
              />
            ))}
          </div>
        </div>

        <div className="h-2 bg-[#f0f0f0]" />

        {/* Delivery */}
        <div className="bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#3da85e]">🚚</span>
            <span className="text-[13px] text-[#555]">
              akan sampai pada {product.deliveryDate}
            </span>
          </div>
        </div>

        {/* Store & Chat */}
        <div className="bg-white px-5 py-3 flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-[12px] text-[#888]">
            <Store size={18} />
            <span>Toko</span>
          </button>
          <button className="flex items-center gap-1.5 text-[12px] text-[#888]">
            <MessageSquare size={18} />
            <span>obrolan</span>
          </button>
        </div>

        {/* Bottom bar spacer */}
        <div className="h-28" />

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white px-5 py-4 shadow-[0_-6px_20px_rgba(0,0,0,0.07)] z-30">
          <div className="flex gap-3">
            <button
              onClick={() => openSheet("cart")}
              className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border border-[#3da85e] py-3.5 text-[14px] font-semibold text-[#3da85e] active:bg-[#f0faf3] transition-colors"
            >
              <ShoppingBag size={17} />
              ke keranjang
            </button>
            <button
              onClick={() => openSheet("buy")}
              className="flex flex-1 items-center justify-center rounded-[14px] bg-[#3da85e] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(61,168,94,0.35)] active:bg-[#2f9050] transition-colors"
            >
              Beli Sekarang
            </button>
          </div>
        </div>

        {/* Bottom Sheet */}
        {showSheet && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setShowSheet(false)}
            />
            <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-[28px] bg-white px-5 pt-5 pb-8 shadow-[0_-8px_32px_rgba(0,0,0,0.14)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#e0e0e0]" />

              {/* Product preview */}
              <div className="flex items-center gap-3 mb-5">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-[70px] w-[70px] rounded-[12px] object-cover"
                  width="70"
                  height="70"
                  loading="lazy"
                />
                <div>
                  <p className="text-[20px] font-bold text-[#e03535]">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-[12px] text-[#999] mt-0.5">
                    {selectedVariant.label}
                  </p>
                </div>
              </div>

              <div className="h-px bg-[#f0f0f0] mb-4" />

              {/* Quantity */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[14px] font-semibold text-[#2d2d2d]">Kuantitas</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-[#555] active:bg-[#f5f5f5]"
                    aria-label="Kurangi"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-[16px] font-semibold text-[#2d2d2d] min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] text-[#555] active:bg-[#f5f5f5]"
                    aria-label="Tambah"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className="w-full rounded-[14px] bg-[#3da85e] py-4 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(61,168,94,0.3)] active:bg-[#2f9050] transition-colors"
              >
                {sheetMode === "buy" ? "Beli Sekarang" : "Masukkan ke Keranjang"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
