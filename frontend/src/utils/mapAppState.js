function nextId(items) {
  if (!items?.length) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

import { mergeAppearance } from "./appearanceStorage";
import { normalizeSettings } from "./settings";
import { normalizeRole } from "./permissions";

export function mapAppState(payload, cart = []) {
  const categories = payload.categories || [];
  const products = payload.products || [];
  const stockMovements = payload.stockMovements || [];
  const clients = payload.clients || [];
  const users = (payload.users || []).map((user) => ({
    ...user,
    role: normalizeRole(user.role),
  }));
  const sales = (payload.sales || []).map((sale) => ({
    ...sale,
    items: sale.items || [],
  }));
  const invoices = payload.invoices || [];

  return {
    categories,
    products,
    stockMovements,
    clients,
    users,
    sales,
    invoices,
    activityLogs: payload.activityLogs || [],
    cart,
    settings: mergeAppearance(
      normalizeSettings({
        ...(payload.settings || {
          font: "dm-sans",
          theme: "light",
          currency: "CDF",
          usdRate: 2800,
        }),
        usdRate: Number(payload.settings?.usdRate) || 2800,
      })
    ),
    nextIds: {
      products: nextId(products),
      categories: nextId(categories),
      stockMovements: nextId(stockMovements),
      clients: nextId(clients),
      users: nextId(users),
      sales: nextId(sales),
      invoices: nextId(invoices),
    },
  };
}

export function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem("mbala-kwa-cart-v1");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(cart) {
  localStorage.setItem("mbala-kwa-cart-v1", JSON.stringify(cart));
}
