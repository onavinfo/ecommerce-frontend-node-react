import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  // close drawer when route changes (mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] text-white px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] h-full">
          {/* Mobile Topbar */}
          <div className="lg:hidden border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                  <span className="text-lg font-bold">A</span>
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-tight">
                    Admin Dashboard
                  </h2>
                  <p className="text-white/60 text-xs">Overview & management</p>
                </div>
              </div>

              <button
                onClick={() => setOpen(true)}
                className="rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 transition px-3 py-2"
                aria-label="Open sidebar"
              >
                <Icon name="menu" />
              </button>
            </div>
          </div>

          {/* ✅ Sidebar (Desktop) - make it overflow-hidden; scroll happens inside SidebarContent */}
          <aside className="hidden lg:block h-full overflow-hidden border-r border-white/10 bg-white/5">
            <SidebarContent onLogout={handleLogout} stickyHeader />
          </aside>

          {/* Mobile Drawer Sidebar */}
          {open && (
            <div className="lg:hidden fixed inset-0 z-50">
              {/* overlay */}
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setOpen(false)}
              />

              {/* drawer */}
              <div className="absolute left-0 top-0 h-full w-[84%] max-w-[320px] bg-[#07133a]/95 border-r border-white/10 backdrop-blur-xl overflow-hidden">
                <SidebarContent
                  onLogout={handleLogout}
                  onClose={() => setOpen(false)}
                  stickyHeader
                />
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="h-full overflow-y-auto scrollbar-hide p-4 sm:p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

function SidebarContent({ onLogout, onClose, stickyHeader = false }) {
  return (
    // ✅ this is the scroll container now
    <div className="h-full overflow-y-auto scrollbar-hide">
      {/* ✅ STICKY header (LEFT side) */}
      <div
        className={`${
          stickyHeader ? "sticky top-0 z-30" : ""
        } bg-[#07133a]/80 backdrop-blur-xl border-b border-white/10`}
      >
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
              <span className="text-lg font-bold">A</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Admin Dashboard</h2>
              <p className="text-white/60 text-sm">Overview & management</p>
            </div>
          </div>

          {/* ✅ show close button only in mobile drawer */}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 transition px-3 py-2"
              aria-label="Close sidebar"
            >
              <Icon name="close" />
            </button>
          )}
        </div>
      </div>

      {/* sidebar body */}
      <div className="px-3">
        <div className="space-y-1">
          <SideLink to="/admin/dashboard" label="Dashboard" icon="home" />
          <SideLink to="/admin/customers" label="Customers" icon="users" />
          <SideLink to="/admin/products" label="Product" icon="plus" />
          <SideLink to="/admin/orders" label="Orders" icon="orders" />
          <SideLink to="/page/home" label="Home" icon="home" />
          <SideLink to="/admin/chat" label="Chat" icon="chat" />
          <SideLink to="/admin/inquiry" label="Inquiry" icon="inquiry" />
          <SideLink to="/admin/settings" label="Settings" icon="settings" />
        </div>

        <div className="mt-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 transition px-4 py-3"
          >
            <Icon name="power" />
            <span className="font-medium">Log Out</span>
          </button>

          <div className="mt-4 px-2 text-white/70 text-sm">
            <p className="mb-2 font-bold">➤ Quick links:</p>
            <div className="flex gap-3">
              <Link className="hover:text-white" to="/admin/products">
                ◆Products
              </Link>
              <Link className="hover:text-white" to="/admin/profile">
                ◆Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}

function SideLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition
        ${
          isActive
            ? "bg-white/10 border-white/15"
            : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
        }`
      }
      end
    >
      <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
        <Icon name={icon} />
      </div>
      <span className="text-sm font-medium text-white/80">{label}</span>
    </NavLink>
  );
}

/* Icons */
function Icon({ name = "home" }) {
  const common = {
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "home":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "users":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M17 21c0-3-2.5-5-5-5s-5 2-5 5" />
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M20 21c0-2-1.2-3.5-3-4.3" />
        </svg>
      );
    case "orders":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M7 7h14" />
          <path d="M7 12h14" />
          <path d="M7 17h14" />
          <path d="M3 7h.01" />
          <path d="M3 12h.01" />
          <path d="M3 17h.01" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.05.05-1.6 2.77-.07-.02a2 2 0 0 0-2.06.63l-.03.06H8l-.03-.06a2 2 0 0 0-2.06-.63l-.07.02-1.6-2.77.05-.05A1.8 1.8 0 0 0 4.6 15l-.02-.07V9l.02-.07A1.8 1.8 0 0 0 4.24 6.95l-.05-.05L5.8 4.13l.07.02a2 2 0 0 0 2.06-.63L8 3.46h8l.03.06a2 2 0 0 0 2.06.63l.07-.02 1.6 2.77-.05.05A1.8 1.8 0 0 0 19.4 9l.02.07v6Z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "power":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 2v10" />
          <path d="M7.5 4.5A8 8 0 1 0 16.5 4.5" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      );
    case "close":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M18 6 6 18" />
          <path d="M6 6l12 12" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
          <path d="M8 9h8" />
          <path d="M8 13h6" />
        </svg>
      );
    case "inquiry":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" />
          <path d="M12 17h.01" />
        </svg>
      );
    default:
      return null;
  }
}

export default AdminLayout;
