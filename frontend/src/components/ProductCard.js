import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const user = useUser();
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(product.imageUrl);

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    addToCart(product._id, 1);
  };

  const handleImageError = () => {
    // Fallback image (emoji or placeholder)
    setImgSrc("https://picsum.photos/id/20/300/200");
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img
        src={imgSrc}
        alt={product.name}
        className="w-full h-48 object-cover"
        onError={handleImageError}
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
            onClick={handleAddToCart}
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
