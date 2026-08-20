import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import {
  getData,
  updateData,
  formatDate,
  getCategoryName,
  getProduct,
  getClient,
  stockStatus,
  getAuthSession,
  clearAuthSession,
  authenticateUser,
} from "./store";
import {
  formatMoney as formatMoneyUtil,
  calcTotals as calcTotalsUtil,
  applyAppearance,
} from "../utils/settings";

const AppContext = createContext(null);

function resolveCurrentUser(data) {
  const session = getAuthSession();
  if (!session?.userId) return null;
  return data.users.find((u) => u.id === session.userId && u.active) || null;
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => getData());
  const [currentUser, setCurrentUser] = useState(() => resolveCurrentUser(getData()));

  useEffect(() => {
    applyAppearance(data.settings);
  }, [data.settings]);

  const refresh = useCallback((next) => {
    setData({ ...next });
  }, []);

  const mutate = useCallback(
    (updater) => {
      const next = updateData(updater);
      refresh(next);
      return next;
    },
    [refresh]
  );

  const api = useMemo(
    () => ({
      data,
      currentUser,
      isAuthenticated: !!currentUser,
      login: (email, password) => {
        const result = authenticateUser(email, password);
        if (result.ok) {
          setCurrentUser(result.user);
        }
        return result;
      },
      logout: () => {
        clearAuthSession();
        setCurrentUser(null);
      },
      formatMoney: (value) => formatMoneyUtil(value, data.settings),
      calcTotals: (subtotalHt) =>
        calcTotalsUtil(subtotalHt, data.settings?.tvaRate ?? 16),
      formatDate,
      getCategoryName: (id) => getCategoryName(data, id),
      getProduct: (id) => getProduct(data, id),
      getClient: (id) => getClient(data, id),
      getClientDisplayName: (record) => {
        if (record?.client_name) return record.client_name;
        const client = getClient(data, record?.client_id);
        return client?.name || "Client passage";
      },
      updateSettings: (partial) =>
        mutate((d) => {
          d.settings = { ...d.settings, ...partial };
          return d;
        }),
      stockStatus,
      addCategory: (payload) =>
        mutate((d) => {
          const id = d.nextIds.categories++;
          d.categories.push({ id, ...payload });
          return d;
        }),
      updateCategory: (id, payload) =>
        mutate((d) => {
          d.categories = d.categories.map((c) =>
            c.id === id ? { ...c, ...payload } : c
          );
          return d;
        }),
      deleteCategory: (id) =>
        mutate((d) => {
          d.categories = d.categories.filter((c) => c.id !== id);
          return d;
        }),
      addProduct: (payload) =>
        mutate((d) => {
          const id = d.nextIds.products++;
          d.products.push({
            id,
            stock: Number(payload.stock) || 0,
            min_stock: Number(payload.min_stock) || 0,
            price_retail: Number(payload.price_retail) || 0,
            price_wholesale: Number(payload.price_wholesale) || 0,
            category_id: Number(payload.category_id),
            ...payload,
            stock: Number(payload.stock) || 0,
          });
          return d;
        }),
      updateProduct: (id, payload) =>
        mutate((d) => {
          d.products = d.products.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...payload,
                  category_id: Number(payload.category_id),
                  price_retail: Number(payload.price_retail),
                  price_wholesale: Number(payload.price_wholesale),
                  stock: Number(payload.stock),
                  min_stock: Number(payload.min_stock),
                }
              : p
          );
          return d;
        }),
      deleteProduct: (id) =>
        mutate((d) => {
          d.products = d.products.filter((p) => p.id !== id);
          return d;
        }),
      addStockMovement: (payload) =>
        mutate((d) => {
          const qty = Number(payload.quantity);
          const product = d.products.find((p) => p.id === Number(payload.product_id));
          if (!product) return d;
          if (payload.type === "entrée") product.stock += qty;
          else product.stock = Math.max(0, product.stock - qty);
          const id = d.nextIds.stockMovements++;
          d.stockMovements.unshift({
            id,
            product_id: Number(payload.product_id),
            type: payload.type,
            quantity: qty,
            unit_cost: Number(payload.unit_cost) || 0,
            reference: payload.reference || `${payload.type === "entrée" ? "BE" : "BS"}-${id}`,
            note: payload.note || "",
            created_at: new Date().toISOString(),
          });
          return d;
        }),
      addClient: (payload) =>
        mutate((d) => {
          const id = d.nextIds.clients++;
          d.clients.push({ id, ...payload });
          return d;
        }),
      updateClient: (id, payload) =>
        mutate((d) => {
          d.clients = d.clients.map((c) => (c.id === id ? { ...c, ...payload } : c));
          return d;
        }),
      deleteClient: (id) =>
        mutate((d) => {
          d.clients = d.clients.filter((c) => c.id !== id);
          return d;
        }),
      addUser: (payload) =>
        mutate((d) => {
          const id = d.nextIds.users++;
          d.users.push({
            id,
            active: true,
            password: payload.password || "123456",
            ...payload,
          });
          return d;
        }),
      updateUser: (id, payload) =>
        mutate((d) => {
          d.users = d.users.map((u) => (u.id === id ? { ...u, ...payload } : u));
          return d;
        }),
      toggleUser: (id) =>
        mutate((d) => {
          d.users = d.users.map((u) =>
            u.id === id ? { ...u, active: !u.active } : u
          );
          return d;
        }),
      addToCart: (productId, quantity = 1, mode = "détail") =>
        mutate((d) => {
          const product = d.products.find((p) => p.id === productId);
          if (!product) return d;
          const unit_price =
            mode === "gros" ? product.price_wholesale : product.price_retail;
          const existing = d.cart.find(
            (i) => i.product_id === productId && i.mode === mode
          );
          if (existing) existing.quantity += quantity;
          else
            d.cart.push({
              product_id: productId,
              quantity,
              unit_price,
              mode,
            });
          return d;
        }),
      updateCartQty: (productId, mode, quantity) =>
        mutate((d) => {
          d.cart = d.cart
            .map((i) =>
              i.product_id === productId && i.mode === mode
                ? { ...i, quantity: Number(quantity) }
                : i
            )
            .filter((i) => i.quantity > 0);
          return d;
        }),
      removeFromCart: (productId, mode) =>
        mutate((d) => {
          d.cart = d.cart.filter(
            (i) => !(i.product_id === productId && i.mode === mode)
          );
          return d;
        }),
      clearCart: () =>
        mutate((d) => {
          d.cart = [];
          return d;
        }),
      checkout: ({ client_id, client_name, payment_method, type }) =>
        mutate((d) => {
          const items = d.cart.filter((i) => i.mode === type);
          if (!items.length) return d;
          for (const item of items) {
            const product = d.products.find((p) => p.id === item.product_id);
            if (!product || product.stock < item.quantity) return d;
          }
          const subtotalHt = items.reduce(
            (sum, i) => sum + i.quantity * i.unit_price,
            0
          );
          const tvaRate = d.settings?.tvaRate ?? 16;
          const tva = subtotalHt * (tvaRate / 100);
          const total = subtotalHt + tva;
          const resolvedClientId = Number(client_id) || null;
          const resolvedClientName =
            client_name?.trim() ||
            d.clients.find((c) => c.id === resolvedClientId)?.name ||
            "Client passage";
          const saleId = d.nextIds.sales++;
          const number = `VT-2026-${String(saleId).padStart(4, "0")}`;
          d.sales.unshift({
            id: saleId,
            number,
            type,
            client_id: resolvedClientId,
            client_name: resolvedClientName,
            items: items.map((i) => ({
              product_id: i.product_id,
              quantity: i.quantity,
              unit_price: i.unit_price,
            })),
            payment_method,
            status: "payée",
            subtotal_ht: subtotalHt,
            tva_rate: tvaRate,
            tva_amount: tva,
            total,
            created_at: new Date().toISOString(),
          });
          for (const item of items) {
            const product = d.products.find((p) => p.id === item.product_id);
            product.stock -= item.quantity;
            const movId = d.nextIds.stockMovements++;
            d.stockMovements.unshift({
              id: movId,
              product_id: item.product_id,
              type: "sortie",
              quantity: item.quantity,
              unit_cost: 0,
              reference: number,
              note: `Vente ${type}`,
              created_at: new Date().toISOString(),
            });
          }
          const invoiceId = d.nextIds.invoices++;
          d.invoices.unshift({
            id: invoiceId,
            number: `FA-2026-${String(invoiceId).padStart(4, "0")}`,
            sale_id: saleId,
            client_id: resolvedClientId,
            client_name: resolvedClientName,
            subtotal_ht: subtotalHt,
            tva_rate: tvaRate,
            tva_amount: tva,
            total,
            status: "émise",
            created_at: new Date().toISOString(),
          });
          d.cart = d.cart.filter((i) => i.mode !== type);
          return d;
        }),
      createInvoiceFromSale: (saleId) =>
        mutate((d) => {
          const sale = d.sales.find((s) => s.id === saleId);
          if (!sale) return d;
          if (d.invoices.some((i) => i.sale_id === saleId)) return d;
          const invoiceId = d.nextIds.invoices++;
          d.invoices.unshift({
            id: invoiceId,
            number: `FA-2026-${String(invoiceId).padStart(4, "0")}`,
            sale_id: saleId,
            client_id: sale.client_id,
            client_name: sale.client_name,
            subtotal_ht: sale.subtotal_ht ?? sale.total,
            tva_rate: sale.tva_rate ?? d.settings?.tvaRate ?? 16,
            tva_amount: sale.tva_amount ?? 0,
            total: sale.total,
            status: "émise",
            created_at: new Date().toISOString(),
          });
          return d;
        }),
    }),
    [data, currentUser, mutate]
  );

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
