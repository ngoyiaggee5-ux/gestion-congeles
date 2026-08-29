import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useStockAlertListener } from "../hooks/useStockAlertListener";

const SIDEBAR_KEY = "mbala-sidebar-collapsed";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === "1"
  );
  useKeyboardShortcuts();
  const { StockAlertBanner } = useStockAlertListener();

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className={`app-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <Sidebar
        open={open}
        collapsed={collapsed}
        onClose={() => setOpen(false)}
        onToggleCollapse={toggleCollapsed}
      />
      <div className="main-area">
        {StockAlertBanner}
        <Navbar
          onMenuOpen={() => setOpen(true)}
          onToggleCollapse={toggleCollapsed}
          sidebarCollapsed={collapsed}
        />
        <main className="page-content page-content-with-mobile-nav">
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
