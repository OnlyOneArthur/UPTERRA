import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  History,
  FileText,
  Globe,
  Bell,
  HelpCircle,
  Shield,
  UserPlus,
  Info,
  LogOut,
  X,
  Camera,
  Check,
} from "lucide-react";
import BottomNav from "../components/layout/BottomNav";
import profileImg from "../assets/images/profile.svg";

const menuSections = [
  {
    title: "Akun",
    items: [
      { label: "Riwayat Scan", icon: History, meta: null, route: null },
      { label: "Laporan Saya", icon: FileText, meta: null, route: "/laporan-saya" },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      { label: "Bahasa", icon: Globe, meta: "Indonesia", route: null },
      { label: "Notifikasi", icon: Bell, meta: "Aktif", route: null },
      { label: "FAQ", icon: HelpCircle, meta: null, route: null },
      { label: "Kebijakan Privasi", icon: Shield, meta: null, route: null },
    ],
  },
  {
    title: "Lainnya",
    items: [
      { label: "Undang Teman", icon: UserPlus, meta: null, route: null },
      { label: "Tentang UPTERRA", icon: Info, meta: null, route: null },
    ],
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [user, setUser] = useState({
    name: "Aneke Putri",
    email: "anekeputri@gmail.com",
  });
  const [editForm, setEditForm] = useState({ name: user.name, email: user.email });

  const handleSave = () => {
    if (editForm.name.trim()) {
      setUser({ name: editForm.name.trim(), email: editForm.email.trim() });
    }
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md pb-28">

        {/* Top Bar */}
        <header className="flex items-center justify-between px-5 pt-6 pb-2">
          <h1 className="text-[16px] font-bold text-[#2d2d2d]">Akun</h1>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf6ee] active:bg-[#d4efdc] transition-colors"
            aria-label="Developer info"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M8 6L3 12L8 18" stroke="#3da85e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 6L21 12L16 18" stroke="#3da85e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>

        {/* Profile Card */}
        <div className="mx-5 mt-3 flex flex-col items-center rounded-[24px] bg-white px-6 py-7 shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
          {/* Avatar */}
          <div className="relative">
            <div className="h-[88px] w-[88px] overflow-hidden rounded-full border-4 border-[#eaf6ee] bg-[#b8e4c5]">
              <img
                src={profileImg}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#3da85e] shadow-[0_2px_8px_rgba(61,168,94,0.4)] active:bg-[#2d8f50] transition-colors"
              aria-label="Ganti foto"
            >
              <Camera size={13} className="text-white" />
            </button>
          </div>

          {/* Name & Email */}
          <h2 className="mt-4 text-[17px] font-bold text-[#2d2d2d]">{user.name}</h2>
          <p className="mt-0.5 text-[12px] text-[#999]">{user.email}</p>

          {/* Edit Button */}
          <button
            onClick={() => {
              setEditForm({ name: user.name, email: user.email });
              setShowEditModal(true);
            }}
            className="mt-4 rounded-full border border-[#3da85e] px-7 py-2 text-[13px] font-semibold text-[#3da85e] active:bg-[#eaf6ee] transition-colors"
          >
            Edit Profil
          </button>
        </div>

        {/* Menu Sections */}
        <div className="mt-4 space-y-3 px-5">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-widest text-[#aaa]">
                {section.title}
              </p>
              <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                {section.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => item.route && navigate(item.route)}
                      className={`flex w-full items-center gap-4 px-5 py-4 text-left active:bg-[#f6f6f4] transition-colors ${
                        idx !== section.items.length - 1
                          ? "border-b border-[#f0f0f0]"
                          : ""
                      }`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#f4f4f4]">
                        <Icon size={17} className="text-[#555]" />
                      </div>
                      <span className="flex-1 text-[13px] font-medium text-[#2d2d2d]">
                        {item.label}
                      </span>
                      {item.meta && (
                        <span className="text-[12px] text-[#bbb]">{item.meta}</span>
                      )}
                      <ChevronRight size={16} className="text-[#ccc]" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout */}
          <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => navigate("/login")}
              className="flex w-full items-center gap-4 px-5 py-4 text-left active:bg-[#fff5f5] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#fff0f0]">
                <LogOut size={17} className="text-[#e03535]" />
              </div>
              <span className="flex-1 text-[13px] font-medium text-[#e03535]">Keluar</span>
              <ChevronRight size={16} className="text-[#f5b3b3]" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.35)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
        >
          <div className="w-full max-w-md rounded-t-[28px] bg-white px-6 pb-8 pt-5 shadow-[0_-8px_32px_rgba(0,0,0,0.15)]">
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e0e0e0]" />

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-bold text-[#2d2d2d]">Edit Profil</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2f2f2] active:bg-[#e5e5e5]"
              >
                <X size={15} className="text-[#666]" />
              </button>
            </div>

            {/* Avatar Picker */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="h-[80px] w-[80px] overflow-hidden rounded-full border-4 border-[#eaf6ee] bg-[#b8e4c5]">
                  <img src={profileImg} alt="avatar" className="h-full w-full object-cover" />
                </div>
                <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#3da85e] shadow-sm">
                  <Camera size={13} className="text-white" />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-[#aaa]">Ketuk untuk ganti foto</p>
            </div>

            {/* Name Input */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#aaa]">
                Nama
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-[14px] border-2 border-[#f0f0f0] bg-[#fafafa] px-4 py-3 text-[14px] text-[#2d2d2d] outline-none focus:border-[#3da85e] transition-colors"
                placeholder="Nama kamu"
              />
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#aaa]">
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-[14px] border-2 border-[#f0f0f0] bg-[#fafafa] px-4 py-3 text-[14px] text-[#2d2d2d] outline-none focus:border-[#3da85e] transition-colors"
                placeholder="email@kamu.com"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3da85e] py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(61,168,94,0.35)] active:bg-[#2d8f50] transition-colors"
            >
              <Check size={16} />
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
