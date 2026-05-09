const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Category = require('../models/Category');
const router = express.Router();

// Admin middleware (check isAdmin flag)
const adminOnly = async (req, res, next) => {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

router.post('/products', auth, adminOnly, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

router.put('/products/:id', auth, adminOnly, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

router.delete('/products/:id', auth, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Also category management
router.post('/categories', auth, adminOnly, async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.json(category);
});

router.delete('/categories/:id', auth, adminOnly, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;