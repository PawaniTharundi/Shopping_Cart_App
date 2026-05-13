import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();
const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${API}/cart`, { withCredentials: true });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTotal = async () => {
    try {
      const res = await axios.get(`${API}/cart/total`, {
        withCredentials: true,
      });
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    await axios.post(
      `${API}/cart/add`,
      { productId, quantity },
      { withCredentials: true },
    );
    await fetchCart();
    await fetchTotal();
  };

  const updateQuantity = async (productId, quantity) => {
    await axios.put(
      `${API}/cart/update`,
      { productId, quantity },
      { withCredentials: true },
    );
    await fetchCart();
    await fetchTotal();
  };

  const removeItem = async (productId) => {
    await axios.delete(`${API}/cart/remove/${productId}`, {
      withCredentials: true,
    });
    await fetchCart();
    await fetchTotal();
  };

  useEffect(() => {
    fetchCart();
    fetchTotal();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        addToCart,
        updateQuantity,
        removeItem,
        fetchCart,
        fetchTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
