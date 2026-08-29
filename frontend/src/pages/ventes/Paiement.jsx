import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import SmartSuggest from "../../components/SmartSuggest";
import CashierCalculator from "../../components/CashierCalculator";
import { useApp } from "../../data/AppContext";
import {
  formatCdf,
  formatUsd,
  cdfToUsd,
  usdToCdf,
} from "../../utils/settings";
import { cartLineTotal, formatCartQuantity } from "../../utils/saleAmount";

function resolveSaleType(cart) {
  const hasDetail = cart.some((i) => i.mode === "détail");
  const hasGros = cart.some((i) => i.mode === "gros");
  if (hasDetail) return "détail";
  if (hasGros) return "gros";
  return "détail";
}

export default function Paiement() {
  const { data, checkout, formatMoney, getProduct, suggestClients } = useApp();
  const [type, setType] = useState(() => resolveSaleType(data.cart));
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [method, setMethod] = useState("espèces");
  const [payCurrency, setPayCurrency] = useState("CDF");
  const [received, setReceived] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  const settings = data.settings;
  const usdRate = Number(settings?.usdRate) || 2800;

  const cartByMode = useMemo(
    () => ({
      détail: data.cart.filter((i) => i.mode === "détail"),
      gros: data.cart.filter((i) => i.mode === "gros"),
    }),
    [data.cart]
  );

  useEffect(() => {
    const currentItems = cartByMode[type];
    if (currentItems.length) return;
    if (cartByMode.détail.length) setType("détail");
    else if (cartByMode.gros.length) setType("gros");
  }, [cartByMode, type]);

  const items = cartByMode[type];
  const totalCdf = items.reduce((s, i) => s + cartLineTotal(i), 0);
  const totalUsd = cdfToUsd(totalCdf, settings);
  const receivedNum = parseFloat(received) || 0;

  const change = useMemo(() => {
    if (payCurrency === "USD") {
      const changeUsd = receivedNum - totalUsd;
      return {
        primary: usdToCdf(changeUsd, settings),
        primaryLabel: "CDF",
        secondary: changeUsd,
        secondaryLabel: "USD",
      };
    }
    const changeCdf = receivedNum - totalCdf;
    return {
      primary: changeCdf,
      primaryLabel: "CDF",
      secondary: null,
    };
  }, [payCurrency, receivedNum, totalCdf, totalUsd, settings]);

  const clientSuggestions = useMemo(
    () => suggestClients(clientName, type),
    [suggestClients, clientName, type]
  );

  const selectClient = (id) => {
    setClientId(id);
    if (!id) return;
    const client = data.clients.find((c) => String(c.id) === id);
    if (client) setClientName(client.name);
  };

  const pickSuggestion = (item) => {
    setClientName(item.name);
    setClientId(item.id ? String(item.id) : "");
  };

  const pay = async (e) => {
    e.preventDefault();
    if (!items.length) {
      setErr("Aucun article pour ce mode de vente.");
      return;
    }
    if (!clientName.trim()) {
      setErr("Veuillez saisir le nom du client.");
      return;
    }
    if (method === "espèces" && receivedNum > 0) {
      const insufficient =
        payCurrency === "USD"
          ? receivedNum < totalUsd
          : receivedNum < totalCdf;
      if (insufficient) {
        setErr("Montant reçu insuffisant.");
        return;
      }
    }
    for (const item of items) {
      const product = getProduct(item.product_id);
      if (!product || product.stock < item.quantity) {
        setErr(`Stock insuffisant pour ${product?.name || "un produit"}.`);
        return;
      }
    }
    setErr("");
    setMsg("");
    setPaying(true);
    try {
      const ok = await checkout({
        client_id: clientId,
        client_name: clientName.trim(),
        payment_method: method,
        type,
      });
      if (ok === false) {
        setErr("Impossible de valider la vente.");
        return;
      }
      setMsg("Paiement validé. Facture générée automatiquement.");
      setTimeout(() => navigate("/facturation/historique"), 900);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.items?.[0] ||
        "Erreur lors du paiement. Réessayez ou contactez l'administrateur.";
      setErr(message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Paiement"
        subtitle="Encaisser le panier — calculatrice et rendu de monnaie."
      />
      <Row className="g-4">
        <Col lg={7}>
          <div className="panel">
            {msg && <Alert variant="success">{msg}</Alert>}
            {err && <Alert variant="danger">{err}</Alert>}
            <Form onSubmit={pay}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Type de vente</Form.Label>
                    <Form.Select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="détail" disabled={!cartByMode.détail.length}>
                        Détail{cartByMode.détail.length ? ` (${cartByMode.détail.length})` : ""}
                      </option>
                      <option value="gros" disabled={!cartByMode.gros.length}>
                        Gros{cartByMode.gros.length ? ` (${cartByMode.gros.length})` : ""}
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Client enregistré (optionnel)</Form.Label>
                    <Form.Select
                      value={clientId}
                      onChange={(e) => selectClient(e.target.value)}
                    >
                      <option value="">— Nouveau client —</option>
                      {data.clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <SmartSuggest
                    label="Nom du client *"
                    value={clientName}
                    onChange={(value) => {
                      setClientName(value);
                      if (clientId) setClientId("");
                    }}
                    onSelect={pickSuggestion}
                    suggestions={clientSuggestions}
                    placeholder="Tapez un nom — clients fidèles et récents en premier"
                    required
                    emptyText="Aucun client trouvé — vous pouvez saisir un nouveau nom"
                  />
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Mode de paiement</Form.Label>
                    <Form.Select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                    >
                      <option value="espèces">Espèces</option>
                      <option value="mobile money">Mobile Money</option>
                      <option value="carte">Carte</option>
                      <option value="crédit">Crédit</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {!clientName && clientSuggestions.length > 0 && (
                <div className="quick-suggest-row mt-3">
                  <span className="text-muted small me-2">Suggestions :</span>
                  {clientSuggestions.slice(0, 3).map((item) => (
                    <button
                      key={`${item.name}-${item.id}`}
                      type="button"
                      className="quick-suggest-chip"
                      onClick={() => pickSuggestion(item)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}

              <ul className="mt-3 mb-0">
                {items.map((i) => {
                  const product = getProduct(i.product_id);
                  return (
                  <li key={`${i.product_id}-${i.mode}`}>
                    {product?.name} — {formatCartQuantity(i.quantity, product?.unit)} —{" "}
                    {formatMoney(cartLineTotal(i))}
                  </li>
                  );
                })}
                {!items.length && (
                  <li className="text-muted">Aucun article pour ce type.</li>
                )}
              </ul>

              {items.length > 0 && (
                <div className="payment-totals mt-3">
                  <div className="d-flex justify-content-between fs-5 fw-bold">
                    <span>Total</span>
                    <span>{formatCdf(totalCdf)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted small mt-1">
                    <span>Équivalent USD</span>
                    <span>{formatUsd(totalUsd)}</span>
                  </div>
                  <div className="text-muted small mt-1">
                    Taux : 1 USD = {usdRate.toLocaleString("fr-FR")} CDF
                  </div>
                </div>
              )}

              {items.length > 0 && (
                <div className="payment-cash-section mt-4">
                  <h6 className="mb-3">
                    <i className="bi bi-cash-coin me-2" />
                    Encaissement
                  </h6>
                  <Row className="g-3">
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label>Devise reçue</Form.Label>
                        <Form.Select
                          value={payCurrency}
                          onChange={(e) => {
                            setPayCurrency(e.target.value);
                            setReceived("");
                          }}
                        >
                          <option value="CDF">CDF — Franc congolais</option>
                          <option value="USD">USD — Dollar américain</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label>
                          Montant reçu ({payCurrency})
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step={payCurrency === "USD" ? "0.01" : "1"}
                          value={received}
                          onChange={(e) => setReceived(e.target.value)}
                          placeholder={
                            payCurrency === "USD"
                              ? formatUsd(totalUsd)
                              : String(Math.ceil(totalCdf))
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {receivedNum > 0 && (
                    <div
                      className={`payment-change mt-3${
                        change.primary < 0 ? " is-negative" : ""
                      }`}
                    >
                      <span className="payment-change-label">Rendu</span>
                      <span className="payment-change-value">
                        {formatCdf(change.primary)}
                      </span>
                      {payCurrency === "USD" && change.secondary != null && (
                        <span className="payment-change-sub">
                          ({formatUsd(change.secondary)} USD — taux{" "}
                          {usdRate.toLocaleString("fr-FR")} CDF/USD)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="btn-vf btn-modern mt-4"
                disabled={!items.length || paying}
              >
                <i className="bi bi-credit-card-2-front me-2" />
                {paying ? "Validation…" : "Confirmer le paiement"}
              </Button>
            </Form>
          </div>
        </Col>
        <Col lg={5}>
          <CashierCalculator
            onApply={(value) => setReceived(String(value))}
          />
        </Col>
      </Row>
    </>
  );
}
