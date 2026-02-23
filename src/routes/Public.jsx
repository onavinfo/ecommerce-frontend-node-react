import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  //  Temporarily console log
  console.log("PublicRoute token:", token);

  // ADD (only)
  const role = localStorage.getItem("role");

  // FIX (only)
  return token ? (
    <Navigate to={role === "admin" ? "/admin" : "/customer"} replace />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
