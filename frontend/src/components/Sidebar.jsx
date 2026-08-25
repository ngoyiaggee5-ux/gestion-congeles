import { NavLink, Link } from "react-router-dom";
import { Accordion } from "react-bootstrap";
import Logo from "./Logo";
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
      { to: "/stock/entrees", label: "Entrées", permission: PERMISSIONS.stockManage },
      { to: "/stock/sorties", label: "Sorties", permission: PERMISSIONS.stockManage },
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

export default function Sidebar({ open, onClose }) {
  const { can } = useApp();
  const visibleSections = filterSections(can);
  const showDashboard = can(PERMISSIONS.dashboard);

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link to="/" className="brand" onClick={onClose}>
          <Logo size={46} />
          <div>
            <p className="brand-title">MBALA KWA SELEMANI</p>
            <p className="brand-sub">Gestion congelé</p>
          </div>
        </Link>

        {showDashboard && (
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-section-btn ${isActive ? "active" : ""}`
            }
            onClick={onClose}
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
      </aside>
    </>
  );
}
