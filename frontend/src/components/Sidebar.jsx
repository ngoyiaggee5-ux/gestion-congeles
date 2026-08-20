import { NavLink, Link } from "react-router-dom";
import { Accordion } from "react-bootstrap";
import Logo from "./Logo";

const sections = [
  {
    key: "produits",
    label: "Produits",
    icon: "bi-box-seam",
    items: [
      { to: "/produits/ajouter", label: "Ajouter produit" },
      { to: "/produits/modifier", label: "Modifier produit" },
      { to: "/produits/categories", label: "Catégories" },
      { to: "/produits/prix", label: "Prix" },
    ],
  },
  {
    key: "stock",
    label: "Stock",
    icon: "bi-archive",
    items: [
      { to: "/stock/entrees", label: "Entrées" },
      { to: "/stock/sorties", label: "Sorties" },
      { to: "/stock/disponible", label: "Stock disponible" },
      { to: "/stock/historique", label: "Historique" },
    ],
  },
  {
    key: "ventes",
    label: "Ventes",
    icon: "bi-cart3",
    items: [
      { to: "/ventes/detail", label: "Vente au détail" },
      { to: "/ventes/gros", label: "Vente en gros" },
      { to: "/ventes/panier", label: "Panier" },
      { to: "/ventes/paiement", label: "Paiement" },
    ],
  },
  {
    key: "facturation",
    label: "Facturation",
    icon: "bi-receipt",
    items: [
      { to: "/facturation/generer", label: "Générer facture" },
      { to: "/facturation/imprimer", label: "Imprimer facture" },
      { to: "/facturation/historique", label: "Historique des factures" },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    icon: "bi-people",
    to: "/clients",
  },
  {
    key: "utilisateurs",
    label: "Utilisateurs",
    icon: "bi-person-gear",
    items: [
      { to: "/utilisateurs/administrateur", label: "Administrateur" },
      { to: "/utilisateurs/vendeur", label: "Vendeur" },
      { to: "/utilisateurs/caissier", label: "Caissier" },
    ],
  },
  {
    key: "parametres",
    label: "Paramètres",
    icon: "bi-gear",
    to: "/parametres",
  },
  {
    key: "rapports",
    label: "Rapports",
    icon: "bi-graph-up-arrow",
    items: [
      { to: "/rapports/ventes", label: "Ventes" },
      { to: "/rapports/stock", label: "Stock" },
      { to: "/rapports/benefices", label: "Bénéfices" },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
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

        <Accordion flush alwaysOpen defaultActiveKey={sections.map((s) => s.key)}>
          {sections.map((section) =>
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
