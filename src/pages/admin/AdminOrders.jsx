import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);

  // UI state
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | confirmed | cancelled | delivered

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders"); // ✅ GET /api/orders (admin)
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // PATCH /api/orders/:id/status
  const changeStatus = async (orderId, status) => {
    try {
      setWorkingId(orderId);

      const res = await API.patch(`/orders/${orderId}/status`, { status });

      // update UI instantly
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.order : o))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setWorkingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const query = q.trim().toLowerCase();

    return orders.filter((o) => {
      const st = (o.status || "").toLowerCase();
      const matchesStatus = statusFilter === "all" ? true : st === statusFilter;

      const matchesQuery =
        !query ||
        (o._id || "").toLowerCase().includes(query) ||
        (o.user?.name || "").toLowerCase().includes(query) ||
        (o.user?.email || "").toLowerCase().includes(query) ||
        (o.items || []).some((i) => (i.name || "").toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  }, [orders, q, statusFilter]);

  const counts = useMemo(() => {
    const c = { all: orders.length, pending: 0, confirmed: 0, cancelled: 0, delivered: 0 };
    for (const o of orders) {
      const st = (o.status || "").toLowerCase();
      if (c[st] !== undefined) c[st] += 1;
    }
    return c;
  }, [orders]);

  const badgeClass = (status) => {
    const st = (status || "").toLowerCase();
    if (st === "pending") return "bg-yellow-500/20 border-yellow-400/30 text-yellow-100";
    if (st === "confirmed") return "bg-emerald-500/20 border-emerald-400/30 text-emerald-100";
    if (st === "cancelled") return "bg-rose-500/20 border-rose-400/30 text-rose-100";
    if (st === "delivered") return "bg-blue-500/20 border-blue-400/30 text-blue-100";
    return "bg-white/10 border-white/20 text-white/80";
  };

  if (loading) return <div className="text-white p-6">Loading orders...</div>;

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Orders</h2>
          <p className="text-white/60 text-sm sm:text-base">Manage all customer orders</p>
        </div>

        <button
          onClick={fetchOrders}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
        >
          Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="text-sm text-white/70">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order id, user, email, item name..."
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status filter */}
        <div>
          <label className="text-sm text-white/70">Filter by status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="text-black" value="all">All ({counts.all})</option>
            <option className="text-black" value="pending">Pending ({counts.pending})</option>
            <option className="text-black" value="confirmed">Confirmed ({counts.confirmed})</option>
            <option className="text-black" value="cancelled">Cancelled ({counts.cancelled})</option>
            <option className="text-black" value="delivered">Delivered ({counts.delivered})</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-white/10 border border-white/20 p-6 text-white/70">
          No orders found.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredOrders.map((o) => {
            const status = (o.status || "").toLowerCase();
            const busy = workingId === o._id;

            return (
              <div
                key={o._id}
                className="rounded-2xl bg-white/10 border border-white/20 p-4 sm:p-5 hover:bg-white/15 transition"
              >
                {/* Top */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white/90">
                      <b>Order:</b> #{o._id?.slice(-6)}
                      <span className="text-white/50 text-xs sm:text-sm ml-2 break-all">
                        ({o._id})
                      </span>
                    </p>

                    {/* CUSTOMER NAME HIGHLIGHT */}
                    <p className="mt-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-400/25">
                        <span className="text-xs text-white/60">Customer</span>
                        <span className="text-base font-bold text-white">
                          {o.user?.name || "Customer"}
                        </span>
                      </span>
                      <span className="text-white/60 ml-2 text-sm">
                        ({o.user?.email || "N/A"})
                      </span>
                    </p>

                    <p className="text-white/80 mt-2">
                      <b>Total:</b>{" "}
                      <span className="font-semibold">₹{Number(o.totalAmount || 0)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span
                      className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${badgeClass(o.status)}`}
                    >
                      {o.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/*  ACTIONS: only as you asked */}
                <div className="mt-4">
                  {status === "pending" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        disabled={busy}
                        onClick={() => changeStatus(o._id, "confirmed")}
                        className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-60"
                      >
                        {busy ? "Working..." : "Accept"}
                      </button>

                      <button
                        disabled={busy}
                        onClick={() => changeStatus(o._id, "cancelled")}
                        className="w-full px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 transition disabled:opacity-60"
                      >
                        {busy ? "Working..." : "Decline"}
                      </button>
                    </div>
                  ) : status === "confirmed" ? (
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        disabled={busy}
                        onClick={() => changeStatus(o._id, "cancelled")}
                        className="w-full px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 transition disabled:opacity-60"
                      >
                        {busy ? "Working..." : "Cancel Order"}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-white/70 text-sm">
                      No action (status is <b className="text-white">{o.status}</b>)
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-white/90 mb-2">
                    Items ({o.items?.length || 0})
                  </p>

                  <div className="space-y-2">
                    {o.items?.map((i, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-white/5 border border-white/10 p-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <span className="text-white/90 font-semibold break-words">
                            {i.name}
                          </span>

                          <span className="text-white/70">
                            Qty: <b className="text-white">{i.qty}</b> × ₹{i.price}
                          </span>

                          <span className="text-white/70 sm:text-right">
                            Total:{" "}
                            <b className="text-white">
                              ₹{Number(i.qty || 0) * Number(i.price || 0)}
                            </b>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                {o.createdAt && (
                  <div className="mt-4 text-xs sm:text-sm text-white/60">
                    Created:{" "}
                    <span className="text-white/80">
                      {new Date(o.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
