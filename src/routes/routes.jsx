import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";

// public pages
import SignUp from "../pages/Signup";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Aboutus from "../pages/Aboutus";
import Contactus from "../pages/Contactus";
import Product from "../pages/Product";

// guards
import PublicRoute from "./Public";
import AdminRoute from "./AdminRoute";
import CustomerRoute from "./CustomerRoute";

// admin layout + pages
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProduct from "../pages/admin/AdminProduct";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminInquiry from "../pages/admin/AdminInquiry";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminReports from "../pages/admin/AdminReports";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminChat from "../pages/admin/AdminChat";

// customer pages
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import CustomerProfile from "../pages/customer/CustomerProfile";
import CustomerOrders from "../pages/customer/CustomerOrders";
import CustomerCart from "../pages/customer/CustomerCart";
import CustomerBuy from "../pages/customer/CustomerBuy";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // ✅ Public pages
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "aboutus", element: <Aboutus /> },
      { path: "contactus", element: <Contactus /> },
      { path: "products", element: <Product /> },

      // ✅ redirects
      { path: "cart", element: <Navigate to="/customer/cart" replace /> },
      { path: "buy", element: <Navigate to="/customer/buy" replace /> },
      { path: "profile", element: <Navigate to="/customer/profile" replace /> },
      { path: "dashboard", element: <Navigate to="/customer/dashboard" replace /> },

      // 🔓 Public-only routes (NOT logged in)
      {
        element: <PublicRoute />,
        children: [
          { path: "login", element: <Login /> },
          { path: "signup", element: <SignUp /> },
        ],
      },

      // ✅ CUSTOMER routes (customer only)
      {
        path: "customer",
        element: <CustomerRoute />,
        children: [
          { index: true, element: <CustomerDashboard /> }, // /customer
          { path: "dashboard", element: <CustomerDashboard /> },
          { path: "profile", element: <CustomerProfile /> },
          { path: "my-orders", element: <CustomerOrders /> },
          { path: "cart", element: <CustomerCart /> },
          { path: "buy", element: <CustomerBuy /> },
        ],
      },

      // ✅ ADMIN routes (admin only)
      {
        path: "admin",
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: "dashboard", element: <AdminDashboard /> },
              { path: "products", element: <AdminProduct /> },
              { path: "customers", element: <AdminCustomers /> },
              { path: "orders", element: <AdminOrders /> },
              { path: "inquiry", element: <AdminInquiry /> },
              { path: "profile", element: <AdminProfile /> },
              { path: "reports", element: <AdminReports /> },
              { path: "settings", element: <AdminSettings /> },
              { path: "chat", element: <AdminChat /> },
            ],
          },
        ],
      },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
