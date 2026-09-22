const mongoose = require("mongoose");
const SiteConfig = require("../models/SiteConfig");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const newTestimonials = [
    {
      name: "Thivina pehasara",
      location: "Colombo",
      rating: 5,
      text: "Booked a Toyota Fortuner for our family trip to Ella. Smooth process, verified host, and the car was spotless. Will definitely use again!",
      avatar: "/assets/images/thivina.png",
    },
    {
      name: "Punsara Rajapaksa",
      location: "Kandy",
      rating: 5,
      text: "As a tourist, Yamu Car Rentals made renting so easy. Transparent pricing, no hidden fees, and 24/7 support when I had a question.",
      avatar: "/assets/images/punsara.png",
    },
    {
      name: "Nirmal Perera",
      location: "Galle",
      rating: 5,
      text: "I listed my car and started earning within a week. The platform handles everything — verification, bookings, payments. Highly recommend!",
      avatar: "/assets/images/nirmal.png",
    },
  ];

  const res = await SiteConfig.updateOne(
    {},
    { $set: { "home.testimonials": newTestimonials } }
  );
  console.log("Updated DB testimonials successfully:", res);
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
