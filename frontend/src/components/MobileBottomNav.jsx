import { NavLink } from "react-router-dom";
import { useApp } from "../data/AppContext";
import { PERMISSIONS } from "../utils/permissions";

export default function MobileBottomNav() {
  const { can, data } = useApp();
  const cartCount = data.cart?.length || 0;

  const items = [
    can(PERMISSIONS.dashboard) && {
      to: "/",
      end: true,
      icon: "bi-house-door",
      label: "Accueil",
    },
    can(PERMISSIONS.salesDetail) && {
      to: "/ventes/detail",
      icon: "bi-shop-window",
      label: "Caisse",
    },
    can(PERMISSIONS.salesCart) && {
      to: "/ventes/panier",
      icon: "bi-basket",
      label: "Panier",
      badge: cartCount,
    },
    can(PERMISSIONS.stockView) && {
      to: "/stock/disponible",
      icon: "bi-boxes",
      label: "Stock",
    },
  ].filter(Boolean);

  if (items.length < 2) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation rapide">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `mobile-bottom-nav-item${isActive ? " active" : ""}`
          }
        >
          <span className="mobile-bottom-nav-icon">
            <i className={`bi ${item.icon}`} />
            {item.badge > 0 && (
              <span className="mobile-bottom-nav-badge">{item.badge}</span>
            )}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
