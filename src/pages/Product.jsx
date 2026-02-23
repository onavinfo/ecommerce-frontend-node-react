import React, { useEffect, useMemo, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const BACKEND = "http://localhost:3000";
const FALLBACK_IMG = "https://via.placeholder.com/600x360?text=No+Image";

// CART helpers
const CART_KEY = "myapp_cart_v1";
const getCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

const Products = () => {
  const navigate = useNavigate();

  // token should support sessionStorage also
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");
  const isAdmin = role === "admin";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // search
  const [q, setQ] = useState("");

  // category
  const [cat, setCat] = useState("all");
  const [showCat, setShowCat] = useState(false);

  // popup state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // add form
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  });
  const [postMsg, setPostMsg] = useState("");
  const [posting, setPosting] = useState(false);

  // edit form
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  });
  const [editMsg, setEditMsg] = useState("");
  const [updating, setUpdating] = useState(false);

  // qty map
  const [qtyMap, setQtyMap] = useState({});

  // per-product feedback
  const [addedMap, setAddedMap] = useState({});
  const [toast, setToast] = useState({ show: false, text: "" });

  // pagination
  const PER_PAGE = 9;
  const [page, setPage] = useState(1);

  const resolveImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${BACKEND}${img}`;
    return img;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await API.get("/products");
      const data = Array.isArray(res.data) ? res.data : res.data.products;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      setErrMsg("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // lock scroll while modal open
  useEffect(() => {
    const open = showAddModal || showEditModal;
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [showAddModal, showEditModal]);

  // auto hide toast
  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast({ show: false, text: "" }), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  // categories list
  const categories = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => {
      if (p.category) set.add(String(p.category));
    });
    return ["all", ...Array.from(set)];
  }, [products]);

  // filtered
  const filteredProducts = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (products || []).filter((p) => {
      const n = (p.name || "").toLowerCase();
      const d = (p.description || "").toLowerCase();
      const c = (p.category || "").toLowerCase();

      const matchQuery =
        !query || n.includes(query) || d.includes(query) || c.includes(query);
      const matchCat = cat === "all" || String(p.category || "") === cat;

      return matchQuery && matchCat;
    });
  }, [products, q, cat]);

  // reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [q, cat]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  }, [filteredProducts.length]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredProducts.slice(start, start + PER_PAGE);
  }, [filteredProducts, page]);

  // redirect to Login.jsx with "from"
  const goLogin = (nextPath) => {
    navigate("/login", { state: { from: nextPath } });
  };

  // form change
  const handleChange = (e) => {
    setPostMsg("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!token) {
      setPostMsg("Login token missing. Please login again.");
      return;
    }

    setPosting(true);
    setPostMsg("");

    try {
      const payload = { ...form, price: Number(form.price) };

      const res = await API.post("/products/create-product", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPostMsg(res?.data?.message || "Product added successfully ✅");
      setForm({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
      });
      fetchProducts();
      setShowAddModal(false);
    } catch (err) {
      console.log(err?.response?.data || err.message);
      setPostMsg(err?.response?.data?.message || "Failed to add product ❌");
    } finally {
      setPosting(false);
    }
  };

  const openEditModal = (p) => {
    if (!isAdmin) return;
    setEditMsg("");
    setEditingProduct(p);
    setEditForm({
      name: p?.name || "",
      description: p?.description || "",
      price: p?.price ?? "",
      image: p?.image || "",
      category: p?.category || "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditMsg("");
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!token) {
      setEditMsg("Login token missing. Please login again.");
      return;
    }
    if (!editingProduct?._id) return;

    setUpdating(true);
    setEditMsg("");

    try {
      const payload = { ...editForm, price: Number(editForm.price) };

      const res = await API.put(`/products/${editingProduct._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditMsg(res?.data?.message || "Product updated ✅");
      fetchProducts();
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (err) {
      console.log(err?.response?.data || err.message);
      setEditMsg(err?.response?.data?.message || "Failed to update product ❌");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!isAdmin) return;

    if (!token) {
      alert("Login token missing. Please login again.");
      return;
    }
    if (!id) return;

    const ok = window.confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
      await API.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      console.log(err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Failed to delete product ❌");
    }
  };

  // add to cart (requires login)
  const addToCart = (product, qty, mode = "added") => {
    if (!token) {
      const next = mode === "buy" ? "/customer/buy" : "/customer/cart";
      return goLogin(next);
    }

    const id = product?._id || product?.id;
    if (!id) return;

    const quantity = Math.min(20, Math.max(1, Number(qty || 1)));
    const cart = getCart();
    const found = cart.find((i) => i.productId === id);

    if (found) {
      found.quantity = Math.min(20, Number(found.quantity || 1) + quantity);
      saveCart([...cart]);
    } else {
      cart.push({
        productId: id,
        name: product?.name || "",
        price: Number(product?.price || 0),
        image: product?.image || "",
        description: product?.description || "",
        quantity,
      });
      saveCart(cart);
    }

    setAddedMap((prev) => ({ ...prev, [id]: mode }));
    setToast({
      show: true,
      text: mode === "buy" ? "Added ✅ (opening buy)" : "Added to cart ✅",
    });

    setTimeout(() => setAddedMap((prev) => ({ ...prev, [id]: null })), 1400);

    if (mode === "buy") {
      setTimeout(() => navigate("/customer/buy"), 250);
    }
  };

  // small helper for “nice title”
  const prettyCat = (v) => (v === "all" ? "All Categories" : v);

  return (
    <div className="bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] min-h-screen">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[60]">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white text-sm sm:text-base">
            {toast.text}
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-10">
        {/*  Hero */}
        <section className="mx-auto mb-8 sm:mb-10">
          <div
            className="relative overflow-hidden rounded-3xl shadow-2xl"
            style={{
              backgroundImage: "url('/product.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Content card */}
            <div className="relative p-4 sm:p-8 lg:p-14 bg-gradient-to-r from-[#050b2c]/75 via-[#0b1d4d]/35 to-[#1b3fa7]/20">
              <div className="max-w-4xl rounded-3xl bg-white/10 p-4 sm:p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs mb-4">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Trending products • Easy checkout
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                  Discover Products
                </h3>

                <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed mb-6">
                  Search, filter by category, add to cart and buy in seconds.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                    <p className="text-white/90 text-sm sm:text-base">
                      <span className="text-indigo-300 font-semibold">
                        Fast Search:
                      </span>{" "}
                      Find items instantly.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                    <p className="text-white/90 text-sm sm:text-base">
                      <span className="text-indigo-300 font-semibold">
                        Smart Filter:
                      </span>{" "}
                      Pick your category.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tag */}
            <div className="absolute bottom-4 right-4 sm:right-6 rounded-2xl bg-black/30 border border-white/20 backdrop-blur-md px-4 py-2">
              <p className="text-white text-xs sm:text-sm">
                {prettyCat(cat)} • {filteredProducts.length} items
              </p>
            </div>
          </div>
        </section>

        <hr className="border-white/20 mb-10" />

        {/* Toolbar Search + Category  */}
        <section className="mx-auto ">
          <h3 className="text-4xl font-bold text-white text-center mb-10">
            <span className="relative inline-block">
              Products
              <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-24 sm:w-36 md:w-44 h-0.5 bg-indigo-400 rounded-full"></span>
            </span>
          </h3>
          <div className="sticky top-3 z-30 mb-10">
            <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <div className="p-3 sm:p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  {/* ✅ Search (height increased) */}
                  <div className="flex-1">
                    <div className="group flex items-center gap-3 h-14 rounded-2xl bg-black/20 border border-white/10 px-5 transition focus-within:border-indigo-400/50 focus-within:bg-black/25">
                      <svg
                        className="w-5 h-5 text-white/70 group-focus-within:text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-4.3-4.3"
                        />
                        <circle cx="11" cy="11" r="7" />
                      </svg>

                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-transparent outline-none text-white placeholder-white/40 text-sm sm:text-base"
                      />

                      {q?.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setQ("")}
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ✅ Right controls (same height as search) */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center lg:justify-end">
                    {/* ✅ Category Dropdown (same height) */}
                    <div className="relative">
                      <div className="flex items-center gap-2 h-14 rounded-2xl bg-black/20 border border-white/10 px-4">
                        <svg
                          className="w-5 h-5 text-white/70"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M6 12h12M8 18h8"
                          />
                        </svg>

                        <select
                          value={cat}
                          onChange={(e) => setCat(e.target.value)}
                          className="h-full bg-transparent text-white outline-none text-sm sm:text-base pr-10"
                        >
                          {categories.map((c) => (
                            <option
                              key={c}
                              value={c}
                              className="bg-[#0b1d4d] text-white"
                            >
                              {c === "all" ? "All Categories" : c}
                            </option>
                          ))}
                        </select>

                        {/* optional chevron */}
                        {/* <svg
                          className="w-5 h-5 text-white/60 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 9l6 6 6-6"
                          />
                        </svg> */}
                      </div>
                    </div>

                    {/* ✅ Results (same height) */}
                    <div className="h-14 rounded-2xl bg-black/20 border border-white/10 px-4 flex items-center justify-between min-w-[170px]">
                      <div className="leading-tight">
                        <p className="text-white/60 text-[11px] sm:text-xs">
                          Results
                        </p>
                        <p className="text-white font-bold text-lg">
                          {filteredProducts.length}
                        </p>
                      </div>

                      <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white/80">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 7h16M4 12h16M4 17h16"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Admin Add (optional same height) */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setPostMsg("");
                          setShowAddModal(true);
                        }}
                        className="h-14 rounded-2xl px-5 font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition shadow-[0_12px_35px_rgba(79,70,229,0.35)] active:scale-[0.99]"
                      >
                        + Add Product
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto">
          {loading && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-center">
              Loading products...
            </div>
          )}

          {!loading && errMsg && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-center">
              <p className="mb-4">{errMsg}</p>
              <button
                onClick={fetchProducts}
                className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !errMsg && filteredProducts.length === 0 && (
            <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-center">
              No products found.
            </div>
          )}

          {!loading && !errMsg && paginatedProducts.length > 0 && (
            <>
              {/* ✅ Enhanced cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {paginatedProducts.map((p) => {
                  const pid = p._id || p.id || p.name;
                  const qty = Number(qtyMap[pid] || 1);

                  const realId = p._id || p.id;
                  const addedState = addedMap[realId];

                  return (
                    <div
                      key={pid}
                      className="group p-4 sm:p-6 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/12 transition"
                    >
                      {/* Image */}
                      <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/10">
                        <img
                          src={resolveImg(p.image) || FALLBACK_IMG}
                          alt={p.name}
                          className="w-full h-40 sm:h-44 object-cover group-hover:scale-[1.03] transition duration-300"
                          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                        />
                        {p.category && (
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-white text-xs backdrop-blur-md">
                            {p.category}
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-indigo-200 break-words line-clamp-1">
                          {p.name}
                        </h3>

                        <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-sm">
                          ₹{Number(p.price || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <p className="text-white/85 text-xs sm:text-sm mt-2 mb-4 line-clamp-3">
                        {p.description || "No description"}
                      </p>

                      {/* qty */}
                      {!isAdmin && (
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="text-white/70 text-sm">Quantity</p>
                          <select
                            value={qty}
                            onChange={(e) =>
                              setQtyMap((prev) => ({
                                ...prev,
                                [pid]: Number(e.target.value),
                              }))
                            }
                            className="px-3 py-2 rounded-xl bg-white/15 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          >
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(
                              (n) => (
                                <option
                                  key={n}
                                  value={n}
                                  className="text-black"
                                >
                                  {n}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      )}

                      {/* Customer buttons */}
                      {!isAdmin && (
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <button
                            onClick={() => addToCart(p, qty, "added")}
                            className={`bg-white/15 border border-white/20 text-white px-4 py-2.5 rounded-2xl font-semibold transition
                              hover:bg-white/25 active:scale-[0.99]
                              ${addedState === "added" ? "animate-[pulse_0.6s_ease-in-out_1]" : ""}
                            `}
                          >
                            {addedState === "added"
                              ? "Added ✅"
                              : "Add to Cart"}
                          </button>

                          <button
                            onClick={() => addToCart(p, qty, "buy")}
                            className={`bg-gradient-to-r from-indigo-500 to-sky-500 text-white px-4 py-2.5 rounded-2xl font-semibold transition
                              hover:opacity-70 active:scale-[0.99] shadow-[0_10px_30px_rgba(59,130,246,0.2)]
                              ${addedState === "buy" ? "animate-[pulse_0.6s_ease-in-out_1]" : ""}
                            `}
                          >
                            {addedState === "buy" ? "Opening… ✅" : "Buy"}
                          </button>
                        </div>
                      )}

                      {/* Admin buttons */}
                      {isAdmin && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <button
                            onClick={() => openEditModal(p)}
                            className="bg-white/20 text-white px-4 py-2 rounded-2xl font-semibold hover:bg-white/30 active:scale-[0.99] transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="bg-rose-500/70 text-white px-4 py-2 rounded-2xl font-semibold hover:bg-rose-500 active:scale-[0.99] transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ✅ Enhanced Pagination */}
              {filteredProducts.length > PER_PAGE && (
                <div className="mt-10">
                  <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-white/80 text-sm">
                      Page <span className="text-white font-bold">{page}</span>{" "}
                      /{" "}
                      <span className="text-white font-bold">{totalPages}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition disabled:opacity-50"
                      >
                        Prev
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPage(n)}
                            className={`px-3 py-2 rounded-2xl border transition text-sm ${
                              n === page
                                ? "bg-indigo-500 border-indigo-400 text-white shadow-[0_10px_30px_rgba(79,70,229,0.25)]"
                                : "bg-white/10 border-white/20 text-white/90 hover:bg-white/20"
                            }`}
                          >
                            {n}
                          </button>
                        ),
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Admin Modals */}
        {isAdmin && showAddModal && (
          <Modal title="Add Product" onClose={() => setShowAddModal(false)}>
            {postMsg && <MsgBox text={postMsg} />}
            <ProductForm
              mode="add"
              form={form}
              onChange={handleChange}
              onSubmit={handleAddProduct}
              loading={posting}
            />
          </Modal>
        )}

        {isAdmin && showEditModal && (
          <Modal
            title="Edit Product"
            onClose={() => {
              setShowEditModal(false);
              setEditingProduct(null);
            }}
          >
            {editMsg && <MsgBox text={editMsg} />}
            <ProductForm
              mode="edit"
              form={editForm}
              onChange={handleEditChange}
              onSubmit={handleUpdateProduct}
              loading={updating}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Products;

/* -------------------- Reusable Modal -------------------- */
function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center p-3">
        <div className="relative w-full sm:max-w-2xl rounded-3xl rounded-b-none sm:rounded-b-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <div className="p-5 overflow-y-auto scrollbar-hide">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MsgBox({ text }) {
  return (
    <div className="mb-4 p-3 rounded-xl bg-white/10 border border-white/20 text-white">
      {text}
    </div>
  );
}

function ProductForm({ mode, form, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        name="name"
        value={form.name}
        onChange={onChange}
        placeholder="Product Name"
        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />

      <input
        name="price"
        value={form.price}
        onChange={onChange}
        placeholder="Price"
        type="number"
        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />

      <input
        name="category"
        value={form.category}
        onChange={onChange}
        placeholder="Category (optional)"
        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <input
        name="image"
        value={form.image}
        onChange={onChange}
        placeholder="Image URL (optional)"
        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <textarea
        name="description"
        value={form.description}
        onChange={onChange}
        rows="3"
        placeholder="Description (optional)"
        className="md:col-span-2 w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="md:col-span-2 bg-gradient-to-r from-indigo-500 to-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
      >
        {loading
          ? mode === "add"
            ? "Adding..."
            : "Updating..."
          : mode === "add"
            ? "Add Product"
            : "Update Product"}
      </button>
    </form>
  );
}
