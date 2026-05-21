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
      imageUrl:
        "https://www.tasteofhome.com/wp-content/uploads/2019/01/carrots-shutterstock_789443206.jpg",
      category: getCatId("Vegetables"),
    },
    {
      name: "Broccoli",
      price: 2.5,
      description: "Organic green broccoli",
      imageUrl:
        "https://www.sharbatlyfruit.com/Home/fruits-vegetable/1668/image-thumb__1668__commonThumbnail/Broccoli%20green_5.acdd3ceb.jpg",
      category: getCatId("Vegetables"),
    },
    {
      name: "Potato",
      price: 0.8,
      description: "Fresh brown potatoes",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8HMFBTgr9IC4AQmEzVP4BsY-taJieyY4YpA&s",
      category: getCatId("Vegetables"),
    },
    {
      name: "Tomato",
      price: 1.0,
      description: "Red ripe tomatoes",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfAMci-TmLCoCJDRGPyo14-fLBmno69D_MYg&s",
      category: getCatId("Vegetables"),
    },
    {
      name: "Onion",
      price: 0.6,
      description: "Red onions",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShxzddCrQKcMemDczbEJ6BhpTliaMuBoj-mA&s",
      category: getCatId("Vegetables"),
    },
    {
      name: "Bell Pepper",
      price: 1.5,
      description: "Colorful bell peppers",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY08VR5b3OKJofNWB4oc-T0yjwBMAhR37ehg&s",
      category: getCatId("Vegetables"),
    },

    // Fruits (6)
    {
      name: "Apple",
      price: 0.8,
      description: "Sweet red apple",
      imageUrl:
        "https://www.health.com/thmb/Yy4s6UTZuxuVz-Qpw5ZX0MkT4Q0=/6720x0/filters:no_upscale():max_bytes(150000):strip_icc()/Health-GettyImages-2167564745-e6748455712041dca68148e125ac1642.jpg",
      category: getCatId("Fruits"),
    },
    {
      name: "Banana",
      price: 0.5,
      description: "Ripe yellow banana",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjJaXedBqtFgzFeME2mwX4si-PBOMdLZ656g&s",
      category: getCatId("Fruits"),
    },
    {
      name: "Orange",
      price: 0.7,
      description: "Juicy orange",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO7uzCmQq1_FUdlMGhTVOG7b6nOoleb-2Otw&s",
      category: getCatId("Fruits"),
    },
    {
      name: "Strawberry",
      price: 2.2,
      description: "Fresh strawberries",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLFlLyCpLSjeo4sgQjvvwct2DZH7he6vWQpw&s",
      category: getCatId("Fruits"),
    },
    {
      name: "Grapes",
      price: 1.8,
      description: "Green grapes",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5urczc_SaeU6xf4g__rb7rhzb08ADomdDjw&s",
      category: getCatId("Fruits"),
    },
    {
      name: "Mango",
      price: 1.5,
      description: "Sweet mango",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvIafyz-XL4zkGqJzSvNVa5D0YLMdagUSBFg&s",
      category: getCatId("Fruits"),
    },

    // Cakes (6)
    {
      name: "Chocolate Cake",
      price: 15.0,
      description: "Rich chocolate cake",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6KIUZ_1AwtxX1aee1nh0_DMrCQa8lxelV1g&s",
      category: getCatId("Cakes"),
    },
    {
      name: "Vanilla Cake",
      price: 12.0,
      description: "Classic vanilla sponge",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYhOnd47TNFPAJnER_zXIQABI4h8_QBVJ62A&s",
      category: getCatId("Cakes"),
    },
    {
      name: "Red Velvet",
      price: 14.0,
      description: "Red velvet with cream cheese",
      imageUrl:
        "https://www.freshsavory.com/wp-content/uploads/2025/09/red-velvet-cake.jpg",
      category: getCatId("Cakes"),
    },
    {
      name: "Cheesecake",
      price: 16.0,
      description: "Creamy cheesecake",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIf824ayFuzpanVnlqpnkQ3ONydiMwFpMd_A&s",
      category: getCatId("Cakes"),
    },
    {
      name: "Black Forest",
      price: 18.0,
      description: "Cherry chocolate cake",
      imageUrl:
        "https://cdn.apartmenttherapy.info/image/upload/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_1:1/k%2FPhoto%2FRecipes%2F2024-09-black-forest-cake%2Fblack-forest-cake-389",
      category: getCatId("Cakes"),
    },
    {
      name: "Carrot Cake",
      price: 13.0,
      description: "Carrot cake with walnuts",
      imageUrl:
        "https://www.rainbownourishments.com/wp-content/uploads/2023/03/vegan-carrot-cake-1.jpg",
      category: getCatId("Cakes"),
    },

    // Biscuits (6)
    {
      name: "Oreo",
      price: 2.0,
      description: "Cream filled chocolate biscuit",
      imageUrl:
        "https://www.jbcookiecutters.com/wp-content/uploads/2023/02/Oreo-Cookies-Recipe-02.jpg",
      category: getCatId("Biscuits"),
    },
    {
      name: "Marie",
      price: 1.5,
      description: "Classic tea biscuit",
      imageUrl:
        "https://cdn.tasteatlas.com/images/ingredients/e4cb40ef7d9e4dcdbf36d2a27e57ead6.jpg?w=600",
      category: getCatId("Biscuits"),
    },
    {
      name: "Digestive",
      price: 2.0,
      description: "Healthy digestive biscuit",
      imageUrl:
        "https://www.biggerbolderbaking.com/wp-content/uploads/2017/02/Digestive-Biscuits-copy-1-500x500.jpg",
      category: getCatId("Biscuits"),
    },
    {
      name: "Bourbon",
      price: 2.5,
      description: "Chocolate cream sandwich",
      imageUrl:
        "https://tinandthyme.uk/wp-content/uploads/2016/04/Bourbon-BiscuitsJPG.jpg",
      category: getCatId("Biscuits"),
    },
    {
      name: "Cream Cracker",
      price: 1.8,
      description: "Salty cream cracker",
      imageUrl:
        "https://www.gelgoogmachinery.com/uploads/allimg/240205/9-240205161937-50.jpg",
      category: getCatId("Biscuits"),
    },
    {
      name: "Shortbread",
      price: 3.0,
      description: "Buttery shortbread",
      imageUrl:
        "https://www.thespruceeats.com/thmb/xpbdjWgR2Y7Ev9nmLqOtueBUvfE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/brown-sugar-shortbread-recipe-3052142-hero-01-f8caa1163005430883143895327401f5.jpg",
      category: getCatId("Biscuits"),
    },
  ];

  await Product.insertMany(products);
  console.log("✅ Database seeded with 6 products per category (total 24).");
  process.exit();
});
