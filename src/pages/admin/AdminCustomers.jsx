import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // popup
  const [open, setOpen] = useState(false);

  // edit popup
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");

  // form fields (shared)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  //  separate image state for ADD
  const [addProfileImage, setAddProfileImage] = useState(null);
  const [addPreview, setAddPreview] = useState("");

  //  separate image state for EDIT
  const [editProfileImage, setEditProfileImage] = useState(null);
  const [editPreview, setEditPreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [updating, setUpdating] = useState(false);

  // search + sort
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("new");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // lock scroll when popup open
  useEffect(() => {
    if (open || editOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open, editOpen]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/user/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setAge("");
    setCountry("");
    setStateName("");
    setAddress("");
    setCity("");

    // reset add image
    setAddProfileImage(null);
    setAddPreview("");

    // reset edit image
    setEditProfileImage(null);
    setEditPreview("");
  };

  // cleanup blob urls
  useEffect(() => {
    return () => {
      if (addPreview && addPreview.startsWith("blob:"))
        URL.revokeObjectURL(addPreview);
      if (editPreview && editPreview.startsWith("blob:"))
        URL.revokeObjectURL(editPreview);
    };
  }, [addPreview, editPreview]);

  // CREATE customer (FIXED ROUTE + TOKEN)
  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("age", age);
      formData.append("country", country);
      formData.append("state", stateName);
      formData.append("address", address);
      formData.append("city", city);

      if (addProfileImage) formData.append("profileImage", addProfileImage);

      // use admin route you already created
      const res = await API.post("/user/customers", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data?.message || "Customer created ✅");

      // ✅ NEW: Tell AdminChat to refresh customers list
      localStorage.setItem("admin_customers_refresh", String(Date.now()));

      setOpen(false);
      resetForm();
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  // open edit
  const openEdit = (c) => {
    setEditId(c._id);

    setName(c.name || "");
    setEmail(c.email || "");
    setPhone(c.phone || "");
    setAge(c.age ? String(c.age) : "");
    setCountry(c.country || "");
    setStateName(c.state || "");
    setAddress(c.address || "");
    setCity(c.city || "");

    // optional password
    setPassword("");

    // existing image preview
    const img =
      c.profileImageUrl || c.profileImage || c.avatar || c.image || "";
    setEditPreview(img || "");
    setEditProfileImage(null);

    setEditOpen(true);
  };

  // update customer
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("age", age);
      formData.append("country", country);
      formData.append("state", stateName);
      formData.append("address", address);
      formData.append("city", city);

      if (password && password.trim().length > 0) {
        formData.append("password", password);
      }

      if (editProfileImage) formData.append("profileImage", editProfileImage);

      const res = await API.patch(`/user/customers/${editId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data?.message || "Customer updated ✅");

      // ✅ NEW: Tell AdminChat to refresh customers list
      localStorage.setItem("admin_customers_refresh", String(Date.now()));

      setEditOpen(false);
      setEditId("");
      resetForm();
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update customer");
    } finally {
      setUpdating(false);
    }
  };

  // delete customer
  const handleDeleteCustomer = async (id) => {
    const ok = window.confirm("Delete this customer? This cannot be undone.");
    if (!ok) return;

    try {
      setDeletingId(id);

      await API.delete(`/user/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Customer deleted ✅");

      // ✅ NEW: Tell AdminChat to refresh customers list
      localStorage.setItem("admin_customers_refresh", String(Date.now()));

      setCustomers((prev) => prev.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete customer");
    } finally {
      setDeletingId("");
    }
  };

  // filter + sort
  const filteredCustomers = useMemo(() => {
    const text = q.trim().toLowerCase();
    let list = [...customers];

    if (text) {
      list = list.filter((c) => {
        const hay =
          `${c.name || ""} ${c.email || ""} ${c.phone || ""} ${c.city || ""} ${
            c.country || ""
          } ${c.state || ""} ${c.address || ""}`.toLowerCase();
        return hay.includes(text);
      });
    }

    if (sortBy === "name") {
      list.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    } else if (sortBy === "old") {
      list.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
    } else {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return list;
  }, [customers, q, sortBy]);

  if (loading) return <div className="text-white">Loading customers...</div>;

  return (
    <div className="text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-white/60 mt-1">
            View and add customers from admin panel
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-[320px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone, city..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 outline-none placeholder:text-white/40"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
          >
            <option className="bg-[#0b1d4d]" value="new">
              Newest
            </option>
            <option className="bg-[#0b1d4d]" value="old">
              Oldest
            </option>
            <option className="bg-[#0b1d4d]" value="name">
              Name A-Z
            </option>
          </select>

          <button
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
          >
            + Add Customer
          </button>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <p className="text-white/70">No customers found.</p>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((c) => (
            <div
              key={c._id}
              className="p-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      c.profileImageUrl ||
                      c.profileImage ||
                      c.avatar ||
                      c.image ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full border border-white/20 object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                    }}
                  />

                  <div>
                    <p className="text-lg font-semibold leading-tight">
                      {c.name || "Customer"}
                    </p>
                    <p className="text-white/70 text-sm">{c.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="px-3 py-2 rounded-xl bg-sky-500/20 border border-sky-400/30 hover:bg-sky-500/30 transition text-sm font-semibold"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteCustomer(c._id)}
                    disabled={deletingId === c._id}
                    className="px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-400/30 hover:bg-rose-500/30 transition text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deletingId === c._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                <p className="text-white/85">
                  <b>Phone:</b> {c.phone || "-"}
                </p>
                <p className="text-white/85">
                  <b>City:</b> {c.city || "-"}
                </p>
                <p className="text-white/85">
                  <b>Country:</b> {c.country || "-"}
                </p>
                <p className="text-white/85">
                  <b>State:</b> {c.state || "-"}
                </p>
                <p className="text-white/85">
                  <b>Age:</b> {c.age || "-"}
                </p>
                <p className="text-white/85">
                  <b>Joined:</b>{" "}
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                </p>
                <p className="text-white/85 sm:col-span-2 lg:col-span-3">
                  <b>Address:</b> {c.address || "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD POPUP */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          />

          <div className="relative z-10 w-[95%] max-w-4xl rounded-3xl overflow-hidden bg-[#0b1d4d] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold">Add Customer</h3>
                <p className="text-white/70 text-sm">
                  Create a new customer (same fields like Signup)
                </p>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[85vh] overflow-y-auto p-6">
              <form onSubmit={handleCreateCustomer}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex justify-center mb-3 relative">
                      <img
                        src={
                          addPreview ||
                          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        }
                        alt="Profile"
                        onClick={() =>
                          document
                            .getElementById("adminCustomerUpload")
                            .click()
                        }
                        className="w-24 h-24 rounded-full border-4 border-blue-400 object-cover shadow-lg cursor-pointer"
                      />
                    </div>

                    <input
                      id="adminCustomerUpload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setAddProfileImage(file || null);
                        if (file) setAddPreview(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-white/80">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="example@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="Enter phone"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">Age</label>
                    <input
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">Country</label>
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="Country"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">State</label>
                    <input
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">City</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="City"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-white/80">Address</label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="Address"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={saving}
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold disabled:opacity-60"
                  >
                    {saving ? "Creating..." : "Create Customer"}
                  </button>
                </div>

                <p className="text-white/60 text-xs mt-3">
                  After creating, list refresh works only if you are logged in
                  as an <b>admin</b>.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT POPUP */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => {
              setEditOpen(false);
              setEditId("");
              resetForm();
            }}
          />

          <div className="relative z-10 w-[95%] max-w-4xl rounded-3xl overflow-hidden bg-[#0b1d4d] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold">Edit Customer</h3>
                <p className="text-white/70 text-sm">
                  Update customer details (password optional)
                </p>
              </div>

              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditId("");
                  resetForm();
                }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[85vh] overflow-y-auto p-6">
              <form onSubmit={handleUpdateCustomer}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex justify-center mb-3 relative">
                      <img
                        src={
                          editPreview ||
                          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        }
                        alt="Profile"
                        onClick={() =>
                          document
                            .getElementById("adminCustomerEditUpload")
                            .click()
                        }
                        className="w-24 h-24 rounded-full border-4 border-blue-400 object-cover shadow-lg cursor-pointer"
                      />
                    </div>

                    <input
                      id="adminCustomerEditUpload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setEditProfileImage(file || null);
                        if (file) setEditPreview(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-white/80">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="example@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="Enter phone"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">
                      New Password{" "}
                      <span className="text-white/50">(optional)</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="Leave blank to keep old password"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">Age</label>
                    <input
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">Country</label>
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="Country"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">State</label>
                    <input
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">City</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="City"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-white/80">Address</label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 outline-none"
                      placeholder="Address"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditOpen(false);
                      setEditId("");
                      resetForm();
                    }}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={updating}
                    type="submit"
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 transition font-semibold disabled:opacity-60"
                  >
                    {updating ? "Updating..." : "Update Customer"}
                  </button>
                </div>

                <p className="text-white/60 text-xs mt-3">
                  Update works only if you are logged in as an <b>admin</b>.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
