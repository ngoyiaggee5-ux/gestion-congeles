import { useState } from "react";
import { Table, Button, Modal, Form, Row, Col } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { useApp } from "../../data/AppContext";
import { PERMISSIONS } from "../../utils/permissions";

export default function ModifierProduit() {
  const {
    data,
    updateProduct,
    deleteProduct,
    getCategoryName,
    formatMoney,
    can,
  } = useApp();
  const { askConfirm, ConfirmDialog } = useConfirmDialog();
  const canDelete = can(PERMISSIONS.productsDelete);
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
                    onClick={() =>
                      askConfirm({
                        title: "Supprimer le produit",
                        message: `Voulez-vous supprimer « ${p.name} » ?`,
                        confirmLabel: "Oui, supprimer",
                        onConfirm: () => deleteProduct(p.id),
                      })
                    }
                    disabled={!canDelete}
                    title={canDelete ? "Supprimer" : "Réservé à l'administrateur"}
                  >
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal
        show={!!editing}
        onHide={() => setEditing(null)}
        size="lg"
        centered
        className="vf-modal"
      >
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-pencil-square me-2" />
              Modifier — {editing?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editing && (
              <>
                {editing.stock <= 0 && (
                  <div className="modal-stock-alert modal-stock-alert-danger">
                    <i className="bi bi-x-octagon-fill" />
                    Rupture de stock — réapprovisionnement urgent
                  </div>
                )}
                {editing.stock > 0 && Number(editing.stock) <= Number(editing.min_stock) && (
                  <div className="modal-stock-alert modal-stock-alert-warning">
                    <i className="bi bi-exclamation-triangle-fill" />
                    Stock faible ({editing.stock} {editing.unit}) — seuil : {editing.min_stock}
                  </div>
                )}

                <div className="modal-form-section">
                  <h6 className="modal-form-section-title">Informations générales</h6>
                  <Row className="g-3">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Nom du produit</Form.Label>
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
                        <Form.Label>SKU / Code</Form.Label>
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
                        <Form.Label>Unité de mesure</Form.Label>
                        <Form.Control
                          value={editing.unit}
                          onChange={(e) =>
                            setEditing({ ...editing, unit: e.target.value })
                          }
                          placeholder="kg, pièce, carton…"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="modal-form-section">
                  <h6 className="modal-form-section-title">Prix & stock</h6>
                  <Row className="g-3">
                    <Col sm={6} md={3}>
                      <Form.Group>
                        <Form.Label>Prix détail (CDF)</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
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
                    <Col sm={6} md={3}>
                      <Form.Group>
                        <Form.Label>Prix gros (CDF)</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
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
                    <Col sm={6} md={3}>
                      <Form.Group>
                        <Form.Label>Stock actuel</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          value={editing.stock}
                          className={
                            editing.stock <= 0
                              ? "input-stock-danger"
                              : Number(editing.stock) <= Number(editing.min_stock)
                                ? "input-stock-warning"
                                : ""
                          }
                          onChange={(e) =>
                            setEditing({ ...editing, stock: e.target.value })
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6} md={3}>
                      <Form.Group>
                        <Form.Label>Seuil d&apos;alerte</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          value={editing.min_stock}
                          onChange={(e) =>
                            setEditing({ ...editing, min_stock: e.target.value })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="modal-form-section mb-0">
                  <h6 className="modal-form-section-title">Description</h6>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editing.description || ""}
                      placeholder="Notes ou description du produit…"
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          description: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" className="btn-modal-cancel" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button type="submit" className="btn-vf btn-modern">
              <i className="bi bi-check2-circle me-2" />
              Enregistrer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <ConfirmDialog />
    </>
  );
}
