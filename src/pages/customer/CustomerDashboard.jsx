import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import CustomerChatWidget from "../../components/CustomerChatWidget";

const BACKEND = "http://localhost:3000";
const FALLBACK_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const token = useMemo(
    () => localStorage.getItem("token") || sessionStorage.getItem("token"),
    []
  );

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Right panel views
  const [view, setView] = useState("overview"); // overview | profile | orders

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Edit profile state
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    country: "",
    state: "",
    city: "",
    address: "",
  });

  // ✅ Photo upload states (for hover/click UI)
  const [profileImage, setProfileImage] = useState(null); // File
  const [preview, setPreview] = useState(""); // preview URL

  const didFetch = useRef(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    navigate("/login");
  };

  const fetchUser = async () => {
    if (!token) return navigate("/login");

    try {
      const response = await API.get("/user/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const u = response.data.user;
      setUserData(u);

      // ✅ store userId (needed for chat + other features)
      if (u?._id) localStorage.setItem("userId", u._id);

      setForm({
        name: u?.name || "",
        phone: u?.phone || "",
        age: u?.age ? String(u.age) : "",
        country: u?.country || "",
        state: u?.state || "",
        city: u?.city || "",
        address: u?.address || "",
      });

      // ✅ set preview from server image (if available)
      if (u?.profileImage) {
        const imgUrl = u.profileImage.startsWith("http")
          ? u.profileImage
          : `${BACKEND}${u.profileImage}`;
        setPreview(imgUrl);
      } else {
        setPreview("");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    }
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ✅ sidebar profile image
  const profileImageUrl = useMemo(() => {
    if (preview) return preview;

    const serverPath = userData?.profileImage;
    if (!serverPath) return FALLBACK_AVATAR;

    if (serverPath.startsWith("http")) return serverPath;
    return `${BACKEND}${serverPath}`;
  }, [preview, userData?.profileImage]);

  // Load orders when opening Orders view
  useEffect(() => {
    const fetchOrders = async () => {
      if (view !== "orders") return;
      if (!token) return navigate("/login");

      try {
        setOrdersLoading(true);
        const res = await API.get("/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = Array.isArray(res.data) ? res.data : res.data.orders;
        setOrders(list || []);
      } catch (e) {
        console.error(e);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [view, token, navigate]);

  const onChange = (e) => {
    setMsg("");
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // ✅ Update profile with photo (MATCHES YOUR WORKING ROUTE)
  // PUT /user/update-profile (multipart/form-data)
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!token) return navigate("/login");

    try {
      setSaving(true);
      setMsg("");

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("age", form.age);
      fd.append("country", form.country);
      fd.append("state", form.state);
      fd.append("city", form.city);
      fd.append("address", form.address);

      if (profileImage) fd.append("profileImage", profileImage);

      await API.put("/user/update-profile", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMsg("Profile updated ✅");
      setProfileImage(null);

      // refresh so overview updates
      await fetchUser();

      // go back to overview
      setView("overview");
    } catch (e) {
      console.error(e);
      setMsg(e?.response?.data?.message || "Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] p-4">
        <div className="text-white text-lg animate-pulse">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7]">
      {/* ✅ container */}
      <div className="min-h-screen w-full p-3 sm:p-6 lg:p-10">
        <div className="relative w-full max-w-6xl mx-auto rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_20px_80px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          {/* ✅ IMPORTANT: layout fixed */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
              {/* ✅ LEFT PANEL FIXED/STICKY */}
              <aside className="lg:sticky lg:top-0 lg:h-[calc(100vh-2.5rem)] lg:self-start border-b lg:border-b-0 lg:border-r border-white/20">
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center">
                  <h2 className="text-2xl sm:text-3xl text-center font-bold text-white mb-7">
                    Customer Dashboard
                  </h2>

                  <div className="relative">
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-blue-400 object-cover shadow-lg"
                    />
                    <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0b1d4d]" />
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-white font-semibold text-base sm:text-lg">
                      {userData?.name || "User"}
                    </p>
                    <p className="text-white/70 text-xs sm:text-sm break-all">
                      {userData?.email}
                    </p>
                  </div>

                  {/* ✅ Buttons */}
                  <div className="w-full mt-7 space-y-3">
                    <DashBtn
                      active={view === "overview"}
                      onClick={() => setView("overview")}
                      text="Profile Overview"
                      gradient="from-sky-500 to-indigo-600"
                    />

                    <DashBtn
                      active={view === "profile"}
                      onClick={() => setView("profile")}
                      text="Edit Profile"
                      gradient="from-green-500 to-emerald-600"
                    />

                    <DashBtn
                      active={view === "orders"}
                      onClick={() => setView("orders")}
                      text="My Orders"
                      gradient="from-purple-500 to-pink-600"
                    />

                    <button
                      onClick={logout}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:opacity-90 transition active:scale-[0.99]"
                    >
                      Logout
                    </button>
                  </div>

                  <p className="mt-6 text-white/50 text-xs">
                    Tip: Keep your profile updated.
                  </p>
                </div>
              </aside>

              {/* ✅ RIGHT PANEL (scroll) */}
              <main className="lg:h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
                <div className="p-4 sm:p-6 lg:p-8 text-gray-200">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <span className="inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs">
                      {view === "overview"
                        ? "Profile Overview"
                        : view === "profile"
                        ? "Edit Profile"
                        : "My Orders"}
                    </span>

                    <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-black/20 border border-white/10 text-white/60 text-xs">
                      Customer
                    </span>
                  </div>

                  {msg && (
                    <div className="mb-4 rounded-2xl bg-white/10 border border-white/20 p-4 text-white">
                      {msg}
                    </div>
                  )}

                  {view === "overview" && <Overview userData={userData} />}

                  {view === "profile" && (
                    <EditProfile
                      form={form}
                      onChange={onChange}
                      onSubmit={saveProfile}
                      saving={saving}
                      email={userData?.email || ""}
                      preview={preview}
                      setProfileImage={setProfileImage}
                      setPreview={setPreview}
                    />
                  )}

                  {view === "orders" && (
                    <OrdersView loading={ordersLoading} orders={orders} />
                  )}

                  <div className="h-3" />
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Floating chat widget (customer) */}
      <CustomerChatWidget
        userId={userData?._id || localStorage.getItem("userId")}
      />
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function DashBtn({ active, onClick, text, gradient }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-xl text-white font-semibold transition active:scale-[0.99]
        bg-gradient-to-r ${gradient} hover:opacity-90
        ${active ? "ring-2 ring-white/50" : "ring-0"}
      `}
    >
      {text}
    </button>
  );
}

function Overview({ userData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <InfoRow label="Name:" value={userData?.name} />
      <InfoRow label="Email:" value={userData?.email} />
      <InfoRow label="Phone:" value={userData?.phone} />
      <InfoRow label="Age:" value={userData?.age} />
      <InfoRow label="Country:" value={userData?.country} />
      <InfoRow label="State:" value={userData?.state} />
      <InfoRow label="City:" value={userData?.city} />
      <div className="sm:col-span-2">
        <InfoRow label="Address:" value={userData?.address} />
      </div>
    </div>
  );
}

function EditProfile({
  form,
  onChange,
  onSubmit,
  saving,
  email,
  preview,
  setProfileImage,
  setPreview,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* ✅ YOUR SAME CLICK + HOVER UPLOAD UI */}
      <div className="md:col-span-2">
        <div className="flex justify-center mb-2 relative">
          <img
            src={preview || FALLBACK_AVATAR}
            alt="Profile"
            onClick={() =>
              document.getElementById("profileUploadDash").click()
            }
            className="w-24 h-24 rounded-full border-4 border-blue-400 object-cover shadow-lg cursor-pointer"
          />
          <div
            onClick={() =>
              document.getElementById("profileUploadDash").click()
            }
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white text-xs font-semibold cursor-pointer opacity-0 hover:opacity-100 transition"
          >
            {preview ? "Change Image" : "Upload Image"}
          </div>
        </div>

        <label className="text-gray-300 text-m flex justify-center">
          Profile Image
        </label>

        <input
          id="profileUploadDash"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" name="name" value={form.name} onChange={onChange} />
        <Field
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={onChange}
        />

        <div className="sm:col-span-2">
          <label className="text-sm text-white/80">Email</label>
          <input
            value={email}
            readOnly
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/5 text-gray-300 border border-white/20 cursor-not-allowed"
          />
        </div>

        <Field label="Age" name="age" value={form.age} onChange={onChange} />
        <Field
          label="Country"
          name="country"
          value={form.country}
          onChange={onChange}
        />
        <Field
          label="State"
          name="state"
          value={form.state}
          onChange={onChange}
        />
        <Field label="City" name="city" value={form.city} onChange={onChange} />

        <div className="sm:col-span-2">
          <label className="text-sm text-white/80">Address</label>
          <textarea
            rows={3}
            name="address"
            value={form.address}
            onChange={onChange}
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
            placeholder="Enter address"
          />
        </div>
      </div>

      <button
        disabled={saving}
        type="submit"
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

function OrdersView({ loading, orders }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-white/85">
        Loading orders...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-white/85">
        No orders found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div
          key={o._id || o.id}
          className="rounded-2xl bg-white/5 border border-white/10 p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-white font-semibold break-all">
              Order: <span className="text-white/80">{o._id || o.id}</span>
            </p>
            <p className="text-white/70 text-sm">
              {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
            </p>
          </div>

          <div className="mt-2 text-white/85 text-sm">
            <p>
              <b>Status:</b> {o.status || "—"}
            </p>
            <p>
              <b>Total:</b>{" "}
              {typeof o.totalAmount === "number"
                ? `₹${o.totalAmount.toLocaleString("en-IN")}`
                : typeof o.total === "number"
                ? `₹${o.total.toLocaleString("en-IN")}`
                : "—"}
            </p>
          </div>

          {Array.isArray(o.items) && o.items.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {o.items.map((it, idx) => (
                <div
                  key={`${o._id}-${idx}`}
                  className="rounded-xl bg-white/5 border border-white/10 p-3"
                >
                  <p className="text-white font-semibold text-sm">
                    {it.name || "Item"}
                  </p>
                  <p className="text-white/70 text-xs">
                    Qty: {it.qty || it.quantity || 1} • Price: ₹
                    {Number(it.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Field({ label, name, value, onChange, required }) {
  return (
    <div>
      <label className="text-sm text-white/80">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  const safeValue =
    value === null || value === undefined || value === ""
      ? "—"
      : String(value);

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <span className="text-blue-400 font-semibold text-sm sm:text-base">
          {label}
        </span>
        <span className="text-white/85 text-sm sm:text-base break-words">
          {safeValue}
        </span>
      </div>
    </div>
  );
}
