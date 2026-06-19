import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

export default function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const addOrder = useOrderStore((s) => s.addOrder);

  const handleCheckout = () => {
    if (items.length === 0) return;
    addOrder(items, totalPrice);
    clearCart();
    navigate("/pesanan");
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white px-5 pt-12 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Kembali"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f2] active:bg-[#e8e8e8]"
            >
              <ArrowLeft size={18} className="text-[#333]" />
            </button>
            <h1 className="text-[16px] font-bold text-[#2d2d2d]">Keranjang</h1>
            {items.length > 0 && (
              <span className="ml-1 rounded-full bg-[#3da85e] px-2.5 py-0.5 text-[11px] font-bold text-white">
                {items.length}
              </span>
            )}
          </div>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <ShoppingCart size={60} className="text-[#e0e0e0] mb-4" />
            <p className="text-[15px] font-semibold text-[#555] mb-1">Keranjang kosong</p>
            <p className="text-[13px] text-[#aaa] mb-6">Yuk tambahkan produk ke keranjang kamu!</p>
            <button
              onClick={() => navigate("/market")}
              className="rounded-full bg-[#3da85e] px-6 py-2.5 text-[13px] font-semibold text-white"
            >
              Belanja Sekarang
            </button>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-3 px-5">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.variantId}`}
                  className="flex gap-3 rounded-[18px] bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-[80px] w-[80px] rounded-[12px] object-cover flex-shrink-0"
                    width="80"
                    height="80"
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-medium leading-snug text-[#2d2d2d] line-clamp-2">
                        {item.title}
                      </p>
                      <button
                        onClick={() => removeItem(item.id, item.variantId)}
                        aria-label="Hapus"
                        className="text-[#ddd] active:text-[#e03535] transition-colors flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#aaa]">{item.variantLabel}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[13px] font-bold text-[#e03535]">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.variantId, item.quantity - 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#555] text-[16px] font-semibold active:bg-[#f5f5f5]"
                          aria-label="Kurangi"
                        >
                          −
                        </button>
                        <span className="text-[13px] font-semibold text-[#2d2d2d] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.variantId, item.quantity + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e0e0e0] text-[#555] text-[16px] font-semibold active:bg-[#f5f5f5]"
                          aria-label="Tambah"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mx-5 mt-4 rounded-[18px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <p className="text-[13px] font-semibold text-[#2d2d2d] mb-2">Ringkasan</p>
              <div className="flex justify-between">
                <span className="text-[12px] text-[#888]">Total</span>
                <span className="text-[13px] font-bold text-[#e03535]">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="px-5 mt-5 pb-10">
              <button
                onClick={handleCheckout}
                className="w-full rounded-[14px] bg-[#3da85e] py-4 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(61,168,94,0.3)] active:bg-[#2f9050] transition-colors"
              >
                Beli Sekarang · {formatPrice(totalPrice)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
