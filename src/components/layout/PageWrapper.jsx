import BottomNav from "./BottomNav";
import { Outlet } from "react-router-dom";

export default function PageWrapper() {
  return (
    <div className="relative min-h-screen">
      <Outlet />
      <BottomNav />
    </div>
  );
}
