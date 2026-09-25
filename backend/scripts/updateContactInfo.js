const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const SiteConfig = require("../models/SiteConfig");

async function updateContact() {
  try {
    if (!process.env.MONGO_URI) {
      console.log("No MONGO_URI provided in .env");
      return;
    }
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const res = await SiteConfig.updateMany(
      {},
      {
        $set: {
          "global.contact.phone": "+94 70 243 4288",
          "global.contact.email": "yamucarrentals@gmail.com",
          "global.contact.address": "551/1, Thalgahawatta Lane, Wawa Road, Boralasgamuwa",
          "global.whatsAppSupport.phoneNumber": "+94702434288",
        },
      }
    );
    console.log("Updated SiteConfig in database:", res);

    const updated = await SiteConfig.findOne();
    console.log("Current DB Contact Config:", updated ? updated.global.contact : "No document found");
  } catch (err) {
    console.error("Error updating DB:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateContact();
