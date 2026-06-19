import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import { products } from "./Market";

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

// Simulated cart state — in a real app this would come from global store/context
const initialCartItems = [
  { productId: 2, variant: "coklat plastik", quantity: 1 },
];

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [showSheet, setShowSheet] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [sheetQty, setSheetQty] = useState(1);

  const getProduct = (id) => products.find((p) => p.id === id);

  const updateQty = (index, delta) => {
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const openSheet = (index) => {
    setActiveItem(index);
    setSheetQty(cartItems[index].quantity);
    setShowSheet(true);
  };

  const applySheet = () => {
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === activeItem ? { ...item, quantity: sheetQty } : item
      )
    );
    setShowSheet(false);
  };

  const total = cartItems.reduce((sum, item) => {
    const p = getProduct(item.productId);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  return (
    <div className="relative min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md pb-32">
        {/* Header */}
        <header className="bg-white px-5 pt-6 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} className="text-[#333]" />
            </button>
            <h1 className="text-[16px] font-bold text-[#2d2d2d]">Keranjang</h1>
          </div>
        </header>

        {/* Cart Items */}
        <div className="mt-3 flex flex-col gap-3 px-5">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingCart size={48} className="text-[#ccc] mb-4" />
              <p className="text-[14px] font-semibold text-[#888]">Keranjang kamu kosong</p>
              <p className="text-[12px] text-[#aaa] mt-1">Yuk mulai belanja produk second berkualitas!</p>
              <button
                onClick={() => navigate("/market")}
                className="mt-5 rounded-full bg-[#3da85e] px-6 py-2.5 text-[13px] font-semibold text-white"
              >
                Lihat Produk
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              return (
                <div
                  key={index}
                  className="rounded-[18px] bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
                >
                  {/* Shop label */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#3da85e]">
                      🏪 {product.title.split(" ").slice(0, 3).join(" ")}
                    </span>
                    <button
                      onClick={() => removeItem(index)}
                      aria-label="Hapus"
                      className="text-[#ccc] hover:text-[#e03535]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Item row */}
                  <div className="flex items-start gap-3">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-[72px] w-[72px] rounded-[12px] object-cover flex-shrink-0"
                      width="72"
                      height="72"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <p className="text-[12px] font-medium leading-snug text-[#3d3d3d] line-clamp-2">
                        {product.title}
                      </p>
                      <p className="mt-1 text-[11px] text-[#aaa]">{item.variant}</p>
                      <p className="mt-1 text-[13px] font-bold text-[#e03535]">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity row */}
                  <div className="mt-3 flex items-center justify-between border-t border-[#f2f2f2] pt-3">
                    <span className="text-[11px] text-[#888]">
                      Subtotal:{" "}
                      <span className="font-bold text-[#2d2d2d]">
                        {formatPrice(product.price * item.quantity)}
                      </span>
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQty(index, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd] text-[16px] text-[#555]"
                        aria-label="Kurang"
                      >
                        −
                      </button>
                      <span className="min-w-[16px] text-center text-[13px] font-semibold text-[#2d2d2d]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(index, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd] text-[16px] text-[#555]"
                        aria-label="Tambah"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 bg-white px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] text-[#888]">
              Total ({cartItems.length} item)
            </span>
            <span className="text-[16px] font-bold text-[#e03535]">
              {formatPrice(total)}
            </span>
          </div>
          <button
            onClick={() => navigate("/pesanan")}
            className="w-full rounded-full bg-[#3da85e] py-3.5 text-[14px] font-semibold text-white"
          >
            Beli Sekarang
          </button>
        </div>
      )}

      {/* Bottom Sheet */}
      {showSheet && activeItem !== null && (() => {
        const item = cartItems[activeItem];
        const product = getProduct(item.productId);
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowSheet(false)}
            />
            <div className="relative mx-auto w-full max-w-md rounded-t-[24px] bg-white px-5 pt-5 pb-8 shadow-xl">
              {/* Sheet title */}
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#3da85e]">
                  <ShoppingCart size={11} className="text-white" />
                </span>
                <span className="text-[12px] font-bold text-[#2d2d2d]">
                  detail produk - jenis produk yang tersedia
                </span>
              </div>

              {/* Item card */}
              <div className="flex items-center gap-3 rounded-[14px] bg-[#f8f8f8] p-3">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-14 w-14 rounded-[10px] object-cover flex-shrink-0"
                  width="56"
                  height="56"
                />
                <div>
                  <p className="text-[13px] font-bold text-[#e03535]">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-[11px] text-[#888] mt-0.5">{item.variant}</p>
                </div>
              </div>

              {/* Quantity */}
              <p className="mt-4 text-[12px] font-semibold text-[#2d2d2d]">Kuantitas</p>
              <div className="mt-2 flex items-center gap-4">
                <button
                  onClick={() => setSheetQty((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[18px] text-[#555]"
                  aria-label="Kurang"
                >
                  −
                </button>
                <span className="min-w-[20px] text-center text-[14px] font-semibold text-[#2d2d2d]">
                  {sheetQty}
                </span>
                <button
                  onClick={() => setSheetQty((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[18px] text-[#555]"
                  aria-label="Tambah"
                >
                  +
                </button>
              </div>

              {/* Sheet actions */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={applySheet}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#3da85e] px-4 py-3 text-[13px] font-semibold text-[#3da85e]"
                >
                  <ShoppingCart size={15} />
                  ke keranjang
                </button>
                <button
                  onClick={() => { applySheet(); navigate("/pesanan"); }}
                  className="flex flex-1 items-center justify-center rounded-full bg-[#3da85e] px-4 py-3 text-[13px] font-semibold text-white"
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
