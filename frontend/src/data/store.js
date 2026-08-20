import { formatMoney as formatMoneyWithSettings } from "../utils/settings";

const STORAGE_KEY = "mbala-kwa-selemani-data-v1";
export const AUTH_STORAGE_KEY = "mbala-kwa-selemani-auth-v1";

const seed = () => ({
  categories: [
    { id: 1, name: "Viandes", description: "Bœuf, poulet, agneau congelés" },
    { id: 2, name: "Poissons", description: "Poissons et fruits de mer" },
    { id: 3, name: "Légumes", description: "Légumes surgelés" },
    { id: 4, name: "Plats préparés", description: "Repas prêts à cuire" },
  ],
  products: [
    {
      id: 1,
      name: "Poulet entier",
      sku: "VI-001",
      category_id: 1,
      unit: "kg",
      price_retail: 2800,
      price_wholesale: 2400,
      stock: 120,
      min_stock: 20,
      description: "Poulet fermier congelé",
    },
    {
      id: 2,
      name: "Filet de tilapia",
      sku: "PO-014",
      category_id: 2,
      unit: "kg",
      price_retail: 3500,
      price_wholesale: 3000,
      stock: 45,
      min_stock: 15,
      description: "Filets sans arêtes",
    },
    {
      id: 3,
      name: "Haricots verts",
      sku: "LE-008",
      category_id: 3,
      unit: "sac 1kg",
      price_retail: 1200,
      price_wholesale: 950,
      stock: 8,
      min_stock: 25,
      description: "Portion familiale",
    },
    {
      id: 4,
      name: "Pizza 4 fromages",
      sku: "PL-003",
      category_id: 4,
      unit: "pièce",
      price_retail: 2500,
      price_wholesale: 2100,
      stock: 60,
      min_stock: 10,
      description: "30 cm",
    },
  ],
  stockMovements: [
    {
      id: 1,
      product_id: 1,
      type: "entrée",
      quantity: 50,
      unit_cost: 2000,
      reference: "BE-2026-001",
      note: "Réapprovisionnement",
      created_at: "2026-08-18T09:30:00",
    },
    {
      id: 2,
      product_id: 2,
      type: "entrée",
      quantity: 30,
      unit_cost: 2600,
      reference: "BE-2026-002",
      note: "Livraison fournisseur",
      created_at: "2026-08-18T11:00:00",
    },
    {
      id: 3,
      product_id: 3,
      type: "sortie",
      quantity: 12,
      unit_cost: 0,
      reference: "BS-2026-001",
      note: "Ajustement inventaire",
      created_at: "2026-08-19T14:20:00",
    },
  ],
  clients: [
    {
      id: 1,
      name: "Marché Central SARL",
      phone: "+225 07 00 11 22 33",
      email: "contact@marchecentral.ci",
      type: "gros",
      address: "Abidjan, Treichville",
    },
    {
      id: 2,
      name: "Aya Kouassi",
      phone: "+225 05 44 55 66 77",
      email: "aya.k@email.com",
      type: "détail",
      address: "Cocody Angré",
    },
  ],
  users: [
    {
      id: 1,
      name: "Admin Principal",
      email: "admin@mbala-kwa.ci",
      password: "admin123",
      role: "administrateur",
      active: true,
    },
    {
      id: 2,
      name: "Marie Vendeur",
      email: "marie@mbala-kwa.ci",
      password: "vendeur123",
      role: "vendeur",
      active: true,
    },
    {
      id: 3,
      name: "Jean Caissier",
      email: "jean@mbala-kwa.ci",
      password: "caissier123",
      role: "caissier",
      active: true,
    },
  ],
  sales: [
    {
      id: 1,
      number: "VT-2026-0001",
      type: "détail",
      client_id: 2,
      items: [{ product_id: 1, quantity: 2, unit_price: 2800 }],
      payment_method: "espèces",
      status: "payée",
      total: 5600,
      created_at: "2026-08-19T16:10:00",
    },
    {
      id: 2,
      number: "VT-2026-0002",
      type: "gros",
      client_id: 1,
      items: [
        { product_id: 2, quantity: 10, unit_price: 3000 },
        { product_id: 4, quantity: 20, unit_price: 2100 },
      ],
      payment_method: "mobile money",
      status: "payée",
      total: 72000,
      created_at: "2026-08-20T10:05:00",
    },
  ],
  invoices: [
    {
      id: 1,
      number: "FA-2026-0001",
      sale_id: 1,
      client_id: 2,
      total: 5600,
      status: "émise",
      created_at: "2026-08-19T16:12:00",
    },
    {
      id: 2,
      number: "FA-2026-0002",
      sale_id: 2,
      client_id: 1,
      total: 72000,
      status: "émise",
      created_at: "2026-08-20T10:08:00",
    },
  ],
  cart: [],
  settings: {
    font: "dm-sans",
    theme: "light",
    currency: "CDF",
    usdRate: 2800,
  },
  nextIds: {
    products: 5,
    categories: 5,
    stockMovements: 4,
    clients: 3,
    users: 4,
    sales: 3,
    invoices: 3,
  },
});

