import { api as apiClient } from "./api";
import { mapAppState, loadCartFromStorage, saveCartToStorage } from "./mapAppState";

export async function fetchAppState(cart) {
  const { data } = await apiClient.get("/app-state");
  return mapAppState(data, cart ?? loadCartFromStorage());
}

export async function fetchInvoices() {
  const { data } = await apiClient.get("/invoices");
  return data || [];
}

export async function reloadAfterMutation(cart) {
  if (cart !== undefined) saveCartToStorage(cart);
  return fetchAppState(cart);
}

export function apiErrorMessage(error, fallback = "Erreur lors de l'enregistrement.") {
  if (error?.response?.status === 401) {
    return "Session expirée ou non authentifiée. Déconnectez-vous et reconnectez-vous.";
  }
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }
  return fallback;
}
