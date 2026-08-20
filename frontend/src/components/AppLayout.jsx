import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button, Badge } from "react-bootstrap";
import Sidebar from "./Sidebar";
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
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              className="mobile-toggle"
              onClick={() => setOpen(true)}
            >
              <i className="bi bi-list" />
            </Button>
            <div>
              <div className="fw-semibold">Espace de gestion</div>
              <small className="text-muted">Stock froid · ventes · facturation</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Badge bg="success" pill>
              Panier · {cartCount}
            </Badge>
            <div className="text-end">
              <div className="fw-semibold" style={{ fontSize: "0.92rem" }}>
                {currentUser?.name}
              </div>
              <span className="role-pill text-capitalize">{currentUser?.role}</span>
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              className="no-print"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1" />
              Déconnexion
            </Button>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
