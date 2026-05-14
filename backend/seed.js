require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Product = require("./models/Product");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Clear old data
  await Category.deleteMany();
  await Product.deleteMany();

  // Create categories
  const categories = await Category.insertMany([
    { name: "Vegetables" },
    { name: "Fruits" },
    { name: "Cakes" },
    { name: "Biscuits" },
  ]);

  // Helper to get category ID by name
  const getCatId = (name) => categories.find((c) => c.name === name)._id;

  // Products with 6 per category
  const products = [
    // Vegetables (6)
    {
      name: "Carrot",
      price: 1.2,
      description: "Fresh crunchy carrot",
      imageUrl: "https://picsum.photos/id/128/300/200",
      category: getCatId("Vegetables"),
    },
    {
      name: "Broccoli",
      price: 2.5,
      description: "Organic green broccoli",
      imageUrl: "https://picsum.photos/id/127/300/200",
      category: getCatId("Vegetables"),
    },
    {
      name: "Potato",
      price: 0.8,
      description: "Fresh brown potatoes",
      imageUrl: "https://picsum.photos/id/92/300/200",
      category: getCatId("Vegetables"),
    },
    {
      name: "Tomato",
      price: 1.0,
      description: "Red ripe tomatoes",
      imageUrl: "https://picsum.photos/id/108/300/200",
      category: getCatId("Vegetables"),
    },
    {
      name: "Onion",
      price: 0.6,
      description: "Red onions",
      imageUrl: "https://picsum.photos/id/93/300/200",
      category: getCatId("Vegetables"),
    },
    {
      name: "Bell Pepper",
      price: 1.5,
      description: "Colorful bell peppers",
      imageUrl: "https://picsum.photos/id/126/300/200",
      category: getCatId("Vegetables"),
    },

    // Fruits (6)
    {
      name: "Apple",
      price: 0.8,
      description: "Sweet red apple",
      imageUrl: "https://picsum.photos/id/108/300/200",
      category: getCatId("Fruits"),
    },
    {
      name: "Banana",
      price: 0.5,
      description: "Ripe yellow banana",
      imageUrl: "https://picsum.photos/id/129/300/200",
      category: getCatId("Fruits"),
    },
    {
      name: "Orange",
      price: 0.7,
      description: "Juicy orange",
      imageUrl: "https://picsum.photos/id/21/300/200",
      category: getCatId("Fruits"),
    },
    {
      name: "Strawberry",
      price: 2.2,
      description: "Fresh strawberries",
      imageUrl: "https://picsum.photos/id/102/300/200",
      category: getCatId("Fruits"),
    },
    {
      name: "Grapes",
      price: 1.8,
      description: "Green grapes",
      imageUrl: "https://picsum.photos/id/104/300/200",
      category: getCatId("Fruits"),
    },
    {
      name: "Mango",
      price: 1.5,
      description: "Sweet mango",
      imageUrl: "https://picsum.photos/id/98/300/200",
      category: getCatId("Fruits"),
    },

    // Cakes (6)
    {
      name: "Chocolate Cake",
      price: 15.0,
      description: "Rich chocolate cake",
      imageUrl: "https://picsum.photos/id/106/300/200",
      category: getCatId("Cakes"),
    },
    {
      name: "Vanilla Cake",
      price: 12.0,
      description: "Classic vanilla sponge",
      imageUrl: "https://picsum.photos/id/105/300/200",
      category: getCatId("Cakes"),
    },
    {
      name: "Red Velvet",
      price: 14.0,
      description: "Red velvet with cream cheese",
      imageUrl: "https://picsum.photos/id/6/300/200",
      category: getCatId("Cakes"),
    },
    {
      name: "Cheesecake",
      price: 16.0,
      description: "Creamy cheesecake",
      imageUrl: "https://picsum.photos/id/5/300/200",
      category: getCatId("Cakes"),
    },
    {
      name: "Black Forest",
      price: 18.0,
      description: "Cherry chocolate cake",
      imageUrl: "https://picsum.photos/id/4/300/200",
      category: getCatId("Cakes"),
    },
    {
      name: "Carrot Cake",
      price: 13.0,
      description: "Carrot cake with walnuts",
      imageUrl: "https://picsum.photos/id/128/300/200",
      category: getCatId("Cakes"),
    },

    // Biscuits (6)
    {
      name: "Oreo",
      price: 2.0,
      description: "Cream filled chocolate biscuit",
      imageUrl: "https://picsum.photos/id/10/300/200",
      category: getCatId("Biscuits"),
    },
    {
      name: "Marie",
      price: 1.5,
      description: "Classic tea biscuit",
      imageUrl: "https://picsum.photos/id/11/300/200",
      category: getCatId("Biscuits"),
    },
    {
      name: "Digestive",
      price: 2.0,
      description: "Healthy digestive biscuit",
      imageUrl: "https://picsum.photos/id/12/300/200",
      category: getCatId("Biscuits"),
    },
    {
      name: "Bourbon",
      price: 2.5,
      description: "Chocolate cream sandwich",
      imageUrl: "https://picsum.photos/id/13/300/200",
      category: getCatId("Biscuits"),
    },
    {
      name: "Cream Cracker",
      price: 1.8,
      description: "Salty cream cracker",
      imageUrl: "https://picsum.photos/id/14/300/200",
      category: getCatId("Biscuits"),
    },
    {
      name: "Shortbread",
      price: 3.0,
      description: "Buttery shortbread",
      imageUrl: "https://picsum.photos/id/15/300/200",
      category: getCatId("Biscuits"),
    },
  ];

  await Product.insertMany(products);
  console.log("✅ Database seeded with 6 products per category (total 24).");
  process.exit();
});
