const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const SiteConfig = require("../models/SiteConfig");

async function syncCategories() {
  try {
    if (!process.env.MONGO_URI) {
      console.log("No MONGO_URI in .env");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const newCategories = [
      {
        id: "suv",
        label: "SUV",
        vehicleType: "premium-car",
        image: "/assets/images/suv_category.jpg",
      },
      {
        id: "sedan",
        label: "Sedan",
        vehicleType: "car",
        image: "/assets/images/sedan_category.jpg",
      },
      {
        id: "luxury",
        label: "Luxury",
        vehicleType: "premium-car",
        image:
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "electric",
        label: "Electric",
        vehicleType: "car",
        image: "/assets/images/electric_category.jpg",
      },
      {
        id: "van",
        label: "Van",
        vehicleType: "van",
        image: "/assets/images/van_category.jpg",
      },
      {
        id: "coupe",
        label: "Coupe",
        vehicleType: "car",
        image:
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400",
      },
    ];

    const res = await SiteConfig.updateMany(
      {},
      {
        $set: {
          "home.categories": newCategories,
        },
      }
    );
    console.log("Updated SiteConfig categories in DB:", res);
  } catch (err) {
    console.error("DB Update error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

syncCategories();
