import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ProductList = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    axios.get(`${API}/categories`).then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const url = selectedCategory
      ? `${API}/products?category=${selectedCategory}`
      : `${API}/products`;
    axios.get(url).then((res) => setProducts(res.data));
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Products</h1>

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2 mb-8 border-b pb-4">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-4 py-2 rounded-full transition ${
            !selectedCategory
              ? "bg-green-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat._id)}
            className={`px-4 py-2 rounded-full transition ${
              selectedCategory === cat._id
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
