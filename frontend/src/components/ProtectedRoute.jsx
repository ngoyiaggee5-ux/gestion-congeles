import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../data/AppContext";

export default function ProtectedRoute() {
  const { isAuthenticated, authReady } = useApp();

  if (!authReady) {
    return (
      <div className="login-page">
        <div className="login-shell login-shell--solo">
          <div className="login-card text-center">
            <div className="spinner-border text-success" role="status" />
            <p className="mt-3 mb-0 text-muted">Chargement…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
