import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../data/AppContext";

export default function ProtectedRoute() {
  const { isAuthenticated, authReady } = useApp();

  if (!authReady) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
