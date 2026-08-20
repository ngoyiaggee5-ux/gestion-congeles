import { useState } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function Sorties() {
  const { data, addStockMovement } = useApp();
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    reference: "",
    note: "",
  });
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const product = data.products.find(
      (p) => p.id === Number(form.product_id)
    );
    if (!product || product.stock < Number(form.quantity)) {
      setError("Stock insuffisant pour cette sortie.");
      setOk(false);
      return;
    }
    addStockMovement({ ...form, type: "sortie", unit_cost: 0 });
    setError("");
    setOk(true);
    setForm({ product_id: "", quantity: "", reference: "", note: "" });
  };

  return (
    <>
      <PageHeader
        title="Sorties de stock"
        subtitle="Ajustements, pertes ou sorties hors vente."
      />
      <div className="panel" style={{ maxWidth: 720 }}>
        {ok && <Alert variant="success">Sortie enregistrée.</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={submit}>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Produit</Form.Label>
                <Form.Select
                  value={form.product_id}
                  onChange={(e) =>
                    setForm({ ...form, product_id: e.target.value })
                  }
                  required
                >
                  <option value="">Choisir…</option>
                  {data.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (stock: {p.stock})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Quantité</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Référence</Form.Label>
                <Form.Control
                  value={form.reference}
                  onChange={(e) =>
                    setForm({ ...form, reference: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Motif</Form.Label>
                <Form.Control
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit" className="btn-vf mt-3">
            Valider la sortie
          </Button>
        </Form>
      </div>
    </>
  );
}
