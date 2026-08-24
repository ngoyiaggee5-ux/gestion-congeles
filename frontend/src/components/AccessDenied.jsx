import { Link, useLocation } from "react-router-dom";
import { useApp } from "../data/AppContext";
import { getDefaultHomeForRole } from "../utils/permissions";
import VfButton from "./VfButton";

export default function AccessDenied() {
  const { currentUser } = useApp();
  const location = useLocation();
  const home = getDefaultHomeForRole(currentUser?.role);

  return (
    <div className="access-denied panel text-center">
      <div className="access-denied-icon">
        <i className="bi bi-shield-lock" />
      </div>
      <h2>Accès refusé</h2>
      <p className="text-muted mb-4">
        Votre rôle <strong className="text-capitalize">{currentUser?.role}</strong>{" "}
        ne permet pas d&apos;accéder à cette page.
        <br />
        <small className="text-muted">({location.pathname})</small>
      </p>
      <VfButton as={Link} to={home} icon="bi-house">
        Retour à mon espace
      </VfButton>
    </div>
  );
}
