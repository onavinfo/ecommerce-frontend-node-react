import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/login", { email, password });

      console.log("LOGIN RESPONSE:", res.data);

      if (res.data?.success === true) {
        // ✅ save token + role
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);

        // ✅ VERY IMPORTANT: save userId (chat needs this)
        localStorage.setItem("userId", res.data.user._id);

        // ✅ redirect by role
        if (res.data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/customer", { replace: true });
        }
      } else {
        alert(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] px-4 sm:px-6 lg:px-10 py-8">
      <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-5xl xl:max-w-6xl rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col lg:flex-row">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex w-1/2 justify-center p-10 bg-gradient-to-br from-black/40 via-indigo-900/40 to-blue-900/40">
          <div className="text-center mt-10">
            <h1 className="text-3xl xl:text-4xl font-semibold text-white mb-3">
              Welcome Back!
            </h1>
            <p className="text-base xl:text-lg text-gray-200">
              Sign in to continue your journey
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-5 sm:px-8 py-10 sm:py-12 lg:py-16">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Login Account
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none text-sm sm:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-sm sm:text-base disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-gray-300 mt-6 text-sm sm:text-base">
              Don't have an account?
              <span
                onClick={() => navigate("/signup")}
                className="text-blue-400 font-bold ml-1 cursor-pointer"
              >
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
