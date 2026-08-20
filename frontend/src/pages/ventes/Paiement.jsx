import { useMemo, useState } from "react";
import { Alert, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import SmartSuggest from "../../components/SmartSuggest";
import { useApp } from "../../data/AppContext";

export default function Paiement() {
  const { data, checkout, formatMoney, getProduct, suggestClients } = useApp();
  const [type, setType] = useState(
    data.cart.some((i) => i.mode === "gros") ? "gros" : "détail"
  );
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [method, setMethod] = useState("espèces");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const items = useMemo(
    () => data.cart.filter((i) => i.mode === type),
    [data.cart, type]
  );
  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
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
    if (item.type === "gros" && type === "détail") setType("gros");
  };

  const pay = (e) => {
    e.preventDefault();
    if (!items.length) {
      setErr("Aucun article pour ce mode de vente.");
      return;
    }
    if (!clientName.trim()) {
      setErr("Veuillez saisir le nom du client.");
      return;
    }
    for (const item of items) {
      const product = getProduct(item.product_id);
      if (!product || product.stock < item.quantity) {
        setErr(`Stock insuffisant pour ${product?.name || "un produit"}.`);
        return;
      }
    }
    checkout({
      client_id: clientId,
      client_name: clientName.trim(),
      payment_method: method,
      type,
    });
    setErr("");
    setMsg("Paiement validé. Facture générée automatiquement.");
    setTimeout(() => navigate("/facturation/historique"), 900);
  };

  return (
    <>
      <PageHeader
        title="Paiement"
        subtitle="Encaisser le panier avec suggestions clients intelligentes."
      />
      <div className="panel" style={{ maxWidth: 760 }}>
        {msg && <Alert variant="success">{msg}</Alert>}
        {err && <Alert variant="danger">{err}</Alert>}
        <Form onSubmit={pay}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Type de vente</Form.Label>
                <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="détail">Détail</option>
                  <option value="gros">Gros</option>
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
            {items.map((i) => (
              <li key={`${i.product_id}-${i.mode}`}>
                {getProduct(i.product_id)?.name} × {i.quantity} —{" "}
                {formatMoney(i.quantity * i.unit_price)}
              </li>
            ))}
            {!items.length && (
              <li className="text-muted">Aucun article pour ce type.</li>
            )}
          </ul>

          {items.length > 0 && (
            <div className="payment-totals mt-3">
              <div className="d-flex justify-content-between fs-5 fw-bold">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="btn-vf btn-modern mt-4"
            disabled={!items.length}
          >
            <i className="bi bi-credit-card-2-front me-2" />
            Confirmer le paiement
          </Button>
        </Form>
      </div>
    </>
  );
}
