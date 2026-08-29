import { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import Logo from "../../components/Logo";
import { formatCdf } from "../../utils/settings";
import { verifyInvoice } from "../../utils/invoiceVerify";

function formatVerifyDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("fr-FR");
  } catch {
    return value;
  }
}

export default function VerifierFacture() {
  const [params] = useSearchParams();
  const number = params.get("n") || "";
  const code = params.get("c") || "";
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(Boolean(number && code));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!number || !code) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    verifyInvoice(number, code)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch(() => {
        if (active) {
          setError("Impossible de contacter le serveur de vérification.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [number, code]);

  const statusClass = useMemo(() => {
    if (!result?.valid) return "";
    if (result.status === "payée") return "verify-status-success";
    if (result.status === "annulée") return "verify-status-danger";
    return "verify-status-info";
  }, [result]);

  return (
    <div className="login-page verify-invoice-page">
      <div className="login-card verify-invoice-card">
        <div className="verify-invoice-brand">
          <Logo size={52} />
          <div>
            <h1>Vérification de facture</h1>
            <p className="text-muted mb-0">MBALA KWA SELEMANI</p>
          </div>
        </div>

        {!number && (
          <Alert variant="warning" className="mb-0">
            Aucun numéro de facture fourni. Scannez le QR code imprimé sur la
            facture.
          </Alert>
        )}

        {number && !code && (
          <Alert variant="danger" className="mb-0">
            Code de vérification manquant. Utilisez le QR code complet de la facture.
          </Alert>
        )}

        {number && code && loading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="success" />
            <p className="text-muted mt-3 mb-0">Vérification en cours…</p>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && result && !result.valid && (
          <Alert variant="danger" className="mb-0">
            {result.message || "Facture non reconnue."}
          </Alert>
        )}

        {!loading && result?.valid && (
          <div className={`verify-invoice-result ${statusClass}`}>
            <div className="verify-invoice-badge">
              <i className="bi bi-patch-check-fill me-2" />
              Facture authentique
            </div>
            <dl className="verify-invoice-meta">
              <div>
                <dt>Numéro</dt>
                <dd>{result.number}</dd>
              </div>
              <div>
                <dt>Montant</dt>
                <dd>{formatCdf(result.total)}</dd>
              </div>
              <div>
                <dt>Statut</dt>
                <dd className="text-capitalize">{result.status}</dd>
              </div>
              <div>
                <dt>Client</dt>
                <dd>{result.client_name || "—"}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{formatVerifyDate(result.created_at)}</dd>
              </div>
              {result.sale_number && (
                <div>
                  <dt>Vente liée</dt>
                  <dd>{result.sale_number}</dd>
                </div>
              )}
              {result.payment_method && (
                <div>
                  <dt>Paiement</dt>
                  <dd className="text-capitalize">{result.payment_method}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

      </div>
    </div>
  );
}
