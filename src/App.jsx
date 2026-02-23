import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import CustomerChatBot from "./pages/customer/CustomerChatBot";      // LEFT bot
import CustomerChatWidget from "./components/CustomerChatWidget";    // RIGHT normal chat

import "./App.css";

export default function App() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/signup";

  // ✅ show chats everywhere except admin + auth pages
  const showChats = !isAdminRoute && !isAuthRoute;

  return (
    <div className="min-h-screen flex flex-col relative">
      {!isAdminRoute && <Header />}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isAdminRoute && <Footer />}

      {showChats && <CustomerChatBot />}
      {showChats && <CustomerChatWidget />}
    </div>
  );
}
