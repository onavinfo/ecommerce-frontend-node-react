import { Navigate, Outlet } from "react-router-dom";

export default function CustomerRoute() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role"); // must be "customer"

  // not logged in → go to login
  if (!token) return <Navigate to="/login" replace />;

  // logged in but not customer → go to admin dashboard
  if (role !== "customer") return <Navigate to="/admin" replace />;

  // customer allowed
  return <Outlet />;
}
