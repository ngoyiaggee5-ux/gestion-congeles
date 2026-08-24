import { useState } from "react";
import { Table, Button, Form, Row, Col } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";
import { PERMISSIONS } from "../../utils/permissions";
import { apiErrorMessage } from "../../utils/apiSync";

export default function Categories() {
  const { data, addCategory, updateCategory, deleteCategory, can } = useApp();
  const canDeleteCategory = can(PERMISSIONS.categoriesDelete);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);

  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editId) {
        await updateCategory(editId, form);
        setEditId(null);
      } else {
        await addCategory(form);
      }
      setForm({ name: "", description: "" });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Catégories"
        subtitle="Organiser le catalogue de produits congelés."
      />
      <Row className="g-3">
        <Col lg={4}>
          <div className="panel">
            <h3 className="panel-title">
              {editId ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </h3>
            <Form onSubmit={submit}>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <Form.Group className="mb-3">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button type="submit" className="btn-vf">
                  {editId ? "Mettre à jour" : "Ajouter"}
                </Button>
                {editId && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setEditId(null);
                      setForm({ name: "", description: "" });
                    }}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </Col>
        <Col lg={8}>
          <div className="panel">
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Produits</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.categories.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.name || c.NAME}</td>
                    <td>{c.description || "—"}</td>
                    <td>
                      {
                        data.products.filter((p) => p.category_id === c.id)
                          .length
                      }
                    </td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-success"
                        className="me-2"
                        onClick={() => {
                          setEditId(c.id);
                          setForm({
                            name: c.name || c.NAME || "",
                            description: c.description || "",
                          });
                        }}
                      >
                        Éditer
                      </Button>
                      {canDeleteCategory && (
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            if (confirm("Supprimer cette catégorie ?"))
                              deleteCategory(c.id);
                          }}
                        >
                          Suppr.
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </>
  );
}
