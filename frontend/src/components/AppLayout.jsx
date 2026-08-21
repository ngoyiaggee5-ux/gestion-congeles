import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import VfButton from "./VfButton";
import { useApp } from "../data/AppContext";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { currentUser, data, logout } = useApp();
  const navigate = useNavigate();
  const cartCount = data.cart.reduce((n, i) => n + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main-area">
        <header className="topbar">
          <div className="d-flex align-items-center gap-3">
            <VfButton
              variant="ghost"
              size="sm"
              className="mobile-toggle topbar-icon-btn"
              onClick={() => setOpen(true)}
              icon="bi-list"
              aria-label="Menu"
            />
            <div className="topbar-title-block">
              <div className="topbar-title">Espace de gestion</div>
              <small className="topbar-sub">Stock froid · ventes · facturation</small>
            </div>
          </div>
          <div className="topbar-actions">
            <Link to="/ventes/panier" className="cart-pill">
              <i className="bi bi-cart3" />
              <span>Panier</span>
              {cartCount > 0 && <em>{cartCount}</em>}
            </Link>
            <div className="user-chip">
              <div className="user-avatar">
                {currentUser?.name?.charAt(0) || "?"}
              </div>
              <div className="user-meta">
                <div className="user-name">{currentUser?.name}</div>
                <span className="role-pill text-capitalize">{currentUser?.role}</span>
              </div>
            </div>
            <VfButton
              variant="danger"
              size="sm"
              className="no-print"
              onClick={handleLogout}
              icon="bi-box-arrow-right"
            >
              Déconnexion
            </VfButton>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
