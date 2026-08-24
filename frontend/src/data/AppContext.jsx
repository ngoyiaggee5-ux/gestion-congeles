import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import {
  getData,
  updateData,
  formatDate,
  getCategoryName,
  getProduct,
  getClient,
  stockStatus,
  clearAuthSession,
  getValidAuthSession,
  authenticateUser,
} from "./store";
import { hashPassword, PASSWORD_HASHES } from "../utils/password";
import { normalizeRole } from "../utils/permissions";
import {
  formatMoney as formatMoneyUtil,
  applyAppearance,
} from "../utils/settings";
import {
  suggestClients,
  suggestProducts,
  getSmartInsights as buildSmartInsights,
} from "../utils/suggestions";
import {
  can as checkCan,
  canAccessRoute as checkRouteAccess,
  getRolePermissions,
} from "../utils/permissions";
import { isApiMode } from "../utils/config";
import { api as apiClient, getApiToken, setApiToken, clearApiToken } from "../utils/api";
import { fetchAppState, reloadAfterMutation } from "../utils/apiSync";
import { mapAppState, loadCartFromStorage, saveCartToStorage } from "../utils/mapAppState";

const AppContext = createContext(null);

async function loadFromApi(cart) {
  return fetchAppState(cart);
}

async function resolveCurrentUser(data) {
  const session = await getValidAuthSession();
  if (!session?.userId) return null;
  const user = data.users.find((u) => u.id === session.userId && u.active);
  if (!user) return null;
  return { ...user, role: normalizeRole(user.role) };
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => getData());
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const onExpired = () => {
      clearAuthSession();
      setCurrentUser(null);
    };
    window.addEventListener("mbala:auth-expired", onExpired);
    return () => window.removeEventListener("mbala:auth-expired", onExpired);
  }, []);

  useEffect(() => {
    let active = true;

    async function initAuth() {
      try {
        if (isApiMode) {
          clearAuthSession();
          if (!getApiToken()) return;
          const { data: me } = await apiClient.get("/me");
          const appData = await loadFromApi();
          if (!active) return;
          setCurrentUser({
            id: me.id,
            name: me.name,
            email: me.email,
            role: normalizeRole(me.role),
            active: me.active,
          });
          setData(appData);
        } else {
          const user = await resolveCurrentUser(getData());
          if (!active) return;
          setCurrentUser(user);
        }
      } catch {
        clearApiToken();
        clearAuthSession();
        setCurrentUser(null);
      } finally {
        if (active) setAuthReady(true);
      }
    }

    initAuth();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    applyAppearance(data.settings);
  }, [data.settings]);

  const refresh = useCallback((next) => {
    setData({ ...next });
  }, []);

  const mutateCart = useCallback(
    (updater) => {
      const next =
        typeof updater === "function" ? updater(structuredClone(data)) : updater;
      if (next.cart) saveCartToStorage(next.cart);
      refresh(next);
      return next;
    },
    [refresh, data]
  );

  const syncFromApi = useCallback(async (cart) => {
    if (isApiMode && !getApiToken()) {
      throw new Error("Session expirée. Reconnectez-vous.");
    }
    const next = await reloadAfterMutation(cart);
    setData(next);
    return next;
  }, []);

  const mutate = useCallback(
    (updater) => {
      let next;
      if (isApiMode) {
        next =
          typeof updater === "function" ? updater(structuredClone(data)) : updater;
        if (next.cart) saveCartToStorage(next.cart);
      } else {
        next = updateData(updater);
      }
      refresh(next);
      return next;
    },
    [refresh, data]
  );

  const app = useMemo(
    () => ({
      data,
      authReady,
      isApiMode,
      currentUser,
      isAuthenticated: !!currentUser && (!isApiMode || !!getApiToken()),
      can: (permission) => checkCan(currentUser, permission),
      canAccessRoute: (pathname) => checkRouteAccess(currentUser, pathname),
      getRolePermissions: (role) => getRolePermissions(role),
      login: async (email, password) => {
        if (isApiMode) {
          try {
            const { data: authData } = await apiClient.post("/login", {
              email: email.trim(),
              password,
            });
            clearAuthSession();
            setApiToken(authData.token);
            const user = {
              ...authData.user,
              role: normalizeRole(authData.user.role),
            };
            setCurrentUser(user);
            setData(await loadFromApi());
            return { ok: true, user };
          } catch (error) {
            const status = error.response?.status;
            if (status === 422 || status === 401) {
              return {
                ok: false,
                message:
                  error.response?.data?.errors?.email?.[0] ||
                  error.response?.data?.message ||
                  "Identifiants incorrects. Vérifiez le compte dans MySQL (fix-passwords.mysql.sql).",
              };
            }
            if (status >= 500) {
              return {
                ok: false,
                message:
                  "Erreur serveur (base de données). Vérifiez MySQL dans XAMPP.",
              };
            }
            return {
              ok: false,
              message:
                "API inaccessible. Lancez backend/demarrer-api.bat puis réessayez.",
            };
          }
        }

        const result = await authenticateUser(email, password);
        if (result.ok) {
          setCurrentUser(result.user);
          return { ok: true, user: result.user };
        }
        return result;
      },
      logout: async () => {
        if (isApiMode) {
          try {
            await apiClient.post("/logout");
          } catch {
            /* ignore */
          }
          clearApiToken();
        }
        clearAuthSession();
        setCurrentUser(null);
      },
      formatMoney: (value) => formatMoneyUtil(value, data.settings),
      formatDate,
      getCategoryName: (id) => getCategoryName(data, id),
      getProduct: (id) => getProduct(data, id),
      getClient: (id) => getClient(data, id),
      getClientDisplayName: (record) => {
        if (record?.client_name) return record.client_name;
        const client = getClient(data, record?.client_id);
        return client?.name || "Client passage";
      },
      refreshData: () => syncFromApi(),
      updateSettings: async (partial) => {
        if (isApiMode) {
          await apiClient.put("/settings", partial);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.settings = { ...d.settings, ...partial };
          return d;
        });
      },
      suggestClients: (query, saleType) =>
        suggestClients(data, query, saleType),
      suggestProducts: (query, mode) => suggestProducts(data, query, mode),
      getSmartInsights: () => buildSmartInsights(data, stockStatus),
      stockStatus,
      addCategory: async (payload) => {
        if (isApiMode) {
          await apiClient.post("/categories", payload);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          const id = d.nextIds.categories++;
          d.categories.push({ id, ...payload });
          return d;
        });
      },
      updateCategory: async (id, payload) => {
        if (isApiMode) {
          await apiClient.put(`/categories/${id}`, payload);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.categories = d.categories.map((c) =>
            c.id === id ? { ...c, ...payload } : c
          );
          return d;
        });
      },
      deleteCategory: async (id) => {
        if (isApiMode) {
          await apiClient.delete(`/categories/${id}`);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.categories = d.categories.filter((c) => c.id !== id);
          return d;
        });
      },
      addProduct: async (payload) => {
        if (isApiMode) {
          await apiClient.post("/products", {
            ...payload,
            category_id: Number(payload.category_id),
            price_retail: Number(payload.price_retail) || 0,
            price_wholesale: Number(payload.price_wholesale) || 0,
            stock: Number(payload.stock) || 0,
            min_stock: Number(payload.min_stock) || 0,
          });
          await syncFromApi();
          return;
        }
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
        });
      },
      updateProduct: async (id, payload) => {
        if (isApiMode) {
          await apiClient.put(`/products/${id}`, {
            ...payload,
            category_id: Number(payload.category_id),
            price_retail: Number(payload.price_retail),
            price_wholesale: Number(payload.price_wholesale),
            stock: Number(payload.stock),
            min_stock: Number(payload.min_stock),
          });
          await syncFromApi();
          return;
        }
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
        });
      },
      deleteProduct: async (id) => {
        if (isApiMode) {
          await apiClient.delete(`/products/${id}`);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.products = d.products.filter((p) => p.id !== id);
          return d;
        });
      },
      addStockMovement: async (payload) => {
        if (isApiMode) {
          await apiClient.post("/stock-movements", {
            product_id: Number(payload.product_id),
            type: payload.type,
            quantity: Number(payload.quantity),
            unit_cost: Number(payload.unit_cost) || 0,
            reference: payload.reference || null,
            note: payload.note || null,
          });
          await syncFromApi();
          return;
        }
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
        });
      },
      addClient: async (payload) => {
        if (isApiMode) {
          await apiClient.post("/clients", payload);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          const id = d.nextIds.clients++;
          d.clients.push({ id, ...payload });
          return d;
        });
      },
      updateClient: async (id, payload) => {
        if (isApiMode) {
          await apiClient.put(`/clients/${id}`, payload);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.clients = d.clients.map((c) => (c.id === id ? { ...c, ...payload } : c));
          return d;
        });
      },
      deleteClient: async (id) => {
        if (isApiMode) {
          await apiClient.delete(`/clients/${id}`);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.clients = d.clients.filter((c) => c.id !== id);
          return d;
        });
      },
      addUser: async (payload) => {
        if (isApiMode) {
          await apiClient.post("/users", {
            name: payload.name,
            email: payload.email,
            password: payload.password || "123456",
            role: normalizeRole(payload.role),
          });
          await syncFromApi();
          return;
        }
        const passwordHash = payload.password
          ? await hashPassword(payload.password)
          : PASSWORD_HASHES["123456"];
        mutate((d) => {
          const id = d.nextIds.users++;
          d.users.push({
            id,
            active: true,
            role: normalizeRole(payload.role),
            name: payload.name,
            email: payload.email,
            password: passwordHash,
          });
          return d;
        });
      },
      updateUser: async (id, payload) => {
        if (isApiMode) {
          const body = { ...payload };
          if (body.role) body.role = normalizeRole(body.role);
          if (!body.password) delete body.password;
          await apiClient.put(`/users/${id}`, body);
          await syncFromApi();
          return;
        }
        const updates = { ...payload };
        if (updates.password) {
          updates.password = await hashPassword(updates.password);
        }
        mutate((d) => {
          d.users = d.users.map((u) => (u.id === id ? { ...u, ...updates } : u));
          return d;
        });
      },
      toggleUser: async (id) => {
        if (isApiMode) {
          const user = data.users.find((u) => u.id === id);
          if (!user) return;
          await apiClient.patch(`/users/${id}`, { active: !user.active });
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.users = d.users.map((u) =>
            u.id === id ? { ...u, active: !u.active } : u
          );
          return d;
        });
      },
      deleteUser: async (id) => {
        if (isApiMode) {
          await apiClient.delete(`/users/${id}`);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.users = d.users.filter((u) => u.id !== id);
          return d;
        });
      },
      addToCart: (productId, quantity = 1, mode = "détail") =>
        (isApiMode ? mutateCart : mutate)((d) => {
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
        (isApiMode ? mutateCart : mutate)((d) => {
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
        (isApiMode ? mutateCart : mutate)((d) => {
          d.cart = d.cart.filter(
            (i) => !(i.product_id === productId && i.mode === mode)
          );
          return d;
        }),
      clearCart: () =>
        (isApiMode ? mutateCart : mutate)((d) => {
          d.cart = [];
          return d;
        }),
      checkout: async ({ client_id, client_name, payment_method, type }) => {
        if (isApiMode) {
          const items = data.cart.filter((i) => i.mode === type);
          if (!items.length) return false;
          const resolvedClientId = Number(client_id) || null;
          const resolvedClientName =
            client_name?.trim() ||
            data.clients.find((c) => c.id === resolvedClientId)?.name ||
            "Client passage";
          await apiClient.post("/sales", {
            type,
            client_id: resolvedClientId,
            client_name: resolvedClientName,
            payment_method,
            items: items.map((i) => ({
              product_id: i.product_id,
              quantity: i.quantity,
              unit_price: i.unit_price,
            })),
          });
          const cartAfter = data.cart.filter((i) => i.mode !== type);
          await syncFromApi(cartAfter);
          return true;
        }
        mutate((d) => {
          const items = d.cart.filter((i) => i.mode === type);
          if (!items.length) return d;
          for (const item of items) {
            const product = d.products.find((p) => p.id === item.product_id);
            if (!product || product.stock < item.quantity) return d;
          }
          const total = items.reduce(
            (sum, i) => sum + i.quantity * i.unit_price,
            0
          );
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
            total,
            status: "émise",
            created_at: new Date().toISOString(),
          });
          d.cart = d.cart.filter((i) => i.mode !== type);
          return d;
        });
      },
      createInvoiceFromSale: async (saleId) => {
        if (isApiMode) {
          await apiClient.post("/invoices", { sale_id: saleId });
          await syncFromApi();
          return;
        }
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
            total: sale.total,
            status: "émise",
            created_at: new Date().toISOString(),
          });
          return d;
        });
      },
      deleteInvoice: async (id) => {
        if (isApiMode) {
          await apiClient.delete(`/invoices/${id}`);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.invoices = d.invoices.filter((i) => i.id !== id);
          return d;
        });
      },
      deleteSale: async (id) => {
        if (isApiMode) {
          await apiClient.delete(`/sales/${id}`);
          await syncFromApi();
          return;
        }
        mutate((d) => {
          d.sales = d.sales.filter((s) => s.id !== id);
          d.invoices = d.invoices.filter((i) => i.sale_id !== id);
          return d;
        });
      },
    }),
    [data, currentUser, mutate, mutateCart, syncFromApi, authReady]
  );

  if (!authReady) {
    return (
      <div className="login-page">
        <div className="login-card text-center">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-3 mb-0 text-muted">Chargement de la session…</p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={app}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
