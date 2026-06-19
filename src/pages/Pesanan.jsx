import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { products } from "./Market";

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

const tabs = [
  { key: "semua", label: "Semua" },
  { key: "bayar", label: "Bayar" },
  { key: "mengirim", label: "Mengirim" },
  { key: "menerima", label: "Menerima" },
  { key: "ulasan", label: "Ulasan" },
  { key: "dikembalikan", label: "Dikembalikan" },
];

// Simulated orders data
const orders = [
  {
    id: "ORD-001",
    status: "mengirim",
    statusLabel: "Sedang Dikirim",
    statusColor: "#3da85e",
    date: "19 Jun 2026",
    items: [{ productId: 2, variant: "coklat plastik", quantity: 1 }],
  },
  {
    id: "ORD-002",
    status: "bayar",
    statusLabel: "Menunggu Pembayaran",
    statusColor: "#e08c00",
    date: "18 Jun 2026",
    items: [{ productId: 1, variant: "silver", quantity: 1 }],
  },
];

export default function Pesanan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("semua");

  const filtered =
    activeTab === "semua"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md pb-10">
        {/* Header */}
        <header className="bg-white px-5 pt-6 pb-0 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 pb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} className="text-[#333]" />
            </button>
            <h1 className="text-[16px] font-bold text-[#2d2d2d]">Pesanan Saya</h1>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-[#f0f0f0]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap px-4 py-3 text-[12px] font-semibold transition-all relative ${
                  activeTab === tab.key
                    ? "text-[#3da85e]"
                    : "text-[#aaa]"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3da85e] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Orders List */}
        <div className="mt-3 flex flex-col gap-3 px-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Package size={48} className="text-[#ccc] mb-4" />
              <p className="text-[14px] font-semibold text-[#888]">Belum ada pesanan</p>
              <p className="text-[12px] text-[#aaa] mt-1">Pesanan kamu akan muncul di sini</p>
              <button
                onClick={() => navigate("/market")}
                className="mt-5 rounded-full bg-[#3da85e] px-6 py-2.5 text-[13px] font-semibold text-white"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            filtered.map((order) => {
              const totalPrice = order.items.reduce((sum, item) => {
                const p = products.find((p) => p.id === item.productId);
                return sum + (p ? p.price * item.quantity : 0);
              }, 0);

              return (
                <div
                  key={order.id}
                  className="rounded-[18px] bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-[#888]">
                      {order.id} · {order.date}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                      style={{
                        color: order.statusColor,
                        background: order.statusColor + "18",
                      }}
                    >
                      {order.statusLabel}
                    </span>
                  </div>

                  {/* Items */}
                  {order.items.map((item, i) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-[64px] w-[64px] rounded-[12px] object-cover flex-shrink-0"
                          width="64"
                          height="64"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <p className="text-[12px] font-medium leading-snug text-[#3d3d3d] line-clamp-2">
                            {product.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#aaa]">{item.variant}</p>
                          <p className="mt-0.5 text-[11px] text-[#888]">
                            {item.quantity}x ·{" "}
                            <span className="font-semibold text-[#2d2d2d]">
                              {formatPrice(product.price)}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Order footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-[#f2f2f2] pt-3">
                    <span className="text-[11px] text-[#888]">
                      Total Pesanan:{" "}
                      <span className="font-bold text-[#2d2d2d]">
                        {formatPrice(totalPrice)}
                      </span>
                    </span>
                    <div className="flex gap-2">
                      {order.status === "menerima" && (
                        <button className="rounded-full border border-[#3da85e] px-3 py-1.5 text-[11px] font-semibold text-[#3da85e]">
                          Beri Ulasan
                        </button>
                      )}
                      {order.status === "mengirim" && (
                        <button className="rounded-full border border-[#3da85e] px-3 py-1.5 text-[11px] font-semibold text-[#3da85e]">
                          Lacak Pesanan
                        </button>
                      )}
                      {order.status === "bayar" && (
                        <button className="rounded-full bg-[#3da85e] px-3 py-1.5 text-[11px] font-semibold text-white">
                          Bayar Sekarang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
