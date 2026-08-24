import { PERMISSION_LABELS } from "../utils/permissions";

export default function RolePermissionsCard({ role, permissions, description }) {
  return (
    <div className="role-permissions-card">
      <p className="role-permissions-desc">{description}</p>
      <ul className="role-permissions-list">
        {permissions.map((perm) => (
          <li key={perm}>
            <i className="bi bi-check-circle-fill text-success me-2" />
            {PERMISSION_LABELS[perm] || perm}
          </li>
        ))}
      </ul>
    </div>
  );
}
