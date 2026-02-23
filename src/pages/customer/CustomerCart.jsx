import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const BACKEND = "http://localhost:3000";
const FALLBACK_IMG = "https://via.placeholder.com/600x360?text=No+Image";

const CustomerCart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const resolveImg = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${BACKEND}${img}`;
    return img;
  };

  const updateQty = (productId, qty) => {
    const q = Math.min(20, Math.max(1, Number(qty || 1)));
    const next = cart.map((i) =>
      i.productId === productId ? { ...i, quantity: q } : i
    );
    setCart(next);
    saveCart(next);
  };

  const removeItem = (productId) => {
    const next = cart.filter((i) => i.productId !== productId);
    setCart(next);
    saveCart(next);
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };

  const total = cart.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
    0
  );

  return (
    <div className="bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        <section className="text-center py-8 sm:py-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3">
            Cart
          </h2>
        </section>

        <section className="max-w-6xl mx-auto pb-12">
          {cart.length === 0 ? (
            <div className="p-5 sm:p-6 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-center">
              <p className="mb-4 text-sm sm:text-base">Your cart is empty.</p>
              <button
                onClick={() => navigate("/products")}
                className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition w-full sm:w-auto"
              >
                Go to Products
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-6 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  Items ({cart.reduce((s, i) => s + Number(i.quantity || 0), 0)})
                </h3>

                <button
                  onClick={clearCart}
                  className="bg-white/20 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition w-full sm:w-auto"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white/10 border border-white/20"
                  >
                    <div className="w-full sm:w-40">
                      <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/10">
                        <img
                          src={resolveImg(item.image) || FALLBACK_IMG}
                          alt={item.name}
                          className="w-full h-32 sm:h-28 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMG;
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-base sm:text-lg mb-1 truncate">
                        {item.name}
                      </h4>

                      <p className="text-white/70 text-xs sm:text-sm line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-white/80 text-sm">Qty</span>

                          <select
                            value={item.quantity}
                            onChange={(e) =>
                              updateQty(item.productId, e.target.value)
                            }
                            className="px-3 py-2 rounded-xl bg-white/20 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(
                              (n) => (
                                <option key={n} value={n} className="text-black">
                                  {n}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <p className="text-white font-semibold text-sm sm:text-base">
                            ₹{Number(item.price || 0).toLocaleString("en-IN")}{" "}
                            <span className="text-white/60 text-xs sm:text-sm">
                              x {item.quantity}
                            </span>
                          </p>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="bg-white/20 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-white/10 border border-white/20 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-white/80 text-sm sm:text-base">Total</p>
                  <p className="text-white font-bold text-base sm:text-lg lg:text-xl">
                    ₹{Number(total || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/customer/buy")}
                  className="w-full mt-4 bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerCart;
