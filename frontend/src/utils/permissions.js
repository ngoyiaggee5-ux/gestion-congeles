export const ROLES = {
  admin: "admin",
  manager: "manager",
  vendeur: "vendeur",
};

export const PERMISSIONS = {
  dashboard: "dashboard",
  productsManage: "products.manage",
  productsView: "products.view",
  productsDelete: "products.delete",
  stockManage: "stock.manage",
  stockView: "stock.view",
  salesDetail: "sales.detail",
  salesGros: "sales.gros",
  salesCart: "sales.cart",
  salesPayment: "sales.payment",
  salesDelete: "sales.delete",
  billingGenerate: "billing.generate",
  billingPrint: "billing.print",
  billingHistory: "billing.history",
  billingDelete: "billing.delete",
  clientsManage: "clients.manage",
  clientsDelete: "clients.delete",
  categoriesDelete: "categories.delete",
  usersManage: "users.manage",
  usersDelete: "users.delete",
  settingsManage: "settings.manage",
  reportsSales: "reports.sales",
  reportsStock: "reports.stock",
  reportsProfit: "reports.profit",
  cartClear: "cart.clear",
};

export const PERMISSION_LABELS = {
  [PERMISSIONS.dashboard]: "Tableau de bord",
  [PERMISSIONS.productsManage]: "Gérer les produits (ajout, modification, prix, catégories)",
  [PERMISSIONS.productsView]: "Consulter les produits",
  [PERMISSIONS.productsDelete]: "Supprimer un produit",
  [PERMISSIONS.stockManage]: "Gérer le stock (entrées, sorties)",
  [PERMISSIONS.stockView]: "Consulter le stock",
  [PERMISSIONS.salesDetail]: "Vente au détail",
  [PERMISSIONS.salesGros]: "Vente en gros",
  [PERMISSIONS.salesCart]: "Gérer le panier",
  [PERMISSIONS.salesPayment]: "Encaisser / paiement",
  [PERMISSIONS.salesDelete]: "Supprimer une vente / reçu",
  [PERMISSIONS.billingGenerate]: "Générer des factures",
  [PERMISSIONS.billingPrint]: "Imprimer des factures",
  [PERMISSIONS.billingHistory]: "Consulter l'historique des factures",
  [PERMISSIONS.billingDelete]: "Supprimer une facture / reçu",
  [PERMISSIONS.clientsManage]: "Gérer les clients",
  [PERMISSIONS.clientsDelete]: "Supprimer un client",
  [PERMISSIONS.categoriesDelete]: "Supprimer une catégorie",
  [PERMISSIONS.usersManage]: "Gérer les utilisateurs",
  [PERMISSIONS.usersDelete]: "Supprimer un utilisateur",
  [PERMISSIONS.settingsManage]: "Paramètres de l'application",
  [PERMISSIONS.reportsSales]: "Rapport ventes",
  [PERMISSIONS.reportsStock]: "Rapport stock",
  [PERMISSIONS.reportsProfit]: "Rapport bénéfices",
  [PERMISSIONS.cartClear]: "Vider le panier",
};

export const ROLE_LABELS = {
  admin: "Administrateur (ADM)",
  manager: "Manager",
  vendeur: "Vendeur",
};

export const ROLE_DESCRIPTIONS = {
  admin:
    "Administration : produits, stock, facturation, rapports, utilisateurs et paramètres. Ne peut pas vendre.",
  manager:
    "Supervision : stock, rapports, produits, clients et facturation. Ne peut pas vendre ni gérer les utilisateurs.",
  vendeur:
    "Vendre (détail, gros, panier, paiement). Pas de clients, rapports, paramètres ni suppressions.",
};

const ALL = Object.values(PERMISSIONS);

const ADMIN_NO_SALES = ALL.filter(
  (permission) =>
    ![
      PERMISSIONS.salesDetail,
      PERMISSIONS.salesGros,
      PERMISSIONS.salesCart,
      PERMISSIONS.salesPayment,
      PERMISSIONS.salesDelete,
      PERMISSIONS.cartClear,
    ].includes(permission)
);

