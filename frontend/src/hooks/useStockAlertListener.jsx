import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";

export function useStockAlertListener() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      const { product, remainingStock } = event.detail || {};
      if (!product) return;
      setAlert({ product, remainingStock });
      window.setTimeout(() => setAlert(null), 5000);
    };

    window.addEventListener("mbala:stock-alert", handler);
    return () => window.removeEventListener("mbala:stock-alert", handler);
  }, []);

  const StockAlertBanner = alert ? (
    <Alert variant="warning" className="stock-alert-banner mb-0">
      <i className="bi bi-exclamation-triangle-fill me-2" />
      Stock faible : <strong>{alert.product.name}</strong> — il restera{" "}
      <strong>{Math.max(alert.remainingStock, 0)}</strong> {alert.product.unit} après cette vente.
    </Alert>
  ) : null;

  return { StockAlertBanner };
}
