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
import {
  quantityFromAmount,
  cartLineTotal,
  amountFromQuantity,
} from "../utils/saleAmount";
import { api as apiClient, getApiToken, setApiToken, clearApiToken } from "../utils/api";
import { fetchAppState, fetchInvoices, reloadAfterMutation } from "../utils/apiSync";
import { mergeAppearance, saveAppearancePrefs } from "../utils/appearanceStorage";
import { normalizeSettings } from "../utils/settings";
import {
  createVerificationCode,
  logLocalActivity,
} from "../utils/activityLog";
import { dispatchStockAlert } from "../utils/stockAlert";
import { mapAppState, loadCartFromStorage, saveCartToStorage } from "../utils/mapAppState";

const AppContext = createContext(null);

function sameCartLine(item, productId, mode) {
  return Number(item.product_id) === Number(productId) && item.mode === mode;
}

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
  const [data, setData] = useState(() => {
    const initial = getData();
    initial.settings = mergeAppearance(normalizeSettings(initial.settings));
    return initial;
  });
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
          applyAppearance(appData.settings);
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

  const mutateCart = useCallback((updater) => {
    let nextState;
    setData((prev) => {
      const next =
        typeof updater === "function" ? updater(structuredClone(prev)) : updater;
      if (next.cart) saveCartToStorage(next.cart);
      nextState = next;
      return next;
    });
    return nextState;
  }, []);

  const syncFromApi = useCallback(async (cart) => {
    if (isApiMode && !getApiToken()) {
      throw new Error("Session expirée. Reconnectez-vous.");
    }
    const next = await reloadAfterMutation(cart);
    setData(next);
    return next;
  }, []);

  const refreshData = useCallback(async (cart) => syncFromApi(cart), [syncFromApi]);

  const syncInvoicesFromApi = useCallback(async () => {
    if (!isApiMode) return [];
    const invoices = await fetchInvoices();
    setData((prev) => ({ ...prev, invoices }));
    return invoices;
  }, []);

  const mutate = useCallback(
    (updater) => {
      if (isApiMode) {
        let nextState;
        setData((prev) => {
          const next =
            typeof updater === "function"
              ? updater(structuredClone(prev))
              : updater;
          if (next.cart) saveCartToStorage(next.cart);
          nextState = next;
          return next;
        });
        return nextState;
      }
      const next = updateData(updater);
      refresh(next);
      return next;
    },
    [refresh]
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
          const apiUnreachable =
            "API inaccessible. Lancez backend/demarrer-api.bat puis réessayez.";
          const formatApiError = (error, fallback) => {
            const status = error.response?.status;
            if (status === 429) {
              return (
                error.response?.data?.message ||
                "Trop de tentatives. Patientez une minute avant de réessayer."
              );
            }
            if (status === 422 || status === 401) {
              return (
                error.response?.data?.errors?.email?.[0] ||
                error.response?.data?.message ||
                "Identifiants incorrects."
              );
            }
            if (status >= 500) {
              return (
                error.response?.data?.message ||
                "Erreur serveur. Réessayez dans un instant."
              );
            }
            if (error.code === "ECONNABORTED") {
              return "Délai dépassé. Vérifiez votre connexion à l’API.";
            }
            if (error.response?.data?.message) {
              return error.response.data.message;
            }
            return fallback;
          };

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
            try {
              setData(await loadFromApi());
            } catch (loadError) {
              clearApiToken();
              setCurrentUser(null);
              return {
                ok: false,
                message: formatApiError(
                  loadError,
                  "Connexion OK mais chargement des données impossible. Redémarrez l'API puis réessayez."
                ),
              };
            }
            setCurrentUser(user);
            return { ok: true, user };
          } catch (error) {
            return {
              ok: false,
              message: formatApiError(error, apiUnreachable),
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
      formatMoney: (value) => formatMoneyUtil(value, normalizeSettings(data.settings)),
      formatDate,
      getCategoryName: (id) => getCategoryName(data, id),
      getProduct: (id) => getProduct(data, id),
      getClient: (id) => getClient(data, id),
      getClientDisplayName: (record) => {
        if (record?.client_name) return record.client_name;
        const client = getClient(data, record?.client_id);
        return client?.name || "Client passage";
      },
      refreshData,
      syncInvoicesFromApi,
      updateSettings: async (partial) => {
        const mergeSettings = (current) => {
          const next = { ...current, ...partial };
          if (partial.usdRate !== undefined) {
            next.usdRate = Number(partial.usdRate) || 2800;
          }
          if (
            partial.theme ||
            partial.font ||
            partial.currency ||
            partial.usdRate !== undefined
          ) {
            saveAppearancePrefs({
              ...(partial.theme ? { theme: partial.theme } : {}),
              ...(partial.font ? { font: partial.font } : {}),
              ...(partial.currency ? { currency: partial.currency } : {}),
              ...(partial.usdRate !== undefined
                ? { usdRate: Number(partial.usdRate) || 2800 }
                : {}),
            });
          }
          applyAppearance(next);
          return next;
        };

        if (isApiMode) {
          setData((prev) => ({
            ...prev,
            settings: mergeSettings(prev.settings),
          }));
          try {
            const { data: saved } = await apiClient.put("/settings", partial);
            setData((prev) => ({
              ...prev,
              settings: mergeAppearance({ ...prev.settings, ...saved }),
            }));
          } catch {
            /* garder le réglage local */
          }
          return;
        }

        mutate((d) => {
          d.settings = mergeSettings(d.settings);
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
          d.products = d.products.map((p) => {
            if (p.id !== id) return p;
            const next = {
              ...p,
              ...payload,
              category_id: Number(payload.category_id),
              price_retail: Number(payload.price_retail),
              price_wholesale: Number(payload.price_wholesale),
              stock: Number(payload.stock),
              min_stock: Number(payload.min_stock),
            };
            if (
              next.price_retail !== p.price_retail ||
              next.price_wholesale !== p.price_wholesale
            ) {
              logLocalActivity(d, {
                userName: currentUser?.name,
                action: "product.price_updated",
                entityType: "product",
                entityId: id,
                summary: `Prix modifié — ${next.name}`,
                meta: {
                  price_retail: next.price_retail,
                  price_wholesale: next.price_wholesale,
                },
              });
            }
            return next;
          });
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
            password: payload.password,
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
      addToCart: (productId, quantity = 1, mode = "détail") => {
        const pid = Number(productId);
        const product = data.products.find((p) => Number(p.id) === pid);
        if (product) {
          const existing = data.cart.find((i) => sameCartLine(i, pid, mode));
          const nextQty = (existing?.quantity || 0) + quantity;
          const remaining = product.stock - nextQty;
          if (remaining <= product.min_stock) {
            dispatchStockAlert(product, remaining);
          }
        }

        return (isApiMode ? mutateCart : mutate)((d) => {
          const product = d.products.find((p) => Number(p.id) === pid);
          if (!product) return d;
          const unit_price =
            mode === "gros" ? product.price_wholesale : product.price_retail;
          const existing = d.cart.find((i) => sameCartLine(i, pid, mode));
          if (existing) {
            existing.quantity += quantity;
            delete existing.sale_amount;
          } else
            d.cart.push({
              product_id: pid,
              quantity,
              unit_price,
              mode,
            });
          return d;
        });
      },
      addToCartByAmount: (productId, amount, mode = "détail") => {
        if (mode === "gros") {
          return {
            ok: false,
            error: "La vente par montant est réservée au détail.",
          };
        }

        const pid = Number(productId);
        const product = data.products.find((p) => Number(p.id) === pid);
        if (!product) return { ok: false, error: "Produit introuvable." };

        const unit_price = product.price_retail;
        const saleAmount = Math.round(Number(amount) || 0);
        const quantity = quantityFromAmount(saleAmount, unit_price, product.unit);

        if (saleAmount <= 0) {
          return { ok: false, error: "Indiquez un montant valide." };
        }
        if (quantity <= 0) {
          return {
            ok: false,
            error: `Montant insuffisant (prix : ${formatMoneyUtil(unit_price, data.settings)}).`,
          };
        }
        if (quantity > product.stock) {
          return {
            ok: false,
            error: `Stock insuffisant (${product.stock} ${product.unit} disponible).`,
          };
        }

        const existing = data.cart.find((i) => sameCartLine(i, pid, mode));
        const nextQty = (existing?.sale_amount
          ? quantityFromAmount(
              Math.round(Number(existing.sale_amount)) + saleAmount,
              unit_price,
              product.unit
            )
          : (existing?.quantity || 0) + quantity);
        const remaining = product.stock - nextQty;
        if (remaining <= product.min_stock) {
          dispatchStockAlert(product, remaining);
        }

        let applied = false;
        (isApiMode ? mutateCart : mutate)((d) => {
          const p = d.products.find((x) => Number(x.id) === pid);
          if (!p) return d;
          const price = p.price_retail;
          const line = d.cart.find((i) => sameCartLine(i, pid, mode));
          if (line) {
            const previousAmount =
              line.sale_amount != null
                ? Math.round(Number(line.sale_amount))
                : amountFromQuantity(line.quantity, price);
            line.sale_amount = previousAmount + saleAmount;
            line.quantity = quantityFromAmount(line.sale_amount, price, p.unit);
          } else {
            d.cart.push({
              product_id: pid,
              quantity,
              unit_price: price,
              mode,
              sale_amount: saleAmount,
            });
          }
          applied = true;
          return d;
        });

        if (!applied) {
          return { ok: false, error: "Impossible d'ajouter au panier." };
        }

        return { ok: true, quantity, saleAmount };
      },
      updateCartQty: (productId, mode, quantity) =>
        (isApiMode ? mutateCart : mutate)((d) => {
          const pid = Number(productId);
          d.cart = d.cart
            .map((i) =>
              sameCartLine(i, pid, mode)
                ? { ...i, quantity: Number(quantity), sale_amount: undefined }
                : i
            )
            .filter((i) => i.quantity > 0);
          return d;
        }),
      updateCartAmount: (productId, mode, amount) => {
        if (mode === "gros") {
          return {
            ok: false,
            error: "La vente par montant est réservée au détail.",
          };
        }

        const pid = Number(productId);
        const product = data.products.find((p) => Number(p.id) === pid);
        if (!product) return { ok: false, error: "Produit introuvable." };

        const cartItem = data.cart.find((i) => sameCartLine(i, pid, mode));
        if (!cartItem) return { ok: false, error: "Ligne introuvable." };

        const saleAmount = Math.round(Number(amount) || 0);
        const quantity = quantityFromAmount(
          saleAmount,
          cartItem.unit_price,
          product.unit
        );

        if (saleAmount <= 0) {
          return { ok: false, error: "Montant invalide." };
        }
        if (quantity <= 0) {
          return { ok: false, error: "Montant insuffisant pour ce produit." };
        }
        if (quantity > product.stock) {
          return {
            ok: false,
            error: `Stock insuffisant (${product.stock} ${product.unit}).`,
          };
        }

        (isApiMode ? mutateCart : mutate)((d) => {
          d.cart = d.cart.map((i) =>
            sameCartLine(i, pid, mode)
              ? { ...i, quantity, sale_amount: saleAmount }
              : i
          );
          return d;
        });

        return { ok: true };
      },
      removeFromCart: (productId, mode) =>
        (isApiMode ? mutateCart : mutate)((d) => {
          const pid = Number(productId);
          d.cart = d.cart.filter(
            (i) => !sameCartLine(i, pid, mode)
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
              ...(i.sale_amount != null
                ? { line_total: Math.round(i.sale_amount) }
                : {}),
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
          const total = items.reduce((sum, i) => sum + cartLineTotal(i), 0);
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
              line_total: cartLineTotal(i),
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
          const invoiceNumber = `FA-2026-${String(invoiceId).padStart(4, "0")}`;
          d.invoices.unshift({
            id: invoiceId,
            number: invoiceNumber,
            sale_id: saleId,
            client_id: resolvedClientId,
            client_name: resolvedClientName,
            total,
            status: "émise",
            verification_code: createVerificationCode(),
            created_at: new Date().toISOString(),
          });
          logLocalActivity(d, {
            userName: currentUser?.name,
            action: "sale.created",
            entityType: "sale",
            entityId: saleId,
            summary: `Vente ${number} — ${resolvedClientName} (${total} CDF)`,
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
          const invoiceNumber = `FA-2026-${String(invoiceId).padStart(4, "0")}`;
          d.invoices.unshift({
            id: invoiceId,
            number: invoiceNumber,
            sale_id: saleId,
            client_id: sale.client_id,
            client_name: sale.client_name,
            total: sale.total,
            status: "émise",
            verification_code: createVerificationCode(),
            created_at: new Date().toISOString(),
          });
          return d;
        });
      },
      deleteInvoice: async (id) => {
        if (isApiMode) {
          setData((prev) => ({
            ...prev,
            invoices: prev.invoices.filter((i) => i.id !== id),
          }));
          try {
            await apiClient.delete(`/invoices/${id}`);
          } catch (error) {
            if (error.response?.status !== 404) {
              await syncInvoicesFromApi();
              throw error;
            }
          }
          await syncInvoicesFromApi();
          return;
        }
        mutate((d) => {
          const invoice = d.invoices.find((i) => i.id === id);
          if (invoice) {
            logLocalActivity(d, {
              userName: currentUser?.name,
              action: "invoice.deleted",
              entityType: "invoice",
              entityId: id,
              summary: `Facture ${invoice.number} supprimée`,
            });
          }
          d.invoices = d.invoices.filter((i) => i.id !== id);
          return d;
        });
      },
      deleteAllInvoices: async () => {
        if (isApiMode) {
          const { data: result } = await apiClient.post("/invoices/purge");
          setData((prev) => ({ ...prev, invoices: [] }));
          await syncInvoicesFromApi();
          return result;
        }
        mutate((d) => {
          const count = d.invoices.length;
          if (count > 0) {
            logLocalActivity(d, {
              userName: currentUser?.name,
              action: "invoice.purged",
              entityType: "invoice",
              entityId: null,
              summary: `Historique factures vidé — ${count} facture(s)`,
            });
          }
          d.invoices = [];
          return d;
        });
        return { message: "Historique vidé.", deleted: 0 };
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
    [data, currentUser, mutate, mutateCart, syncFromApi, syncInvoicesFromApi, refreshData, authReady]
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
