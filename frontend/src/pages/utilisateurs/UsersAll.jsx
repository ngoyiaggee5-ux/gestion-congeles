import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Form, Modal, Table } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import PasswordField from "../../components/PasswordField";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { useApp } from "../../data/AppContext";
import { apiErrorMessage } from "../../utils/apiSync";
import { validatePasswordStrength } from "../../utils/passwordPolicy";
import {
  ROLES,
  ROLE_LABELS,
  PERMISSIONS,
  normalizeRole,
} from "../../utils/permissions";

export default function UsersAll() {
  const {
    data,
    addUser,
    updateUser,
    toggleUser,
    deleteUser,
    can,
    currentUser,
    refreshData,
    isApiMode,
  } = useApp();
  const { askConfirm, ConfirmDialog } = useConfirmDialog();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLES.vendeur,
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const canManage = can(PERMISSIONS.usersManage);
  const canDelete = can(PERMISSIONS.usersDelete);

  useEffect(() => {
    if (!isApiMode) return;
    let active = true;
    setLoading(true);
    refreshData()
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isApiMode, refreshData]);

  const users = useMemo(
    () =>
      [...data.users].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "fr")
      ),
    [data.users]
  );

  const counts = useMemo(() => {
    const tally = { admin: 0, manager: 0, vendeur: 0 };
    for (const user of users) {
      const role = normalizeRole(user.role);
      if (tally[role] !== undefined) tally[role] += 1;
    }
    return tally;
  }, [users]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const passwordError =
      editId && !form.password.trim()
        ? null
        : validatePasswordStrength(form.password, { required: !editId });
    if (passwordError) {
      setError(passwordError);
      setSaving(false);
      return;
    }

    try {
      if (editId) {
        const updates = {
          name: form.name,
          email: form.email,
          role: normalizeRole(form.role),
        };
        if (form.password.trim()) {
          await updateUser(editId, { ...updates, password: form.password });
        } else {
          await updateUser(editId, updates);
        }
      } else {
        await addUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: normalizeRole(form.role),
        });
      }

      setShow(false);
      setForm({ name: "", email: "", password: "", role: ROLES.vendeur });
      setEditId(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) return;
    askConfirm({
      title: "Supprimer l'utilisateur",
      message: `Voulez-vous supprimer ${user.name} ?`,
      confirmLabel: "Oui, supprimer",
      onConfirm: () => deleteUser(user.id),
    });
  };

  return (
    <>
      <PageHeader
        title="Tous les utilisateurs"
        subtitle={`${users.length} compte(s) en base — ${counts.admin} ADM, ${counts.manager} manager(s), ${counts.vendeur} vendeur(s).`}
        actions={
          canManage ? (
            <Button
              className="btn-vf"
              onClick={() => {
                setEditId(null);
                setForm({ name: "", email: "", password: "", role: ROLES.vendeur });
                setShow(true);
              }}
            >
              <i className="bi bi-person-plus me-2" />
              Ajouter
            </Button>
          ) : null
        }
      />

      <div className="panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="panel-title mb-0">
            Liste complète ({users.length})
          </h3>
          {isApiMode && (
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                refreshData()
                  .catch(() => {})
                  .finally(() => setLoading(false));
              }}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              {loading ? "Actualisation…" : "Actualiser"}
            </Button>
          )}
        </div>

        <Table responsive hover>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              {canManage && <th></th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="fw-semibold">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <Badge bg="primary" className="text-uppercase">
                    {ROLE_LABELS[normalizeRole(u.role)] || u.role}
                  </Badge>
                </td>
                <td>
                  <Badge bg={u.active ? "success" : "secondary"}>
                    {u.active ? "Actif" : "Inactif"}
                  </Badge>
                </td>
                {canManage && (
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-success"
                      className="me-2"
                      onClick={() => {
                        setEditId(u.id);
                        setForm({
                          name: u.name,
                          email: u.email,
                          password: "",
                          role: normalizeRole(u.role),
                        });
                        setShow(true);
                      }}
                    >
                      Éditer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-2"
                      onClick={() => toggleUser(u.id)}
                    >
                      {u.active ? "Désactiver" : "Activer"}
                    </Button>
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(u)}
                        disabled={u.id === currentUser?.id}
                      >
                        Supprimer
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="empty-state">
                  {loading
                    ? "Chargement des utilisateurs…"
                    : "Aucun utilisateur trouvé."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {canManage && (
        <Modal show={show} onHide={() => setShow(false)} centered className="vf-modal">
          <Form onSubmit={save}>
            <Modal.Header closeButton>
              <Modal.Title>
                {editId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <Form.Group className="mb-3">
                <Form.Label>Nom complet</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email (identifiant de connexion)</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rôle</Form.Label>
                <Form.Select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                >
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <PasswordField
                id="user-password-all"
                label={editId ? "Nouveau mot de passe" : "Mot de passe initial"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editId ? "Laisser vide pour ne pas changer" : "Min. 8 car., lettre + chiffre"}
                autoComplete="new-password"
                required={!editId}
                hint={
                  editId
                    ? "Seul l'ADM peut réinitialiser le mot de passe d'un autre utilisateur."
                    : "Minimum 8 caractères avec au moins une lettre et un chiffre."
                }
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShow(false)}>
                Annuler
              </Button>
              <Button type="submit" className="btn-vf" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
      <ConfirmDialog />
    </>
  );
}
