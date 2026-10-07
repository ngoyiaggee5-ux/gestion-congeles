import { NavLink, Link } from "react-router-dom";
import { Accordion } from "react-bootstrap";
import Logo from "./Logo";
import VfButton from "./VfButton";
import { useApp } from "../data/AppContext";
import { PERMISSIONS } from "../utils/permissions";

const sections = [
  {
    key: "produits",
    label: "Produits",
    icon: "bi-box-seam",
    permission: PERMISSIONS.productsView,
    items: [
      { to: "/produits/ajouter", label: "Ajouter produit", permission: PERMISSIONS.productsManage },
      { to: "/produits/modifier", label: "Modifier produit", permission: PERMISSIONS.productsManage },
      { to: "/produits/categories", label: "Catégories", permission: PERMISSIONS.productsManage },
      { to: "/produits/prix", label: "Prix", permission: PERMISSIONS.productsManage },
    ],
  },
  {
    key: "stock",
    label: "Stock",
    icon: "bi-archive",
    permission: PERMISSIONS.stockView,
    items: [
      { to: "/stock/disponible", label: "Stock disponible", permission: PERMISSIONS.stockView },
      { to: "/stock/historique", label: "Historique", permission: PERMISSIONS.stockView },
    ],
  },
  {
    key: "ventes",
    label: "Ventes",
    icon: "bi-cart3",
    permission: PERMISSIONS.salesCart,
    items: [
      { to: "/ventes/detail", label: "Vente au détail", permission: PERMISSIONS.salesDetail },
      { to: "/ventes/gros", label: "Vente en gros", permission: PERMISSIONS.salesGros },
      { to: "/ventes/panier", label: "Panier", permission: PERMISSIONS.salesCart },
      { to: "/ventes/paiement", label: "Paiement", permission: PERMISSIONS.salesPayment },
    ],
  },
  {
    key: "facturation",
    label: "Facturation",
    icon: "bi-receipt",
    permission: PERMISSIONS.billingHistory,
    items: [
      { to: "/facturation/generer", label: "Générer facture", permission: PERMISSIONS.billingGenerate },
      { to: "/facturation/imprimer", label: "Imprimer facture", permission: PERMISSIONS.billingPrint },
      { to: "/facturation/historique", label: "Historique des factures", permission: PERMISSIONS.billingHistory },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    icon: "bi-people",
    to: "/clients",
    permission: PERMISSIONS.clientsManage,
  },
  {
    key: "utilisateurs",
    label: "Utilisateurs",
    icon: "bi-person-gear",
    permission: PERMISSIONS.usersManage,
    items: [
      { to: "/utilisateurs", label: "Tous les utilisateurs", permission: PERMISSIONS.usersManage },
      { to: "/utilisateurs/permissions", label: "Rôles & permissions", permission: PERMISSIONS.usersManage },
      { to: "/utilisateurs/admin", label: "Administrateur (ADM)", permission: PERMISSIONS.usersManage },
      { to: "/utilisateurs/manager", label: "Manager", permission: PERMISSIONS.usersManage },
      { to: "/utilisateurs/vendeur", label: "Vendeur", permission: PERMISSIONS.usersManage },
    ],
  },
  {
    key: "parametres",
    label: "Paramètres",
    icon: "bi-gear",
    to: "/parametres",
    permission: PERMISSIONS.settingsManage,
  },
  {
    key: "a-propos",
    label: "À propos",
    icon: "bi-info-circle",
    to: "/a-propos",
    permission: PERMISSIONS.dashboard,
  },
  {
    key: "rapports",
    label: "Rapports",
    icon: "bi-graph-up-arrow",
    permission: PERMISSIONS.reportsSales,
    items: [
      { to: "/rapports/ventes", label: "Ventes", permission: PERMISSIONS.reportsSales },
      { to: "/rapports/stock", label: "Stock", permission: PERMISSIONS.reportsStock },
      { to: "/rapports/benefices", label: "Bénéfices", permission: PERMISSIONS.reportsProfit },
    ],
  },
];

function filterSections(can) {
  return sections
    .map((section) => {
      if (section.items) {
        const items = section.items.filter((item) => can(item.permission));
        if (!items.length) return null;
        return { ...section, items };
      }
      if (!can(section.permission)) return null;
      return section;
    })
    .filter(Boolean);
}

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const { can } = useApp();
  const visibleSections = filterSections(can);
  const showDashboard = can(PERMISSIONS.dashboard);

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}${collapsed ? " collapsed" : ""}`}>
        <Link to="/dashboard" className="brand" onClick={onClose} title="MBALA KWA SELEMANI">
          <Logo size={collapsed ? 40 : 46} />
          {!collapsed && (
            <div>
              <p className="brand-title">MBALA KWA SELEMANI</p>
              <p className="brand-sub">Gestion congelé</p>
            </div>
          )}
        </Link>

        {!collapsed ? (
          <>
            {showDashboard && (
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `nav-section-btn ${isActive ? "active" : ""}`
                }
                onClick={onClose}
                title="Tableau de bord"
                style={{ marginBottom: "0.4rem" }}
              >
                <span>
                  <i className="bi bi-speedometer2" />
                  Tableau de bord
                </span>
              </NavLink>
            )}
            <Accordion flush alwaysOpen defaultActiveKey={visibleSections.map((s) => s.key)}>
              {visibleSections.map((section) =>
                section.to ? (
                  <div className="nav-section" key={section.key}>
                    <NavLink
                      to={section.to}
                      className={({ isActive }) =>
                        `nav-section-btn ${isActive ? "active" : ""}`
                      }
                      onClick={onClose}
                    >
                      <span>
                        <i className={`bi ${section.icon}`} />
                        {section.label}
                      </span>
                    </NavLink>
                  </div>
                ) : (
                  <Accordion.Item
                    eventKey={section.key}
                    key={section.key}
                    className="bg-transparent border-0"
                  >
                    <Accordion.Header className="nav-acc-header">
                      <span>
                        <i className={`bi ${section.icon} me-2`} />
                        {section.label}
                      </span>
                    </Accordion.Header>
                    <Accordion.Body className="p-0">
                      <ul className="nav-sub">
                        {section.items.map((item) => (
                          <li key={item.to}>
                            <NavLink to={item.to} onClick={onClose}>
                              {item.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </Accordion.Body>
                  </Accordion.Item>
                )
              )}
            </Accordion>
          </>
        ) : (
          <div className="sidebar-icon-nav">
            {showDashboard && (
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `sidebar-icon-link ${isActive ? "active" : ""}`
                }
                onClick={onClose}
                title="Tableau de bord"
              >
                <i className="bi bi-speedometer2" />
              </NavLink>
            )}
            {visibleSections.map((section) => {
              const target = section.to || section.items?.[0]?.to || "/";
              return (
                <NavLink
                  key={section.key}
                  to={target}
                  className={({ isActive }) =>
                    `sidebar-icon-link ${isActive ? "active" : ""}`
                  }
                  onClick={onClose}
                  title={section.label}
                >
                  <i className={`bi ${section.icon}`} />
                </NavLink>
              );
            })}
          </div>
        )}

        <div className="sidebar-footer">
          <VfButton
            variant="ghost"
            size="sm"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            icon={collapsed ? "bi-chevron-double-right" : "bi-chevron-double-left"}
            aria-label={collapsed ? "Étendre le menu" : "Réduire le menu"}
          />
        </div>
      </aside>
    </>
  );
}
