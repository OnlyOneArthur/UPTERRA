import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Phone, MoreVertical, ShoppingBag } from "lucide-react";
import { products } from "./Market";

// Template messages & auto-replies per product category
const chatTemplates = {
  "komponen PC": {
    templateMessages: [
      "Halo, apakah produk ini masih tersedia?",
      "Kondisi barang masih bagus kak?",
      "Boleh minta foto kondisi terkini?",
      "Apakah bisa COD kak?",
      "Harga bisa nego kak?",
    ],
    autoReplies: [
      "Halo kak! Produk masih tersedia 😊",
      "Kondisi masih sangat bagus kak, sudah dicek dan berfungsi normal semua",
      "Boleh kak, sebentar ya saya foto dulu 📸",
      "COD bisa kak, area Bandung dan sekitarnya",
      "Harga sudah paling murah kak, tapi boleh tanya-tanya dulu 😊",
    ],
  },
  "Tas": {
    templateMessages: [
      "Halo, apakah tas ini masih ada?",
      "Ukuran tasnya berapa kak?",
      "Materialnya kuat kak?",
      "Apakah ada warna lain?",
      "Bisa request motif custom kak?",
    ],
    autoReplies: [
      "Halo kak! Masih ada stok 😊",
      "Ukuran 40x30x15 cm kak, cukup besar untuk belanja harian",
      "Sangat kuat kak, material plastik daur ulang dianyam rapat dan kulit asli",
      "Untuk sekarang tersedia coklat plastik dan hitam kulit kak",
      "Bisa kak! Minimal order 3 pcs untuk custom motif, estimasi 5-7 hari kerja 🎨",
    ],
  },
  "Semua": {
    templateMessages: [
      "Halo, produk masih tersedia?",
      "Bisa dikirim ke luar kota kak?",
      "Aman untuk tanaman kecil kak?",
      "Harga boleh nego kak?",
      "Boleh lihat foto lebih banyak?",
    ],
    autoReplies: [
      "Halo kak! Masih tersedia 😊",
      "Bisa kak, kirim via JNE/J&T ke seluruh Indonesia",
      "Aman kak, sudah banyak yang pakai untuk kaktus dan sukulen",
      "Untuk harga ini sudah harga terbaik kak 😊",
      "Boleh kak, sebentar saya ambilkan fotonya 📷",
    ],
  },
};

function getTemplate(category) {
  return chatTemplates[category] || chatTemplates["Semua"];
}

function formatTime(date) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function ProductChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === Number(id));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const template = product ? getTemplate(product.category) : getTemplate("Semua");

  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "seller",
      text: `Halo! Selamat datang di toko kami 😊 Ada yang bisa kami bantu terkait produk "${product?.title ?? "ini"}"?`,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#888]">Produk tidak ditemukan.</p>
      </div>
    );
  }

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), from: "buyer", text: text.trim(), time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Find matching auto-reply
    const idx = template.templateMessages.findIndex(
      (t) => t.toLowerCase() === text.trim().toLowerCase()
    );
    const replyText =
      idx !== -1
        ? template.autoReplies[idx]
        : "Baik kak, terima kasih sudah menghubungi kami 😊 Ada lagi yang ingin ditanyakan?";

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "seller", text: replyText, time: new Date() },
      ]);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f6f4]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">

        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f2] active:bg-[#e8e8e8]"
            aria-label="Kembali"
          >
            <ArrowLeft size={18} className="text-[#333]" />
          </button>

          {/* Seller Info */}
          <div className="flex flex-1 items-center gap-3">
            <div className="relative">
              <img
                src={product.image}
                alt={product.title}
                className="h-10 w-10 rounded-full object-cover"
                width="40" height="40"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#3da85e]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#2d2d2d]">Toko UPTERRA</p>
              <p className="text-[10px] text-[#3da85e]">Online</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f2]" aria-label="Telepon">
              <Phone size={16} className="text-[#555]" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2f2]" aria-label="Opsi">
              <MoreVertical size={16} className="text-[#555]" />
            </button>
          </div>
        </header>

        {/* Product Card (pinned at top of chat) */}
        <button
          onClick={() => navigate(`/market/${product.id}`)}
          className="mx-4 mt-3 flex items-center gap-3 rounded-[16px] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.06)] text-left active:bg-[#f8f8f8]"
        >
          <img
            src={product.image}
            alt={product.title}
            className="h-14 w-14 rounded-[10px] object-cover flex-shrink-0"
            width="56" height="56" loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#888] truncate">{product.category}</p>
            <p className="text-[12px] font-medium text-[#2d2d2d] leading-snug line-clamp-2">{product.title}</p>
            <p className="mt-0.5 text-[13px] font-bold text-[#e03535]">
              Rp{product.price.toLocaleString("id-ID")}
            </p>
          </div>
          <ShoppingBag size={16} className="text-[#3da85e] flex-shrink-0" />
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.from === "buyer" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.from === "seller" && (
                <img
                  src={product.image}
                  alt="seller"
                  className="mr-2 mt-auto h-7 w-7 flex-shrink-0 rounded-full object-cover self-end"
                  width="28" height="28"
                />
              )}
              <div
                className={`max-w-[72%] rounded-[18px] px-4 py-2.5 ${
                  msg.from === "buyer"
                    ? "rounded-br-[4px] bg-[#3da85e] text-white"
                    : "rounded-bl-[4px] bg-white text-[#2d2d2d] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                }`}
              >
                <p className="text-[13px] leading-relaxed">{msg.text}</p>
                <p
                  className={`mt-1 text-[10px] text-right ${
                    msg.from === "buyer" ? "text-white/70" : "text-[#bbb]"
                  }`}
                >
                  {formatTime(msg.time)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-end gap-2">
              <img
                src={product.image}
                alt="seller typing"
                className="h-7 w-7 rounded-full object-cover"
                width="28" height="28"
              />
              <div className="rounded-[18px] rounded-bl-[4px] bg-white px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#bbb] animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#bbb] animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#bbb] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Template Quick Replies */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {template.templateMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => sendMessage(msg)}
                className="whitespace-nowrap rounded-full border border-[#3da85e] bg-white px-3 py-1.5 text-[11px] font-medium text-[#3da85e] active:bg-[#f0faf4] flex-shrink-0"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="sticky bottom-0 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-[#f4f4f4] px-4 py-2.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Tulis pesan..."
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#bbb]"
                aria-label="Tulis pesan"
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3da85e] text-white disabled:opacity-40 active:bg-[#2f9050] transition-colors"
              aria-label="Kirim"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
