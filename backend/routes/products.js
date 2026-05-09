const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.get('/', async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const products = await Product.find(filter).populate('category');
  res.json(products);
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  res.json(product);
});

module.exports = router;