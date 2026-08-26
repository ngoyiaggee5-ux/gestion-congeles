import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useStockAlertListener } from "../hooks/useStockAlertListener";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  useKeyboardShortcuts();
  const { StockAlertBanner } = useStockAlertListener();

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main-area">
        {StockAlertBanner}
        <Navbar onMenuOpen={() => setOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
