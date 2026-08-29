import { useEffect, useMemo, useState } from "react";

import { Button, Form, Modal, Table, Badge } from "react-bootstrap";

import PageHeader from "../../components/PageHeader";

import RolePermissionsCard from "../../components/RolePermissionsCard";

import { useConfirmDialog } from "../../components/ConfirmDialog";
import { apiErrorMessage } from "../../utils/apiSync";
import { useApp } from "../../data/AppContext";
import PasswordField from "../../components/PasswordField";
import { validatePasswordStrength } from "../../utils/passwordPolicy";

import {

  ROLE_DESCRIPTIONS,

  getRolePermissions,

  ROLE_LABELS,

  PERMISSIONS,

  normalizeRole,

} from "../../utils/permissions";



export default function UsersByRole({ role }) {

  const { data, addUser, updateUser, toggleUser, deleteUser, can, currentUser, refreshData, isApiMode } =

    useApp();

  const { askConfirm, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (!isApiMode) return;
    refreshData().catch(() => {});
  }, [isApiMode, refreshData]);

  const users = useMemo(
    () =>
      data.users
        .filter((u) => normalizeRole(u.role) === role)
        .sort((a, b) => (a.name || "").localeCompare(b.name || "", "fr")),
    [data.users, role]
  );

  const permissions = getRolePermissions(role);

  const [show, setShow] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const [editId, setEditId] = useState(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const canManage = can(PERMISSIONS.usersManage);

  const canDelete = can(PERMISSIONS.usersDelete);



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
        const updates = { name: form.name, email: form.email };
        if (form.password.trim()) {
          await updateUser(editId, { ...updates, password: form.password });
        } else {
          await updateUser(editId, updates);
        }
      } else {
        await addUser({ ...form, role, password: form.password });
      }

      setShow(false);

      setForm({ name: "", email: "", password: "" });

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

        title={ROLE_LABELS[role] || role}

        subtitle={ROLE_DESCRIPTIONS[role]}

        actions={

          canManage ? (

            <Button

              className="btn-vf"

              onClick={() => {

                setEditId(null);

                setForm({ name: "", email: "", password: "" });

                setShow(true);

              }}

            >

              <i className="bi bi-person-plus me-2" />

              Ajouter

            </Button>

          ) : null

        }

      />



      <div className="panel mb-4">

        <h3 className="panel-title">

          <i className="bi bi-key me-2" />

          Ce rôle peut…

        </h3>

        <RolePermissionsCard

          role={role}

          permissions={permissions}

          description={ROLE_DESCRIPTIONS[role]}

        />

      </div>



      <div className="panel">

        <h3 className="panel-title">Utilisateurs ({users.length})</h3>

        <Table responsive hover>

          <thead>

            <tr>

              <th>Nom</th>

              <th>Email</th>

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

                        setForm({ name: u.name, email: u.email, password: "" });

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

                        title={

                          u.id === currentUser?.id

                            ? "Impossible de supprimer votre compte"

                            : "Supprimer"

                        }

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

                <td colSpan={canManage ? 4 : 3} className="empty-state">

                  Aucun utilisateur pour ce rôle.

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

                {editId ? "Modifier" : "Nouvel"} {ROLE_LABELS[role]}

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

              <PasswordField
                id="user-password"
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


