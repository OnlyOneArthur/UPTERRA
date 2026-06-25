import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ShoppingBag, MapPin, Recycle, CheckCheck } from "lucide-react";
import BottomNav from "../components/layout/BottomNav";

const notificationData = [
  {
    id: 1,
    type: "order",
    title: "Pesanan Dikonfirmasi",
    message: "Pesananmu #ORD-2024-001 telah dikonfirmasi oleh penjual dan sedang diproses.",
    time: "2 menit lalu",
    read: false,
  },
  {
    id: 2,
    type: "report",
    title: "Laporan Ditindaklanjuti",
    message: "Laporan sampah liar di Jl. Gatot Subroto telah diterima dan petugas sedang menuju lokasi.",
    time: "1 jam lalu",
    read: false,
  },
  {
    id: 3,
    type: "recycle",
    title: "Poin Recycling Bertambah!",
    message: "Kamu mendapatkan 150 poin dari penukaran limbah elektronik di TPS3R Sidakarya.",
    time: "3 jam lalu",
    read: false,
  },
  {
    id: 4,
    type: "order",
    title: "Barang Dalam Pengiriman",
    message: "Pesananmu #ORD-2024-002 sedang dalam perjalanan. Estimasi tiba 1-2 hari kerja.",
    time: "Kemarin, 15:30",
    read: true,
  },
  {
    id: 5,
    type: "report",
    title: "Laporan Selesai Ditangani",
    message: "Laporan tumpukan sampah di Jl. Imam Bonjol telah selesai ditangani. Terima kasih kontribusimu!",
    time: "Kemarin, 10:00",
    read: true,
  },
  {
    id: 6,
    type: "recycle",
    title: "Promo Drop Point Terdekat",
    message: "TPS3R Ubung Gemilang membuka sesi penukaran limbah elektronik gratis penjemputan hari ini!",
    time: "2 hari lalu",
    read: true,
  },
  {
    id: 7,
    type: "order",
    title: "Pesanan Selesai",
    message: "Pesananmu #ORD-2024-000 telah diterima. Jangan lupa beri ulasan untuk penjual!",
    time: "3 hari lalu",
    read: true,
  },
];

const iconMap = {
  order: { icon: ShoppingBag, bg: "bg-[#e8f6ff]", color: "text-[#5aa7d8]" },
  report: { icon: MapPin, bg: "bg-[#fff4e5]", color: "text-[#e0963b]" },
  recycle: { icon: Recycle, bg: "bg-[#eaf7ee]", color: "text-[#3da85e]" },
};

export default function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(notificationData);
  const [activeTab, setActiveTab] = useState("Semua");

  const tabs = ["Semua", "Pesanan", "Laporan", "Recycling"];
  const tabMap = { Semua: null, Pesanan: "order", Laporan: "report", Recycling: "recycle" };

  const filtered = activeTab === "Semua"
    ? notifications
    : notifications.filter((n) => n.type === tabMap[activeTab]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-poppins">
      <div className="w-full max-w-sm min-h-screen bg-[#f6f6f4] flex flex-col shadow-xl">
        {/* Header */}
        <div className="bg-white px-5 pt-6 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0] text-[#555] active:bg-[#e0e0e0] transition"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-[17px] font-bold text-[#1f1f1f]">Notifikasi</h1>
                {unreadCount > 0 && (
                  <p className="text-[11px] text-[#7b7b7b]">{unreadCount} belum dibaca</p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#2d9b57] active:opacity-70"
              >
                <CheckCheck size={15} />
                Tandai Semua
              </button>
            )}
          </div>

          {/* Tabs — pt-3 gives room above so unread badges are not clipped */}
          <div className="mt-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              const tabUnread =
                tab === "Semua"
                  ? unreadCount
                  : notifications.filter(
                      (n) => n.type === tabMap[tab] && !n.read
                    ).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${
                    isActive
                      ? "bg-[#238B45] text-white"
                      : "bg-[#f0f0f0] text-[#8a8a8a]"
                  }`}
                >
                  {tab}
                  {tabUnread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {tabUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf7ee]">
                <Bell size={28} className="text-[#7ec993]" />
              </div>
              <p className="mt-4 text-[14px] font-semibold text-[#555]">Belum ada notifikasi</p>
              <p className="mt-1 text-[12px] text-[#aaa]">Notifikasi akan muncul di sini</p>
            </div>
          ) : (
            filtered.map((notif) => {
              const { icon: Icon, bg, color } = iconMap[notif.type];
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`flex items-start gap-3 rounded-[18px] px-4 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer active:opacity-80 transition ${
                    notif.read ? "bg-white" : "bg-white border-l-4 border-[#238B45]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${bg}`}
                  >
                    <Icon size={18} className={color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-[13px] leading-snug ${
                          notif.read
                            ? "font-medium text-[#3d3d3d]"
                            : "font-bold text-[#1f1f1f]"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#238B45]" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#8a8a8a] line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="mt-1.5 text-[10px] text-[#b5b5b5]">{notif.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