export const ROLE_PERMISSIONS = {
  admin: ADMIN_NO_SALES,
  manager: [
    PERMISSIONS.dashboard,
    PERMISSIONS.productsView,
    PERMISSIONS.productsManage,
    PERMISSIONS.stockManage,
    PERMISSIONS.stockView,
    PERMISSIONS.billingGenerate,
    PERMISSIONS.billingPrint,
    PERMISSIONS.billingHistory,
    PERMISSIONS.clientsManage,
    PERMISSIONS.reportsSales,
    PERMISSIONS.reportsStock,
    PERMISSIONS.reportsProfit,
  ],
  vendeur: [
    PERMISSIONS.dashboard,
    PERMISSIONS.productsView,
    PERMISSIONS.stockView,
    PERMISSIONS.salesDetail,
    PERMISSIONS.salesGros,
    PERMISSIONS.salesCart,
    PERMISSIONS.salesPayment,
    PERMISSIONS.billingHistory,
    PERMISSIONS.billingPrint,
    PERMISSIONS.cartClear,
  ],
};

export const ROUTE_PERMISSIONS = [
  { path: "/dashboard", permission: PERMISSIONS.dashboard, exact: true },
  { path: "/produits/ajouter", permission: PERMISSIONS.productsManage },
  { path: "/produits/modifier", permission: PERMISSIONS.productsManage },
  { path: "/produits/categories", permission: PERMISSIONS.productsManage },
  { path: "/produits/prix", permission: PERMISSIONS.productsManage },
  { path: "/stock/entrees", permission: PERMISSIONS.stockManage },
  { path: "/stock/sorties", permission: PERMISSIONS.stockManage },
  { path: "/stock/disponible", permission: PERMISSIONS.stockView },
  { path: "/stock/historique", permission: PERMISSIONS.stockView },
  { path: "/ventes/detail", permission: PERMISSIONS.salesDetail },
  { path: "/ventes/gros", permission: PERMISSIONS.salesGros },
  { path: "/ventes/panier", permission: PERMISSIONS.salesCart },
  { path: "/ventes/paiement", permission: PERMISSIONS.salesPayment },
  { path: "/facturation/generer", permission: PERMISSIONS.billingGenerate },
  { path: "/facturation/imprimer", permission: PERMISSIONS.billingPrint },
  { path: "/facturation/historique", permission: PERMISSIONS.billingHistory },
  { path: "/clients", permission: PERMISSIONS.clientsManage },
  { path: "/utilisateurs", permission: PERMISSIONS.usersManage },
  { path: "/parametres", permission: PERMISSIONS.settingsManage },
  { path: "/a-propos", permission: PERMISSIONS.dashboard },
  { path: "/rapports/ventes", permission: PERMISSIONS.reportsSales },
  { path: "/rapports/stock", permission: PERMISSIONS.reportsStock },
  { path: "/rapports/benefices", permission: PERMISSIONS.reportsProfit },
];

const LEGACY_ROLE_MAP = {
  administrateur: ROLES.admin,
  caissier: ROLES.manager,
};

export function normalizeRole(role) {
  return LEGACY_ROLE_MAP[role] || role;
}

export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[normalizeRole(role)] || [];
}

export function can(user, permission) {
  if (!user?.role) return false;
  return getRolePermissions(user.role).includes(permission);
}

export function canAccessRoute(user, pathname) {
  if (!user) return false;
  const match = ROUTE_PERMISSIONS.find((rule) => {
    if (rule.exact) return pathname === rule.path;
    return pathname === rule.path || pathname.startsWith(`${rule.path}/`);
  });
  if (!match) return true;
  return can(user, match.permission);
}

export function getDefaultHomeForRole(role) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.manager) return "/rapports/ventes";
  if (normalized === ROLES.vendeur) return "/ventes/detail";
  return "/dashboard";
}
