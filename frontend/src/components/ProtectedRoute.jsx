import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../data/AppContext";

export default function ProtectedRoute() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
