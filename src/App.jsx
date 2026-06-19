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
        <Route path="/cart" element={<Cart />} />
        <Route path="/pesanan" element={<Pesanan />} />
      </Routes>
    </BrowserRouter>
  );
}
