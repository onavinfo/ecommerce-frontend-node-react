import React, { useEffect, useState } from "react";
import API from "../../api";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await API.get("/orders/my", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] px-4 sm:px-6 lg:px-10 py-10 text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-center">
          My Orders
        </h2>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            <p className="mt-4 text-white/80">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-white/80 py-16">
            You have no orders yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {orders.map((o) => (
              <div
                key={o._id}
                className="rounded-2xl bg-white/10 border border-white/20 p-4 sm:p-5 backdrop-blur-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-white/70">Order ID</p>
                    <p className="text-sm sm:text-base font-semibold break-all">
                      {o._id}
                    </p>
                  </div>

                  <div className="flex sm:justify-end">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-semibold border ${
                        o.status?.toLowerCase() === "delivered"
                          ? "bg-green-500/20 border-green-400/40 text-green-100"
                          : o.status?.toLowerCase() === "pending"
                          ? "bg-yellow-500/20 border-yellow-400/40 text-yellow-100"
                          : "bg-blue-500/20 border-blue-400/40 text-blue-100"
                      }`}
                    >
                      {o.status || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-black/20 border border-white/10 px-4 py-3">
                  <p className="text-sm sm:text-base text-white/80">Total</p>
                  <p className="text-base sm:text-lg font-bold">
                    ₹{o.totalAmount}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-sm sm:text-base font-semibold mb-2">
                    Items
                  </p>

                  <div className="space-y-2">
                    {o.items?.map((i, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-white/5 border border-white/10 p-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <p className="font-semibold break-words">{i.name}</p>

                          <p className="text-white/80 text-sm sm:text-base">
                            Qty: <span className="font-semibold">{i.qty}</span>
                          </p>

                          <p className="text-white/80 text-sm sm:text-base sm:text-right">
                            ₹{i.price} <span className="text-white/60">× {i.qty}</span>{" "}
                            ={" "}
                            <span className="font-semibold text-white">
                              ₹{Number(i.price) * Number(i.qty)}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-white/70">
                  <p>
                    Items:{" "}
                    <span className="text-white font-semibold">
                      {o.items?.length || 0}
                    </span>
                  </p>

                  {o.createdAt && (
                    <p>
                      Date:{" "}
                      <span className="text-white font-semibold">
                        {new Date(o.createdAt).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
