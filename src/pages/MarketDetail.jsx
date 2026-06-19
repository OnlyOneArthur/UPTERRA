import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Share2, Bookmark, MapPin, MessageSquare, ShoppingCart, ChevronRight } from "lucide-react";
import { products } from "./Market";

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === Number(id));

  const [selectedVariant, setSelectedVariant] = useState(
    product ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [showSheet, setShowSheet] = useState(false);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#888]">Produk tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div className="mx-auto max-w-md">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 mx-auto max-w-md flex items-center justify-between px-4 pt-5">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow"
            aria-label="Tutup"
          >
            <X size={18} className="text-[#333]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f4]">
              <input
                type="text"
                placeholder="Cari produk second"
                className="absolute left-9 w-36 rounded-full bg-[#f4f4f4] px-3 py-1.5 text-[12px] outline-none placeholder:text-[#bbb]"
                aria-label="Cari produk"
              />
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow" aria-label="Bagikan">
              <Share2 size={16} className="text-[#333]" />
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow" aria-label="Keranjang">
              <ShoppingCart size={16} className="text-[#333]" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3da85e] text-[9px] font-bold text-white">6</span>
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur shadow" aria-label="Opsi">
              <span className="text-[18px] leading-none text-[#333]">···</span>
            </button>
          </div>
        </div>

        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image}
            alt={product.title}
            className="h-[320px] w-full object-cover"
            width="400"
            height="320"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white">
            1 / 1
          </span>
        </div>

        {/* Product Info */}
        <div className="px-5 pt-4 pb-32">
          <p className="text-[22px] font-bold text-[#e03535]">{formatPrice(product.price)}</p>

          <div className="mt-2 flex items-center gap-1.5">
            <MapPin size={12} className="text-[#888]" />
            <span className="text-[12px] text-[#888]">{product.location}</span>
          </div>

          <h1 className="mt-2 text-[14px] font-semibold leading-snug text-[#2d2d2d]">
            {product.title}
          </h1>

          {product.rating && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-yellow-400 text-[13px]">★</span>
              <span className="text-[12px] font-semibold text-[#444]">{product.rating}</span>
              <span className="text-[12px] text-[#888]">({product.sold && Math.ceil(product.sold / 2)})</span>
              <span className="text-[#ccc]">|</span>
              <span className="text-[12px] text-[#888]">{product.sold} terjual</span>
              <button className="ml-auto" aria-label="Simpan">
                <Bookmark size={18} className="text-[#aaa]" />
              </button>
            </div>
          )}

          {/* Variants */}
          <div className="mt-4">
            <button
              onClick={() => setShowSheet(true)}
              className="flex w-full items-center justify-between rounded-[14px] border border-[#eee] px-4 py-3"
            >
              <span className="text-[13px] font-medium text-[#444]">Jenis produk yang tersedia</span>
              <ChevronRight size={16} className="text-[#aaa]" />
            </button>

            <div className="mt-3 flex gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.label}
                  onClick={() => setSelectedVariant(v)}
                  className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[11px] transition-all ${
                    selectedVariant?.label === v.label
                      ? "border-[#3da85e] bg-[#f0faf4]"
                      : "border-[#eee] bg-white"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-[#ddd]"
                    style={{ background: v.color }}
                  />
                  <span className="text-[#555]">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery */}
          <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-[#f8f8f8] px-4 py-3">
            <span className="text-[12px] text-[#3da85e]">🚚</span>
            <span className="text-[12px] text-[#555]">
              akan sampai pada 3 - 5 Juni
            </span>
          </div>

          {/* Toko & Obrolan bottom row */}
          <div className="mt-5 flex items-center gap-4 border-t border-[#f2f2f2] pt-4">
            <button className="flex items-center gap-1.5 text-[12px] text-[#555]">
              <span className="text-[16px]">🏪</span> Toko
            </button>
            <button className="flex items-center gap-1.5 text-[12px] text-[#555]">
              <MessageSquare size={15} /> Obrolan
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 bg-white px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/cart")}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#3da85e] px-4 py-3 text-[13px] font-semibold text-[#3da85e]"
            >
              <ShoppingCart size={16} />
              ke keranjang
            </button>
            <button className="flex flex-1 items-center justify-center rounded-full bg-[#3da85e] px-4 py-3 text-[13px] font-semibold text-white">
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Variant Bottom Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSheet(false)}
          />
          <div className="relative mx-auto w-full max-w-md rounded-t-[24px] bg-white px-5 pt-5 pb-8 shadow-xl">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#2d2d2d]">detail produk - jenis produk yang tersedia</span>
            </div>

            {/* Variant Product Card */}
            <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-[#f8f8f8] p-3">
              <img
                src={product.image}
                alt={product.title}
                className="h-14 w-14 rounded-[10px] object-cover"
                width="56"
                height="56"
              />
              <div>
                <p className="text-[15px] font-bold text-[#e03535]">
                  {selectedVariant ? formatPrice(product.price) : formatPrice(product.price)}
                </p>
                <p className="text-[11px] text-[#888]">
                  {selectedVariant?.label ?? product.variants[0].label}
                </p>
              </div>
            </div>

            {/* Variant Picker */}
            <p className="mt-4 text-[12px] font-semibold text-[#2d2d2d]">Pilih Varian</p>
            <div className="mt-2 flex gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.label}
                  onClick={() => setSelectedVariant(v)}
                  className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[11px] transition-all ${
                    selectedVariant?.label === v.label
                      ? "border-[#3da85e] bg-[#f0faf4]"
                      : "border-[#eee] bg-white"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-[#ddd]"
                    style={{ background: v.color }}
                  />
                  <span className="text-[#555]">{v.label}</span>
                </button>
              ))}
            </div>

            {/* Quantity */}
            <p className="mt-4 text-[12px] font-semibold text-[#2d2d2d]">Kuantitas</p>
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[18px] text-[#555]"
                aria-label="Kurang"
              >
                −
              </button>
              <span className="min-w-[20px] text-center text-[14px] font-semibold text-[#2d2d2d]">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[18px] text-[#555]"
                aria-label="Tambah"
              >
                +
              </button>
            </div>

            {/* Sheet Bottom Bar */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => { setShowSheet(false); navigate("/cart"); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#3da85e] px-4 py-3 text-[13px] font-semibold text-[#3da85e]"
              >
                <ShoppingCart size={16} />
                ke keranjang
              </button>
              <button className="flex flex-1 items-center justify-center rounded-full bg-[#3da85e] px-4 py-3 text-[13px] font-semibold text-white">
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
