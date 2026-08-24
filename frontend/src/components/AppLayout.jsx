import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import VfButton from "./VfButton";
import { useApp } from "../data/AppContext";

import { getSessionExpiresAt } from "../utils/authSession";
import { ROLE_LABELS } from "../utils/permissions";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { currentUser, data, logout } = useApp();
  const navigate = useNavigate();
  const cartCount = data.cart.reduce((n, i) => n + i.quantity, 0);
  const sessionExpiresAt = getSessionExpiresAt();

  const handleLogout = async () => {
    await logout();
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
                <span className="role-pill">
                  {ROLE_LABELS[currentUser?.role] || currentUser?.role}
                </span>
                {sessionExpiresAt && (
                  <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>
                    Session expire :{" "}
                    {new Intl.DateTimeFormat("fr-FR", {
                      timeStyle: "short",
                    }).format(new Date(sessionExpiresAt))}
                  </small>
                )}
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
