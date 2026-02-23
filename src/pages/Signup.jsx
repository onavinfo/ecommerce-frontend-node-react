import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // ✅ FIX: userType must exist (otherwise code crashes)
  // const [userType, setUserType] = useState("customer"); // customer | admin

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("age", age);
      formData.append("country", country);
      formData.append("state", state);
      formData.append("address", address);
      formData.append("city", city);

      formData.append("role", userType);

      if (profileImage) formData.append("profileImage", profileImage);

      const res = await API.post("/auth/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success === true) {
        navigate("/login");
      } else {
        alert("User not created");
      }
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] px-3 sm:px-6 lg:px-10 py-6">
      {/* Main Card */}
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col md:flex-row">
        {/* LEFT SIDE */}
        <div className="hidden md:flex md:w-1/2 p-8 lg:p-10 bg-gradient-to-br from-black/40 via-indigo-900/40 to-blue-900/40">
          <div className="w-full flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl lg:text-4xl font-semibold text-white mb-8">
              SIGN UP
            </h1>

            <p className="text-sm lg:text-base text-gray-200 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus
              in saepe, omnis magnam possimus neque consequatur obcaecati
              praesentium amet modi...
            </p>

            <p className="text-sm text-gray-400 mt-8">
              Create your account and explore the future
            </p>
          </div>
        </div>

        {/* RIGHT SIDE (FORM) */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
              Create Account
            </h2>

            {/* ✅ Role buttons (optional) */}
            {/* <div className="flex gap-3 justify-center mb-4">
              <button
                type="button"
                onClick={() => setUserType("customer")}
                className={`px-4 py-2 rounded-xl font-semibold transition border border-white/20 text-sm sm:text-base ${
                  userType === "customer"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-white/10 text-gray-200"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => setUserType("admin")}
                className={`px-4 py-2 rounded-xl font-semibold transition border border-white/20 text-sm sm:text-base ${
                  userType === "admin"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-white/10 text-gray-200"
                }`}
              >
                Admin
              </button>
            </div> */}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Image Upload */}
              <div className="md:col-span-2">
                <div className="flex justify-center mb-2 relative">
                  <img
                    src={
                      preview ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt="Profile"
                    onClick={() =>
                      document.getElementById("profileUpload").click()
                    }
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-400 object-cover shadow-lg cursor-pointer"
                  />
                  <div
                    onClick={() =>
                      document.getElementById("profileUpload").click()
                    }
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white text-xs font-semibold cursor-pointer opacity-0 hover:opacity-100 transition"
                  >
                    {preview ? "Change Image" : "Upload Image"}
                  </div>
                </div>

                <label className="text-gray-300 text-sm flex justify-center">
                  Profile Image
                </label>

                <input
                  id="profileUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setProfileImage(file || null);
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-gray-300">Email</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-gray-300 text-sm">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-sm text-gray-300">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-3 pr-12 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-9 text-xl cursor-pointer select-none"
                >
                  {showPassword ? "❎" : "✅"}
                </span>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="text-sm text-gray-300">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full mt-1 px-4 py-3 pr-12 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <span
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-9 text-xl cursor-pointer select-none"
                >
                  {showConfirmPassword ? "❎" : "✅"}
                </span>
              </div>

              {/* Age */}
              <div>
                <label className="text-gray-300 text-sm">Age</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter age"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 text-sm sm:text-base"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-gray-300 text-sm">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Enter country"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 text-sm sm:text-base"
                />
              </div>

              {/* State */}
              <div>
                <label className="text-gray-300 text-sm">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 text-sm sm:text-base"
                />
              </div>

              {/* City */}
              <div>
                <label className="text-gray-300 text-sm">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 text-sm sm:text-base"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="text-gray-300 text-sm">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  rows={3}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="md:col-span-2 w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition text-sm sm:text-base"
              >
                Sign Up
              </button>
            </form>

            <p className="text-center text-sm sm:text-base text-gray-300 mt-6">
              Already have an account?
              <span
                onClick={() => navigate("/login")}
                className="text-blue-400 font-bold cursor-pointer ml-1"
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
