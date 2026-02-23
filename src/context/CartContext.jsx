import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const CART_KEY = "myapp_cart_v1";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty) => {
    const productId = product?._id || product?.id;
    if (!productId) return;

    const quantity = Math.min(20, Math.max(1, Number(qty || 1)));

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(20, i.quantity + quantity) }
            : i
        );
      }
      return [
        ...prev,
        {
          productId,
          name: product.name || "",
          price: Number(product.price || 0),
          image: product.image || "",
          description: product.description || "",
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const q = Math.min(20, Math.max(1, Number(quantity || 1)));
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: q } : i))
    );
  };

  const clearCart = () => setCart([]);

  const totals = useMemo(() => {
    const itemsCount = cart.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
    const totalPrice = cart.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );
    return { itemsCount, totalPrice };
  }, [cart]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
