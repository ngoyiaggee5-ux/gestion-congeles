import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useStockAlertListener } from "../hooks/useStockAlertListener";
import WelcomeModal from "./WelcomeModal";

const SIDEBAR_KEY = "mbala-sidebar-collapsed";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) === "1"
  );
  const [navVisible, setNavVisible] = useState(true);
  useKeyboardShortcuts();
  const { StockAlertBanner } = useStockAlertListener();

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  };

  useEffect(() => {
    let hideTimer = null;
    const scheduleHide = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setNavVisible(false), 2200);
    };

    const onMove = (event) => {
      if (event.clientY <= 14) {
        setNavVisible(true);
        clearTimeout(hideTimer);
        return;
      }
      if (event.clientY > 88) {
        scheduleHide();
      }
    };

    const onScroll = () => {
      setNavVisible(false);
    };

    scheduleHide();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={`app-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <Sidebar
        open={open}
        collapsed={collapsed}
        onClose={() => setOpen(false)}
        onToggleCollapse={toggleCollapsed}
      />
      <div
        className={`main-area navbar-autohide${navVisible ? " navbar-visible" : ""}`}
      >
        <div
          className="navbar-hotzone"
          onMouseEnter={() => setNavVisible(true)}
          aria-hidden="true"
        />
        {StockAlertBanner}
        <Navbar
          onMenuOpen={() => setOpen(true)}
          onToggleCollapse={toggleCollapsed}
          sidebarCollapsed={collapsed}
          onMouseEnter={() => setNavVisible(true)}
        />
        <main className="page-content page-content-with-mobile-nav">
          <Outlet />
        </main>
        <MobileBottomNav />
        <WelcomeModal />
      </div>
    </div>
  );
}
