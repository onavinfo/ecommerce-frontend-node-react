import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

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

const CustomerBuy = () => {
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  // ✅ keep cart in state (UI updates correctly)
  const [cart, setCart] = useState(() => getCart());

  const total = useMemo(() => {
    return cart.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );
  }, [cart]);

  const placeOrder = async () => {
    try {
      setPlacing(true);

      const items = cart.map((i) => ({
        product: i.productId,
        name: i.name,
        price: i.price,
        qty: i.quantity,
        image: i.image,
      }));

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      await API.post(
        "/orders",
        { items, totalAmount: total }, // ✅ totalAmount optional, safe
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      // ✅ clear cart
      saveCart([]);
      setCart([]);

      alert("Order placed successfully ✅");
      navigate("/products", { replace: true });
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to place order ❌");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#050b2c] via-[#0b1d4d] to-[#1b3fa7] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
        <section className="text-center py-8 sm:py-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3">
            Buy
          </h2>
          <p className="text-white/90 text-sm sm:text-base lg:text-lg">
            Confirm your items and place order.
          </p>
        </section>

        <section className="max-w-3xl xl:max-w-4xl mx-auto pb-12">
          <div className="p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white">
            {cart.length === 0 ? (
              <div className="text-center">
                <p className="mb-4 text-sm sm:text-base">Your cart is empty.</p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition w-full sm:w-auto"
                >
                  Go to Products
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((i) => (
                    <div
                      key={i.productId}
                      className="p-3 sm:p-4 rounded-2xl bg-white/10 border border-white/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base truncate">
                            {i.name}
                          </p>
                          <p className="text-white/70 text-xs sm:text-sm">
                            Qty: {i.quantity}
                          </p>
                        </div>

                        <p className="font-semibold text-sm sm:text-base">
                          ₹
                          {(Number(i.price) * Number(i.quantity)).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/20">
                  <div className="flex items-center justify-between">
                    <p className="text-white/80 text-sm sm:text-base">Total</p>
                    <p className="text-white font-bold text-base sm:text-lg lg:text-xl">
                      ₹{Number(total || 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="w-full mt-4 bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition disabled:opacity-60"
                  >
                    {placing ? "Placing Order..." : "Place Order"}
                  </button>

                  <button
                    onClick={() => navigate("/customer/cart")}
                    className="w-full mt-3 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition"
                  >
                    Back to Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerBuy;
