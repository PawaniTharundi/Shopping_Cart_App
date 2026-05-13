import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../contexts/CartContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Navbar = ({ user, setUser }) => {
  const { cart } = useCart();
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const logout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <nav className="bg-green-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-white text-xl font-bold"
          >
            🍅 FreshCart
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/cart"
              className="relative text-white hover:text-green-200 transition"
            >
              <span className="text-xl">🛒</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-white text-sm">{user.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-green-700 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
