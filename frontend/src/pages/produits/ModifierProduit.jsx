import { useState } from "react";
import { Table, Button, Modal, Form, Row, Col } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function ModifierProduit() {
  const {
    data,
    updateProduct,
    deleteProduct,
    getCategoryName,
    formatMoney,
  } = useApp();
  const [editing, setEditing] = useState(null);

  const save = (e) => {
    e.preventDefault();
    updateProduct(editing.id, editing);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Modifier produit"
        subtitle="Mettre à jour les fiches produits et le stock de référence."
      />
      <div className="panel">
        <Table responsive hover>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Détail</th>
              <th>Gros</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td className="fw-semibold">{p.name}</td>
                <td>{getCategoryName(p.category_id)}</td>
                <td>{formatMoney(p.price_retail)}</td>
                <td>{formatMoney(p.price_wholesale)}</td>
                <td>
                  {p.stock} {p.unit}
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    className="btn-outline-vf me-2"
                    variant="outline-success"
                    onClick={() => setEditing({ ...p })}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => {
                      if (confirm("Supprimer ce produit ?")) deleteProduct(p.id);
                    }}
                  >
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={!!editing} onHide={() => setEditing(null)} size="lg" centered>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>Modifier {editing?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editing && (
              <Row className="g-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>SKU</Form.Label>
                    <Form.Control
                      value={editing.sku}
                      onChange={(e) =>
                        setEditing({ ...editing, sku: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Catégorie</Form.Label>
                    <Form.Select
                      value={editing.category_id}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          category_id: Number(e.target.value),
                        })
                      }
                    >
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
                    <Form.Control
                      value={editing.unit}
                      onChange={(e) =>
                        setEditing({ ...editing, unit: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Prix détail</Form.Label>
                    <Form.Control
                      type="number"
                      value={editing.price_retail}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          price_retail: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Prix gros</Form.Label>
                    <Form.Control
                      type="number"
                      value={editing.price_wholesale}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          price_wholesale: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                      type="number"
                      value={editing.stock}
                      onChange={(e) =>
                        setEditing({ ...editing, stock: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Seuil</Form.Label>
                    <Form.Control
                      type="number"
                      value={editing.min_stock}
                      onChange={(e) =>
                        setEditing({ ...editing, min_stock: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={editing.description || ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          description: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button type="submit" className="btn-vf">
              Enregistrer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
