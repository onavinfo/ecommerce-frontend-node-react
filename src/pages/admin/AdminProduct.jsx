import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";

const BACKEND = "http://localhost:3000"; // change if your backend is different

// Offline fallback image (no internet needed)
const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250'%3E%3Crect width='100%25' height='100%25' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' fill='%23fff' font-size='22' font-family='Arial' dominant-baseline='middle' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ADD popup
  const [openAdd, setOpenAdd] = useState(false);

  // EDIT popup
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  // form fields (shared)
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");

  // image upload
  const [imageFile, setImageFile] = useState(null);

  // image url
  const [imageUrl, setImageUrl] = useState("");

  const [saving, setSaving] = useState(false);

  const token = useMemo(
    () => localStorage.getItem("token") || sessionStorage.getItem("token"),
    []
  );

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const resolveImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    // backend stores "/uploads/...."
    return `${BACKEND}${img}`;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products");
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setDesc("");
    setImageFile(null);
    setImageUrl("");
    setSelected(null);
  };

  const openEditModal = (p) => {
    setSelected(p);
    setName(p.name || "");
    setPrice(p.price ?? "");
    setDesc(p.description || p.desc || "");
    setImageUrl(p.image || "");
    setImageFile(null);
    setOpenEdit(true);
  };

  //  ADD product
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", desc);

      if (imageUrl) formData.append("imageUrl", imageUrl);
      if (imageFile) formData.append("image", imageFile);

      const res = await API.post("/products", formData, {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data?.message || "Product added ✅");
      setOpenAdd(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  // UPDATE product
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected?._id) return alert("No product selected");

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", desc);

      if (imageUrl) formData.append("imageUrl", imageUrl);
      if (imageFile) formData.append("image", imageFile);

      const res = await API.put(`/products/${selected._id}`, formData, {
        headers: {
          ...authHeaders,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data?.message || "Product updated ✅");
      setOpenEdit(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  //  DELETE product
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await API.delete(`/products/${id}`, { headers: authHeaders });
      alert("Deleted ✅");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  if (loading) return <div className="text-white">Loading products...</div>;

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-white/60 mt-1">Add / Edit products (admin panel)</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setOpenAdd(true);
          }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-white/70">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((p) => {
            const imgSrc = resolveImg(p.image);

            return (
              <div
                key={p._id}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
              >
                {/* IMAGE */}
                <div className="h-44 bg-white/5">
                  <img
                    src={imgSrc || FALLBACK_IMG}
                    alt={p.name}
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // ✅ stop loop
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-white/70 text-sm mt-1 line-clamp-2">
                    {p.description || p.desc || "No description"}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-semibold">₹ {p.price}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-3 py-1 rounded-lg bg-red-500/70 hover:bg-red-500 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD POPUP */}
      {openAdd && (
        <Modal
          title="Add Product"
          sub="Create new product"
          onClose={() => {
            setOpenAdd(false);
            resetForm();
          }}
        >
          <ProductForm
            name={name}
            setName={setName}
            price={price}
            setPrice={setPrice}
            desc={desc}
            setDesc={setDesc}
            imageFile={imageFile}
            setImageFile={setImageFile}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            saving={saving}
            onSubmit={handleAdd}
            submitText={saving ? "Adding..." : "Add Product"}
          />
        </Modal>
      )}

      {/*  EDIT POPUP */}
      {openEdit && (
        <Modal
          title="Edit Product"
          sub="Update product details"
          onClose={() => {
            setOpenEdit(false);
            resetForm();
          }}
        >
          <ProductForm
            name={name}
            setName={setName}
            price={price}
            setPrice={setPrice}
            desc={desc}
            setDesc={setDesc}
            imageFile={imageFile}
            setImageFile={setImageFile}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            saving={saving}
            onSubmit={handleUpdate}
            submitText={saving ? "Updating..." : "Update Product"}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------- Reusable Modal ---------- */
function Modal({ title, sub, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-[95%] max-w-4xl rounded-3xl overflow-hidden bg-[#0b1d4d] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-white/70 text-sm">{sub}</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Form (upload OR url) ---------- */
function ProductForm({
  name,
  setName,
  price,
  setPrice,
  desc,
  setDesc,
  imageFile,
  setImageFile,
  imageUrl,
  setImageUrl,
  saving,
  onSubmit,
  submitText,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none border border-white/10"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none border border-white/10"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <textarea
        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none border border-white/10"
        placeholder="Description"
        rows={4}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <input
        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none border border-white/10"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      <p className="text-white/60 text-xs">
        You can paste Image URL OR upload image file.
      </p>

      <input
        type="file"
        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none border border-white/10"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />

      <button
        disabled={saving}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold text-white disabled:opacity-60"
      >
        {submitText}
      </button>
    </form>
  );
}
