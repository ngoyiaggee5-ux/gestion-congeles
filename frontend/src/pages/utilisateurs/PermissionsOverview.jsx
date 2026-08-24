import { Table } from "react-bootstrap";
import PageHeader from "../../components/PageHeader";
import {
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  PERMISSION_LABELS,
} from "../../utils/permissions";

const allPermissions = Object.keys(PERMISSION_LABELS);

export default function PermissionsOverview() {
  return (
    <>
      <PageHeader
        title="Rôles & permissions"
        subtitle="Qui peut faire quoi dans l'application MBALA KWA SELEMANI."
      />

      <div className="panel mb-4">
        <h3 className="panel-title">
          <i className="bi bi-shield-check me-2" />
          Matrice des droits
        </h3>
        <div className="table-responsive">
          <Table className="permissions-matrix mb-0" bordered hover>
            <thead>
              <tr>
                <th>Fonctionnalité</th>
                {Object.values(ROLES).map((role) => (
                  <th key={role} className="text-center text-capitalize">
                    {ROLE_LABELS[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPermissions.map((perm) => (
                <tr key={perm}>
                  <td>{PERMISSION_LABELS[perm]}</td>
                  {Object.values(ROLES).map((role) => {
                    const allowed = ROLE_PERMISSIONS[role]?.includes(perm);
                    return (
                      <td key={role} className="text-center permissions-matrix-cell">
                        {allowed ? (
                          <i className="bi bi-check-circle-fill perm-yes" title="Autorisé" />
                        ) : (
                          <i className="bi bi-x-circle-fill perm-no" title="Refusé" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="row g-3">
        {Object.values(ROLES).map((role) => (
          <div key={role} className="col-md-4">
            <div className="panel h-100 role-summary-panel">
              <h3 className="panel-title text-capitalize">{ROLE_LABELS[role]}</h3>
              <p className="text-muted small">{ROLE_DESCRIPTIONS[role]}</p>
              <ul className="role-permissions-list compact">
                {ROLE_PERMISSIONS[role].map((perm) => (
                  <li key={perm}>
                    <i className="bi bi-check2 me-1" />
                    {PERMISSION_LABELS[perm]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
