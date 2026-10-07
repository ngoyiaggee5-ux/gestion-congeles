import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../data/AppContext";
import { canAccessRoute, getDefaultHomeForRole } from "../utils/permissions";
import AccessDenied from "./AccessDenied";

export default function RoleGuard() {
  const { currentUser, isAuthenticated } = useApp();
  const { pathname } = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessRoute(currentUser, pathname)) {
    if (pathname === "/dashboard" && currentUser?.role) {
      return <Navigate to={getDefaultHomeForRole(currentUser.role)} replace />;
    }
    return <AccessDenied />;
  }

  return <Outlet />;
}
