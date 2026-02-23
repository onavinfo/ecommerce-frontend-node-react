import React, { useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const role = localStorage.getItem("role");
  const isCustomer = role === "customer";

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("role");
    setMenuOpen(false);
    navigate("/login");
  };

  const handleProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleNavClick = () => setMenuOpen(false);

  const handleCart = () => {
    setMenuOpen(false);
    navigate("/cart");
  };

  const linkBase =
    "text-gray-700 hover:text-indigo-600 font-medium transition";
  const activeLink = "text-indigo-700 font-bold";

  return (
    // ✅ Sticky header
    <header className="sticky top-0 z-50">
      <nav className="bg-purple-200 shadow-md px-3 sm:px-4 lg:px-8 py-2.5">
        {/* top row */}
        <div className="mx-auto flex items-center justify-between gap-3">
          {/* logo */}
          <Link
            to="/home"
            onClick={handleNavClick}
            className="flex items-center gap-2 shrink-0"
          >
            <img
              className="w-9 h-9 sm:w-10 sm:h-10"
              src="/add-to-cart.png"
              alt="logo"
            />
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-indigo-600 leading-none">
              MyApp
            </h1>
          </Link>

          {/* desktop links (show from lg) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `${linkBase} text-lg ${isActive ? activeLink : ""}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/aboutus"
              className={({ isActive }) =>
                `${linkBase} text-lg ${isActive ? activeLink : ""}`
              }
            >
              About us
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `${linkBase} text-lg ${isActive ? activeLink : ""}`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/contactus"
              className={({ isActive }) =>
                `${linkBase} text-lg ${isActive ? activeLink : ""}`
              }
            >
              Contact us
            </NavLink>
          </div>

          {/* desktop auth buttons (show from lg) */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {isLoggedIn ? (
              <>
                {/* cart only customer */}
                {isCustomer && (
                  <button
                    onClick={handleCart}
                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:opacity-90 transition flex items-center justify-center"
                    title="Cart"
                  >
                    <img
                      className="w-6 h-6"
                      src="/add-to-cart.png"
                      alt="cart"
                    />
                  </button>
                )}

                <button
                  onClick={handleProfile}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:opacity-90 transition"
                >
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 font-bold"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-600 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* mobile menu button (show below lg) */}
          <button
            className="lg:hidden bg-white/40 hover:bg-white/60 transition px-3 py-2 rounded-lg font-bold text-indigo-700"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* mobile dropdown */}
        {menuOpen && (
          <div className="lg:hidden mt-3 mx-auto max-w-7xl p-4 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/30">
            <div className="flex flex-col gap-3">
              <Link
                to="/home"
                onClick={handleNavClick}
                className={`${linkBase} text-base sm:text-lg`}
              >
                Home
              </Link>
              <Link
                to="/aboutus"
                onClick={handleNavClick}
                className={`${linkBase} text-base sm:text-lg`}
              >
                About us
              </Link>
              <Link
                to="/products"
                onClick={handleNavClick}
                className={`${linkBase} text-base sm:text-lg`}
              >
                Products
              </Link>
              <Link
                to="/contactus"
                onClick={handleNavClick}
                className={`${linkBase} text-base sm:text-lg`}
              >
                Contact us
              </Link>

              <div className="h-px bg-white/40 my-2" />

              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  {isCustomer && (
                    <button
                      onClick={handleCart}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <img
                        className="w-5 h-5"
                        src="/add-to-cart.png"
                        alt="cart"
                      />
                      Cart
                    </button>
                  )}

                  <button
                    onClick={handleProfile}
                    className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:opacity-90 transition"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/login"
                    onClick={handleNavClick}
                    className="flex-1 text-center text-gray-700 hover:text-indigo-600 font-bold border border-white/40 rounded-lg py-2"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    onClick={handleNavClick}
                    className="flex-1 text-center bg-indigo-500 text-white px-4 py-2 font-bold hover:bg-indigo-600 transition rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
