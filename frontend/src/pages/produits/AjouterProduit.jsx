import { useState } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

const empty = {
  name: "",
  sku: "",
  category_id: "",
  unit: "kg",
  price_retail: "",
  price_wholesale: "",
  stock: "0",
  min_stock: "10",
  description: "",
};

export default function AjouterProduit() {
  const { data, addProduct } = useApp();
  const [form, setForm] = useState(empty);
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    addProduct({
      ...form,
      category_id: Number(form.category_id),
      price_retail: Number(form.price_retail),
      price_wholesale: Number(form.price_wholesale),
      stock: Number(form.stock),
      min_stock: Number(form.min_stock),
    });
    setOk(true);
    setForm(empty);
    setTimeout(() => navigate("/produits/modifier"), 800);
  };

  return (
    <>
      <PageHeader
        title="Ajouter produit"
        subtitle="Enregistrer une nouvelle référence congelée."
      />
      <div className="panel" style={{ maxWidth: 820 }}>
        {ok && <Alert variant="success">Produit ajouté avec succès.</Alert>}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Nom du produit</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  name="sku"
                  value={form.sku}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Catégorie</Form.Label>
                <Form.Select
                  name="category_id"
                  value={form.category_id}
                  onChange={onChange}
                  required
                >
                  <option value="">Choisir…</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Unité</Form.Label>
                <Form.Control name="unit" value={form.unit} onChange={onChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Prix détail (XOF)</Form.Label>
                <Form.Control
                  type="number"
                  name="price_retail"
                  value={form.price_retail}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Prix gros (XOF)</Form.Label>
                <Form.Control
                  type="number"
                  name="price_wholesale"
                  value={form.price_wholesale}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Seuil</Form.Label>
                <Form.Control
                  type="number"
                  name="min_stock"
                  value={form.min_stock}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="mt-3 d-flex gap-2">
            <Button type="submit" className="btn-vf">
              Enregistrer
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => setForm(empty)}
            >
              Réinitialiser
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
