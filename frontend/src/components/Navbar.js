import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../contexts/CartContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Navbar = ({ user, setUser }) => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const logout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-800 shadow-lg sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar height increased from h-16 to h-20 */}
        <div className="flex justify-between items-center h-20">
          {/* Logo / Brand with fruit icon - larger text */}
          <Link
            to="/"
            className="flex items-center gap-2 text-white text-3xl font-bold hover:scale-105 transition-transform duration-200"
          >
            <span className="text-4xl">🍎</span>
            <span>FreshCart</span>
          </Link>

          {/* Desktop Navigation - adjusted spacing and button sizes */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-white hover:text-green-200 transition-colors duration-200 font-medium text-lg"
            >
              Shop
            </Link>
            <Link
              to="/cart"
              className="relative text-white hover:text-green-200 transition-colors duration-200 flex items-center gap-1"
            >
              <span className="text-3xl">🛒</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-5">
                <span className="text-white text-base bg-green-600 px-4 py-2 rounded-full flex items-center gap-1">
                  <span>👤</span> {user.name}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-base"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg text-base"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button - bigger tap area */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none p-2"
            >
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu panel - increased spacing */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-5 space-y-4">
            <Link
              to="/"
              className="block text-white hover:text-green-200 py-2 text-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/cart"
              className="block text-white hover:text-green-200 py-2 flex items-center gap-2 text-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cart 🛒{" "}
              {itemCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  ({itemCount})
                </span>
              )}
            </Link>
            {user ? (
              <>
                <div className="text-white bg-green-600 inline-block px-4 py-2 rounded-full flex items-center gap-1 text-base">
                  <span>👤</span> {user.name}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-base"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block bg-white text-green-700 px-5 py-2 rounded-lg font-semibold text-center text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
