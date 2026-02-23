import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // Editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // image upload
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await API.get("/user/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;

        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setAge(user.age || "");
        setCountry(user.country || "");
        setState(user.state || "");
        setAddress(user.address || "");
        setCity(user.city || "");

        if (user.profileImage) {
          const imgUrl = user.profileImage.startsWith("http")
            ? user.profileImage
            : `http://localhost:3000${user.profileImage}`;
          setPreview(imgUrl);
        } else {
          setPreview("");
        }

        setLoading(false);
      } catch (error) {
        console.error("Admin profile fetch error:", error);
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("age", age);
      formData.append("country", country);
      formData.append("state", state);
      formData.append("address", address);
      formData.append("city", city);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await API.put("/user/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Admin Profile updated successfully ✅");
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.error("Admin update failed:", error);
      alert(error.response?.data?.message || "Profile update failed ❌");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-white text-base sm:text-lg animate-pulse">
          Loading Admin Profile...
        </p>
      </div>
    );
  }

  return (
    <div className=" flex items-center justify-center">
      <div className="w-full  bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-5 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-5 sm:mb-6">
          Admin Profile
        </h2>

        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/*  Image Upload*/}
          <div className="md:col-span-2">
            <div className="flex justify-center mb-2 relative">
              <img
                src={
                  preview ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt="Profile"
                onClick={() => document.getElementById("profileUpload").click()}
                className="w-24 h-24 rounded-full border-4 border-blue-400 object-cover shadow-lg cursor-pointer"
              />
              <div
                onClick={() => document.getElementById("profileUpload").click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white text-xs font-semibold cursor-pointer opacity-0 hover:opacity-100 transition"
              >
                {preview ? "Change Image" : "Upload Image"}
              </div>
            </div>

            <label className="text-gray-300 text-m flex justify-center">
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
          <div>
            <label className="text-gray-300 text-sm">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="text-gray-300 text-sm">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 text-gray-300 border border-white/20 cursor-not-allowed text-sm sm:text-base"
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
          <div className="">
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
            className="md:col-span-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition text-sm sm:text-base"
          >
            Update Admin Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
