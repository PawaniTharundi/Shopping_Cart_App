import React from "react";
import { useCart } from "../contexts/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-green-600">
            ${product.price}
          </span>
          <button
            onClick={() => addToCart(product._id, 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1"
          >
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
