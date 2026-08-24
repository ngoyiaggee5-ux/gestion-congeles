import { useState } from "react";
import { Button, Form, Modal, Row, Col, Table } from "react-bootstrap";
import PageHeader from "../components/PageHeader";
import { useApp } from "../data/AppContext";
import { PERMISSIONS } from "../utils/permissions";
import { apiErrorMessage } from "../utils/apiSync";

const empty = {
  name: "",
  phone: "",
  email: "",
  type: "détail",
  address: "",
};

export default function Clients() {
  const { data, addClient, updateClient, deleteClient, can } = useApp();
  const canDelete = can(PERMISSIONS.clientsDelete);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const openCreate = () => {
    setEditId(null);
    setForm(empty);
    setShow(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({ ...c });
    setShow(true);
  };

  const [error, setError] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editId) await updateClient(editId, form);
      else await addClient(form);
      setShow(false);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Fichier clients détail et gros."
        actions={
          <Button className="btn-vf" onClick={openCreate}>
            Nouveau client
          </Button>
        }
      />
      <div className="panel">
        <Table responsive hover>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Type</th>
              <th>Adresse</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.clients.map((c) => (
              <tr key={c.id}>
                <td className="fw-semibold">{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td className="text-capitalize">{c.type}</td>
                <td>{c.address}</td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-success"
                    className="me-2"
                    onClick={() => openEdit(c)}
                  >
                    Éditer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => {
                      if (confirm("Supprimer ce client ?")) deleteClient(c.id);
                    }}
                    disabled={!canDelete}
                    title={canDelete ? "Supprimer" : "Réservé à l'administrateur"}
                  >
                    Suppr.
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={show} onHide={() => setShow(false)} centered className="vf-modal">
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>{editId ? "Modifier client" : "Nouveau client"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="détail">Détail</option>
                    <option value="gros">Gros</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
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
