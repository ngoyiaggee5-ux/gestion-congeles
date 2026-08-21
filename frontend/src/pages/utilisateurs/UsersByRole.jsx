import { useState } from "react";
import { Button, Form, Modal, Table, Badge } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import { useApp } from "../../data/AppContext";

const roleMeta = {
  administrateur: {
    title: "Administrateurs",
    subtitle: "Accès complet à la plateforme.",
  },
  vendeur: {
    title: "Vendeurs",
    subtitle: "Gestion des ventes et du panier.",
  },
  caissier: {
    title: "Caissiers",
    subtitle: "Encaissement et facturation.",
  },
};

export default function UsersByRole({ role }) {
  const { data, addUser, updateUser, toggleUser } = useApp();
  const meta = roleMeta[role];
  const users = data.users.filter((u) => u.role === role);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editId, setEditId] = useState(null);

  const save = (e) => {
    e.preventDefault();
    if (editId) updateUser(editId, { ...form, role });
    else addUser({ ...form, role });
    setShow(false);
    setForm({ name: "", email: "" });
    setEditId(null);
  };

  return (
    <>
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        actions={
          <Button
            className="btn-vf"
            onClick={() => {
              setEditId(null);
              setForm({ name: "", email: "" });
              setShow(true);
            }}
          >
            Ajouter
          </Button>
        }
      />
      <div className="panel">
        <Table responsive hover>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="fw-semibold">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <Badge bg={u.active ? "success" : "secondary"}>
                    {u.active ? "Actif" : "Inactif"}
                  </Badge>
                </td>
                <td className="text-end">
                  <Button
                    size="sm"
                    variant="outline-success"
                    className="me-2"
                    onClick={() => {
                      setEditId(u.id);
                      setForm({ name: u.name, email: u.email });
                      setShow(true);
                    }}
                  >
                    Éditer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => toggleUser(u.id)}
                  >
                    {u.active ? "Désactiver" : "Activer"}
                  </Button>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={4} className="empty-state">
                  Aucun utilisateur pour ce rôle.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={show} onHide={() => setShow(false)} centered className="vf-modal">
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editId ? "Modifier" : "Nouvel"} {role}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Form.Group>
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
