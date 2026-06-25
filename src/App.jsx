import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Market from "./pages/Market";
import MarketDetail from "./pages/MarketDetail";
import Cart from "./pages/Cart";
import Pesanan from "./pages/Pesanan";
import ProductChat from "./pages/ProductChat";
import MapView from "./pages/MapView";
import Profile from "./pages/Profile";
import LaporSampah from "./pages/LaporSampah";
import KonfirmasiLaporan from "./pages/KonfirmasiLaporan";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/market" element={<Market />} />
        <Route path="/market/:id" element={<MarketDetail />} />
        <Route path="/chat/:id" element={<ProductChat />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/pesanan" element={<Pesanan />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/lapor-sampah" element={<LaporSampah />} />
        <Route path="/konfirmasi-laporan" element={<KonfirmasiLaporan />} />
      </Routes>
    </BrowserRouter>
  );
}
