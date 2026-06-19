import { useNavigate } from "react-router-dom";
import { ArrowLeft, PackageCheck, Clock } from "lucide-react";
import { useOrderStore } from "../store/orderStore";
import BottomNav from "../components/layout/BottomNav";

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

const statusColors = {
  "Sedang Dikemas": "bg-[#fff7e6] text-[#e07a00]",
  "Dikirim": "bg-[#e6f4ff] text-[#006cb5]",
  "Selesai": "bg-[#e8f7ee] text-[#3da85e]",
  "Dibatalkan": "bg-[#ffeaea] text-[#e03535]",
};

export default function PesananSaya() {
  const navigate = useNavigate();
  const orders = useOrderStore((s) => s.orders);

  return (
    <div className="min-h-screen bg-[#f6f6f4] pb-28">
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
            <h1 className="text-[16px] font-bold text-[#2d2d2d]">Pesanan Saya</h1>
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <PackageCheck size={60} className="text-[#e0e0e0] mb-4" />
            <p className="text-[15px] font-semibold text-[#555] mb-1">Belum ada pesanan</p>
            <p className="text-[13px] text-[#aaa] mb-6">Pesanan kamu akan muncul di sini setelah kamu berhasil checkout.</p>
            <button
              onClick={() => navigate("/market")}
              className="rounded-full bg-[#3da85e] px-6 py-2.5 text-[13px] font-semibold text-white"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-3 px-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-[18px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#aaa]" />
                    <span className="text-[11px] text-[#aaa]">{order.date}</span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                      statusColors[order.status] || "bg-[#f2f2f2] text-[#888]"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 mb-2 last:mb-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-[60px] w-[60px] rounded-[10px] object-cover flex-shrink-0"
                      width="60"
                      height="60"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-[#2d2d2d] line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#aaa]">
                        {item.variantLabel} · x{item.quantity}
                      </p>
                      <p className="text-[12px] font-bold text-[#e03535] mt-0.5">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Divider */}
                <div className="h-px bg-[#f0f0f0] my-3" />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#888]">Total Pembayaran</span>
                  <span className="text-[13px] font-bold text-[#3da85e]">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