const defaultPasswords = {
  "admin@mbala-kwa.ci": "admin123",
  "marie@mbala-kwa.ci": "vendeur123",
  "jean@mbala-kwa.ci": "caissier123",
};

const legacyEmailMap = {
  "admin@vivrefrais.ci": "admin@mbala-kwa.ci",
  "marie@vivrefrais.ci": "marie@mbala-kwa.ci",
  "jean@vivrefrais.ci": "jean@mbala-kwa.ci",
  "admin@mbalakua.ci": "admin@mbala-kwa.ci",
  "marie@mbalakua.ci": "marie@mbala-kwa.ci",
  "jean@mbalakua.ci": "jean@mbala-kwa.ci",
};

function migrateLegacyStorage() {
  if (localStorage.getItem(STORAGE_KEY)) return;

  const legacyKeys = [
    "mbala-kwa-selemani-data-v1",
    "mbalakua-selemani-data-v1",
    "vivre-frais-data-v1",
  ];

  for (const key of legacyKeys) {
    const raw = localStorage.getItem(key);
    if (raw) {
      localStorage.setItem(STORAGE_KEY, raw);
      break;
    }
  }
}

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function migrateUsers(data) {
  let changed = false;

  if (!data.settings) {
    data.settings = {
      font: "dm-sans",
      theme: "light",
      currency: "CDF",
      usdRate: 2800,
    };
    changed = true;
  }

  if ("tvaRate" in data.settings) {
    delete data.settings.tvaRate;
    changed = true;
  }

  data.users = data.users.map((user) => {
    let email = normalizeEmail(user.email);
    if (legacyEmailMap[email]) {
      email = legacyEmailMap[email];
      changed = true;
    }

    const expectedPassword = defaultPasswords[email];
    let password = user.password;

    if (!password || (expectedPassword && password !== expectedPassword)) {
      password = expectedPassword || password || "123456";
      changed = true;
    }

    if (email !== user.email || password !== user.password) {
      return { ...user, email, password };
    }

    return user;
  });

  if (changed) save(data);
  return data;
}

function load() {
  migrateLegacyStorage();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    return migrateUsers(JSON.parse(raw));
  } catch {
    const data = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getData() {
  return load();
}

export function updateData(updater) {
  const current = load();
  const next = typeof updater === "function" ? updater(current) : updater;
  save(next);
  return next;
}

export function resetData() {
  const data = seed();
  save(data);
  return data;
}

export function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(userId) {
  const session = { userId, loggedInAt: new Date().toISOString() };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function authenticateUser(email, password) {
  const data = migrateUsers(getData());
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = password.trim();

  const user = data.users.find(
    (u) => normalizeEmail(u.email) === normalizedEmail
  );

  if (!user) {
    return { ok: false, message: "Identifiants incorrects." };
  }
  if (!user.active) {
    return { ok: false, message: "Ce compte est désactivé." };
  }
  if (user.password !== normalizedPassword) {
    return { ok: false, message: "Identifiants incorrects." };
  }
  saveAuthSession(user.id);
  return { ok: true, user };
}

export function formatMoney(value, settings) {
  return formatMoneyWithSettings(value, settings);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getCategoryName(data, categoryId) {
  return data.categories.find((c) => c.id === categoryId)?.name || "—";
}

export function getProduct(data, productId) {
  return data.products.find((p) => p.id === productId);
}

export function getClient(data, clientId) {
  return data.clients.find((c) => c.id === clientId);
}

export function stockStatus(product) {
  if (product.stock <= 0) return "out";
  if (product.stock <= product.min_stock) return "low";
  return "ok";
}
