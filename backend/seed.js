require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Category.deleteMany();
  await Product.deleteMany();

  const categories = await Category.insertMany([
    { name: 'Vegetables' }, { name: 'Fruits' }, { name: 'Cakes' }, { name: 'Biscuits' }
  ]);

  const products = [
    { name: 'Carrot', price: 1.2, description: 'Fresh carrot', imageUrl: 'https://picsum.photos/200/150?random=1', category: categories[0]._id },
    { name: 'Broccoli', price: 2.5, description: 'Organic broccoli', imageUrl: 'https://picsum.photos/200/150?random=2', category: categories[0]._id },
    { name: 'Apple', price: 0.8, description: 'Red apple', imageUrl: 'https://picsum.photos/200/150?random=3', category: categories[1]._id },
    { name: 'Banana', price: 0.5, description: 'Sweet banana', imageUrl: 'https://picsum.photos/200/150?random=4', category: categories[1]._id },
    { name: 'Chocolate Cake', price: 15.0, description: 'Rich chocolate', imageUrl: 'https://picsum.photos/200/150?random=5', category: categories[2]._id },
    { name: 'Oreo', price: 2.0, description: 'Cream biscuit', imageUrl: 'https://picsum.photos/200/150?random=6', category: categories[3]._id }
  ];
  await Product.insertMany(products);
  console.log('Database seeded');
  process.exit();
});