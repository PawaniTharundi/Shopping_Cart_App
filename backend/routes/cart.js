const express = require("express");
const auth = require("../middleware/auth");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const router = express.Router();

// Get user's cart
router.get("/", auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.userId }).populate("items.product");
  if (!cart) {
    cart = new Cart({ user: req.userId, items: [] });
    await cart.save();
  }
  res.json(cart);
});

// Add or update item
router.post("/add", auth, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) {
    cart = new Cart({ user: req.userId, items: [] });
  }
  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId,
  );
  if (existingIndex !== -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

// Update exact quantity (set quantity=0 to remove)
router.put("/update", auth, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.userId });
  if (!cart) return res.status(404).json({ error: "Cart not found" });
  const item = cart.items.find((item) => item.product.toString() === productId);
  if (!item) return res.status(404).json({ error: "Item not in cart" });
  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

// Remove item
router.delete("/remove/:productId", auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.userId });
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId,
  );
  await cart.save();
  await cart.populate("items.product");
  res.json(cart);
});

// Get total price
router.get("/total", auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.userId }).populate(
    "items.product",
  );
  if (!cart) return res.json({ total: 0 });
  let total = 0;
  for (let item of cart.items) {
    total += item.product.price * item.quantity;
  }
  res.json({ total });
});

module.exports = router;
