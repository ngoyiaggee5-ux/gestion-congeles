import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import VfButton from "./VfButton";
import { useApp } from "../data/AppContext";
import { getSessionExpiresAt } from "../utils/authSession";
import { PERMISSIONS, ROLE_LABELS } from "../utils/permissions";

const quickLinks = [
  { to: "/", label: "Accueil", permission: PERMISSIONS.dashboard, end: true },
  { to: "/ventes/panier", label: "Ventes", permission: PERMISSIONS.salesCart },
  { to: "/stock/disponible", label: "Stock", permission: PERMISSIONS.stockView },
  {
    to: "/facturation/historique",
    label: "Factures",
    permission: PERMISSIONS.billingHistory,
  },
  { to: "/clients", label: "Clients", permission: PERMISSIONS.clientsManage },
];

export default function Navbar({ onMenuOpen, onToggleCollapse, sidebarCollapsed }) {
  const { currentUser, data, logout, can } = useApp();
  const navigate = useNavigate();
  const cartCount = data.cart.reduce((n, i) => n + i.quantity, 0);
  const sessionExpiresAt = getSessionExpiresAt();
  const links = quickLinks.filter((item) => can(item.permission));

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar-modern">
      <div className="navbar-modern-inner">
        <div className="navbar-modern-brand">
          <VfButton
            variant="ghost"
            size="sm"
            className="mobile-toggle navbar-menu-btn"
            onClick={onMenuOpen}
            icon="bi-list"
            aria-label="Menu"
          />
          <VfButton
            variant="ghost"
            size="sm"
            className="desktop-sidebar-toggle navbar-menu-btn"
            onClick={onToggleCollapse}
            icon={sidebarCollapsed ? "bi-layout-sidebar-inset" : "bi-layout-sidebar"}
            aria-label={sidebarCollapsed ? "Ouvrir le menu" : "Réduire le menu"}
            title={sidebarCollapsed ? "Ouvrir le menu" : "Réduire le menu"}
          />
          <Link to="/" className="navbar-brand-link">
            <Logo size={38} />
            <div className="navbar-brand-text">
              <span className="navbar-brand-title">MBALA KWA SELEMANI</span>
              <span className="navbar-brand-sub">
                Stock froid · ventes · facturation · F2 caisse · F3 panier
              </span>
            </div>
          </Link>
        </div>

        <nav className="navbar-modern-links" aria-label="Navigation principale">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `navbar-modern-link${isActive ? " active" : ""}`
              }
            >
              <span className="navbar-modern-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="navbar-modern-actions">
          {can(PERMISSIONS.salesCart) && (
            <Link to="/ventes/panier" className="navbar-cta-ghost">
              <i className="bi bi-cart3" />
              <span>Panier</span>
              {cartCount > 0 && <em>{cartCount}</em>}
            </Link>
          )}

          <div className="navbar-user">
            <div className="navbar-user-avatar">
              {currentUser?.name?.charAt(0) || "?"}
            </div>
            <div className="navbar-user-meta">
              <span className="navbar-user-name">{currentUser?.name}</span>
              <span className="navbar-user-role">
                {ROLE_LABELS[currentUser?.role] || currentUser?.role}
              </span>
              {sessionExpiresAt && (
                <span className="navbar-user-session">
                  Expire{" "}
                  {new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(
                    new Date(sessionExpiresAt)
                  )}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="navbar-logout-btn no-print"
            onClick={handleLogout}
            title="Déconnexion"
            aria-label="Déconnexion"
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </header>
  );
}
