import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Tag,
  MapPin,
  DollarSign,
  Package,
  Trash2,
  CheckCircle,
  ChevronDown,
  Store,
} from "lucide-react";
import BottomNav from "../components/layout/BottomNav";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["komponen PC", "Tas", "Sparepart", "Produk Populer", "Lainnya"];
const CONDITIONS = ["Baru", "Bekas - Sangat Baik", "Bekas - Baik", "Bekas - Cukup"];

const SELLER_LISTINGS = [
  {
    id: 101,
    title: "Keyboard Mechanical Rexus MX9 TKL",
    price: 320000,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    category: "komponen PC",
    status: "Aktif",
    sold: 3,
  },
  {
    id: 102,
    title: "Totebag kanvas polos ekstra besar",
    price: 65000,
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
    category: "Tas",
    status: "Aktif",
    sold: 10,
  },
];

function formatPrice(price) {
  return "Rp" + price.toLocaleString("id-ID");
}

export default function MerchantPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [listings, setListings] = useState(SELLER_LISTINGS);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    description: "",
    image: "",
  });
  const [catOpen, setCatOpen] = useState(false);
  const [condOpen, setCondOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const fileInputRef = useRef(null);

  const handleInput = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewImg(url);
    setForm((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category || !form.condition || !form.location) return;
    const newItem = {
      id: Date.now(),
      title: form.title,
      price: parseInt(form.price.replace(/\D/g, ""), 10) || 0,
      image:
        form.image ||
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
      category: form.category,
      status: "Aktif",
      sold: 0,
    };
    setListings((prev) => [newItem, ...prev]);
    setForm({ title: "", price: "", category: "", condition: "", location: "", description: "", image: "" });
    setPreviewImg(null);
    setShowForm(false);
    setSuccessMsg("Produk berhasil diposting!");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleDelete = (id) =>
    setListings((prev) => prev.filter((item) => item.id !== id));

  return (
    <div className="min-h-screen bg-[#f6f6f4]">
      <div className="mx-auto max-w-md pb-24">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white px-5 pt-6 pb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0f0]"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} className="text-[#555]" />
            </button>
            <div className="flex items-center gap-2">
              <Store size={20} className="text-[#3da85e]" />
              <h1 className="text-[16px] font-bold text-[#2d2d2d]">Toko Saya</h1>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 rounded-full bg-[#3da85e] px-4 py-2 text-[12px] font-semibold text-white shadow-sm active:opacity-80"
              >
                <Plus size={14} />
                Jual Barang
              </button>
            </div>
          </div>
        </header>

        {/* Success Toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mx-5 mt-4 flex items-center gap-2 rounded-[14px] bg-[#3da85e] px-4 py-3 text-white shadow-md"
            >
              <CheckCircle size={16} />
              <span className="text-[13px] font-semibold">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Bar */}
        <div className="mx-5 mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Produk Aktif", value: listings.filter((l) => l.status === "Aktif").length },
            { label: "Total Terjual", value: listings.reduce((s, l) => s + l.sold, 0) },
            { label: "Kategori", value: [...new Set(listings.map((l) => l.category))].length },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[16px] bg-white px-3 py-3 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            >
              <p className="text-[18px] font-bold text-[#3da85e]">{value}</p>
              <p className="text-[10px] text-[#999]">{label}</p>
            </div>
          ))}
        </div>

        {/* Listings */}
        <div className="mt-5 px-5">
          <h2 className="mb-3 text-[13px] font-semibold text-[#555]">Produk Kamu</h2>
          {listings.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="text-5xl mb-4">📦</span>
              <p className="text-[14px] font-semibold text-[#2d2d2d]">
                Belum ada produk
              </p>
              <p className="mt-1 text-[12px] text-[#aaa] max-w-[220px]">
                Mulai jual barang bekasmu dan jadikan ladang cuan!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-5 flex items-center gap-2 rounded-full bg-[#3da85e] px-6 py-2.5 text-[12px] font-semibold text-white"
              >
                <Plus size={14} /> Jual Sekarang
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {listings.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3 overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-[80px] w-[80px] flex-shrink-0 rounded-[12px] object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-[12px] font-semibold text-[#2d2d2d] line-clamp-2">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[13px] font-bold text-[#e03535]">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                            item.status === "Aktif"
                              ? "bg-[#e8f5e9] text-[#2e7d32]"
                              : "bg-[#fce4ec] text-[#c62828]"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[9px] text-[#aaa]">{item.sold} terjual</span>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fff0f0] active:bg-[#ffd0d0]"
                        aria-label="Hapus"
                      >
                        <Trash2 size={13} className="text-[#e03535]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Post Product Bottom Sheet ── */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 z-30 bg-black"
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-t-[28px] bg-white px-5 pb-10 pt-5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
              style={{ maxHeight: "92vh" }}
            >
              {/* Drag Handle */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e0e0e0]" />

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[16px] font-bold text-[#2d2d2d]">Post Barang Jualan</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[12px] font-semibold text-[#aaa]"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Image Upload */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#888]">
                    FOTO PRODUK
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-[120px] w-full flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[#d8d8d8] bg-[#fafafa] transition hover:border-[#3da85e]"
                  >
                    {previewImg ? (
                      <img
                        src={previewImg}
                        alt="preview"
                        className="h-full w-full rounded-[14px] object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon size={28} className="text-[#ccc]" />
                        <span className="text-[11px] text-[#bbb]">Tap untuk upload foto</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#888]">
                    NAMA PRODUK *
                  </label>
                  <div className="flex items-center gap-2 rounded-[14px] border border-[#e8e8e8] bg-[#fafafa] px-3 py-3">
                    <Tag size={14} className="text-[#bbb]" />
                    <input
                      type="text"
                      placeholder="Contoh: Keyboard second mulus..."
                      value={form.title}
                      onChange={(e) => handleInput("title", e.target.value)}
                      required
                      className="flex-1 bg-transparent text-[13px] text-[#2d2d2d] outline-none placeholder:text-[#ccc]"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#888]">
                    HARGA *
                  </label>
                  <div className="flex items-center gap-2 rounded-[14px] border border-[#e8e8e8] bg-[#fafafa] px-3 py-3">
                    <DollarSign size={14} className="text-[#bbb]" />
                    <span className="text-[13px] text-[#aaa]">Rp</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => handleInput("price", e.target.value)}
                      required
                      min="0"
                      className="flex-1 bg-transparent text-[13px] text-[#2d2d2d] outline-none placeholder:text-[#ccc]"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#888]">
                    KATEGORI *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setCatOpen((p) => !p); setCondOpen(false); }}
                    className="flex w-full items-center justify-between rounded-[14px] border border-[#e8e8e8] bg-[#fafafa] px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-[#bbb]" />
                      <span className={`text-[13px] ${form.category ? "text-[#2d2d2d]" : "text-[#ccc]"}`}>
                        {form.category || "Pilih kategori"}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-[#bbb] transition-transform ${catOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {catOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-1 overflow-hidden rounded-[14px] border border-[#e8e8e8] bg-white shadow-md"
                      >
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => { handleInput("category", cat); setCatOpen(false); }}
                            className={`w-full px-4 py-3 text-left text-[13px] transition hover:bg-[#f6f6f4] ${
                              form.category === cat ? "font-semibold text-[#3da85e]" : "text-[#2d2d2d]"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Condition */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#888]">
                    KONDISI *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setCondOpen((p) => !p); setCatOpen(false); }}
                    className="flex w-full items-center justify-between rounded-[14px] border border-[#e8e8e8] bg-[#fafafa] px-3 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-[#bbb]" />
                      <span className={`text-[13px] ${form.condition ? "text-[#2d2d2d]" : "text-[#ccc]"}`}>
                        {form.condition || "Pilih kondisi barang"}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-[#bbb] transition-transform ${condOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {condOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-1 overflow-hidden rounded-[14px] border border-[#e8e8e8] bg-white shadow-md"
                      >
                        {CONDITIONS.map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => { handleInput("condition", cond); setCondOpen(false); }}
                            className={`w-full px-4 py-3 text-left text-[13px] transition hover:bg-[#f6f6f4] ${
                              form.condition === cond ? "font-semibold text-[#3da85e]" : "text-[#2d2d2d]"
                            }`}
                          >
                            {cond}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#888]">
                    LOKASI *
                  </label>
                  <div className="flex items-center gap-2 rounded-[14px] border border-[#e8e8e8] bg-[#fafafa] px-3 py-3">
                    <MapPin size={14} className="text-[#bbb]" />
                    <input
                      type="text"
                      placeholder="Contoh: Denpasar, Bali"
                      value={form.location}
                      onChange={(e) => handleInput("location", e.target.value)}
                      required
                      className="flex-1 bg-transparent text-[13px] text-[#2d2d2d] outline-none placeholder:text-[#ccc]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-[#888]">
                    DESKRIPSI
                  </label>
                  <textarea
                    placeholder="Jelaskan kondisi, spesifikasi, dan detail barang kamu..."
                    value={form.description}
                    onChange={(e) => handleInput("description", e.target.value)}
                    rows={3}
                    className="w-full rounded-[14px] border border-[#e8e8e8] bg-[#fafafa] px-3 py-3 text-[13px] text-[#2d2d2d] outline-none placeholder:text-[#ccc] resize-none focus:border-[#3da85e]"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="mt-2 w-full rounded-full bg-[#3da85e] py-3.5 text-[14px] font-bold text-white shadow-sm active:opacity-80 disabled:opacity-50"
                  disabled={!form.title || !form.price || !form.category || !form.condition || !form.location}
                >
                  Posting Sekarang
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
