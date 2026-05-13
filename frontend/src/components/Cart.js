import React from "react";
import { useCart } from "../contexts/CartContext";

const Cart = () => {
  const { cart, total, updateQuantity, removeItem } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold text-gray-700">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mt-2">
          Add some delicious items to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cart.items.map((item) => (
            <div
              key={item.product._id}
              className="p-4 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-gray-500">${item.product.price} each</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      item.product._id,
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-20 border rounded-lg px-2 py-1 text-center focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={() => removeItem(item.product._id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  🗑️
                </button>
              </div>
              <div className="w-24 text-right font-semibold text-gray-800">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 px-4 py-3 flex flex-wrap justify-between items-center gap-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-green-600">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="mt-6 text-right">
        <button
          onClick={() =>
            alert(
              "Order summary:\n" +
                cart.items
                  .map(
                    (i) =>
                      `${i.product.name} x${i.quantity} = $${(i.product.price * i.quantity).toFixed(2)}`,
                  )
                  .join("\n") +
                `\n\nTotal: $${total.toFixed(2)}`,
            )
          }
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Proceed to Order Summary
        </button>
      </div>
    </div>
  );
};

export default Cart;
