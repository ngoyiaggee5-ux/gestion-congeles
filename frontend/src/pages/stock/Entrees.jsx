import { useState } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function Entrees() {
  const { data, addStockMovement } = useApp();
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    unit_cost: "",
    reference: "",
    note: "",
  });
  const [ok, setOk] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    addStockMovement({ ...form, type: "entrée" });
    setOk(true);
    setForm({
      product_id: "",
      quantity: "",
      unit_cost: "",
      reference: "",
      note: "",
    });
  };

  return (
    <>
      <PageHeader
        title="Entrées de stock"
        subtitle="Enregistrer les arrivages vers le congélateur."
      />
      <div className="panel" style={{ maxWidth: 720 }}>
        {ok && <Alert variant="success">Entrée enregistrée.</Alert>}
        <Form onSubmit={submit}>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Produit</Form.Label>
                <Form.Select
                  value={form.product_id}
                  onChange={(e) => {
                    const productId = e.target.value;
                    const product = data.products.find(
                      (p) => String(p.id) === String(productId)
                    );
                    setForm({
                      ...form,
                      product_id: productId,
                      unit_cost:
                        form.unit_cost ||
                        (product?.cost_price ? String(product.cost_price) : ""),
                    });
                  }}
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
            <Col md={4}>
              <Form.Group>
                <Form.Label>Coût unitaire (CDF)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={form.unit_cost}
                  onChange={(e) =>
                    setForm({ ...form, unit_cost: e.target.value })
                  }
                  placeholder="Prix payé au fournisseur"
                />
                <Form.Text className="text-muted">
                  Met à jour le coût moyen du produit.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Référence</Form.Label>
                <Form.Control
                  value={form.reference}
                  onChange={(e) =>
                    setForm({ ...form, reference: e.target.value })
                  }
                  placeholder="BE-2026-…"
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Note</Form.Label>
                <Form.Control
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit" className="btn-vf mt-3">
            Valider l’entrée
          </Button>
        </Form>
      </div>
    </>
  );
}
