import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role"); // must be "admin"

  // not logged in → go to login
  if (!token) return <Navigate to="/login" replace />;

  // logged in but not admin → go to customer dashboard
  if (role !== "admin") return <Navigate to="/customer" replace />;

  // admin allowed
  return <Outlet />;
}
