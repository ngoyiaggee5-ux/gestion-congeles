import axios from "axios";
import { API_URL, isApiMode } from "./config";
import { getData } from "../data/store";

export async function verifyInvoice(number, code) {
  const trimmed = String(number || "").trim();
  const verificationCode = String(code || "").trim();

  if (!trimmed) {
    return { valid: false, message: "Numéro de facture manquant." };
  }

  if (!verificationCode) {
    return { valid: false, message: "Code de vérification manquant." };
  }

  if (isApiMode) {
    try {
      const { data } = await axios.get(
        `${API_URL}/public/invoices/verify/${encodeURIComponent(trimmed)}`,
        {
          params: { c: verificationCode },
          timeout: 8000,
          headers: { Accept: "application/json" },
        }
      );
      return data;
    } catch (error) {
      if (error?.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  const appData = getData();
  const invoice = appData.invoices.find((item) => item.number === trimmed);
  if (!invoice) {
    return {
      valid: false,
      message: "Facture introuvable ou numéro invalide.",
    };
  }

  if (invoice.verification_code !== verificationCode) {
    return {
      valid: false,
      message: "Code de vérification invalide ou facture falsifiée.",
    };
  }

  const sale = appData.sales.find((item) => item.id === invoice.sale_id);

  return {
    valid: true,
    signed: true,
    number: invoice.number,
    total: invoice.total,
    status: invoice.status,
    client_name: invoice.client_name,
    created_at: invoice.created_at,
    sale_number: sale?.number,
    payment_method: sale?.payment_method,
  };
}
