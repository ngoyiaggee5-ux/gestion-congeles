import { useState } from "react";
import { Table, Button, Form, Row, Col } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

export default function Categories() {
  const { data, addCategory, updateCategory, deleteCategory } = useApp();
  const [form, setForm] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (editId) {
      updateCategory(editId, form);
      setEditId(null);
    } else {
      addCategory(form);
    }
    setForm({ name: "", description: "" });
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
                    <td className="fw-semibold">{c.name}</td>
                    <td>{c.description}</td>
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
                            name: c.name,
                            description: c.description || "",
                          });
                        }}
                      >
                        Éditer
                      </Button>
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
