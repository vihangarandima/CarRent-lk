const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Review = require("../models/Review");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

async function seedReviews() {
  try {
    if (!process.env.MONGO_URI) {
      console.log("No MONGO_URI in .env");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const users = await User.find();
    const vehicles = await Vehicle.find();

    if (users.length === 0) {
      console.log("No users found.");
      return;
    }

    const sampleReviews = [
      {
        user: users[1]?._id || users[0]._id,
        vehicle: vehicles[0]?._id || null,
        rating: 5,
        title: "Smooth southern coastal road trip! Unmatched fuel economy",
        comment:
          "Rented the Wagon R for a 4-day weekend trip down south to Galle, Mirissa, and Tangalle. The car was spotless inside out, AC was ice cold, and the host was very communicative and accommodating on pickup time. Highly recommend Yamu Car Rentals for quick and hassle-free booking!",
        subRatings: {
          cleanliness: 5,
          communication: 5,
          valueForMoney: 5,
          vehicleCondition: 5,
        },
        tripType: "Road Trip & Coastal Safari",
        recommended: true,
        helpfulCount: 14,
        isVerifiedTrip: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        user: users[4]?._id || users[0]._id,
        vehicle: vehicles[1]?._id || null,
        rating: 5,
        title: "Excellent executive sedan for Colombo business and airport transfer",
        comment:
          "Very smooth drive with the Toyota Axio. Pickup in Bambalapitiya was right on schedule. The host was courteous and provided clear guidance. Will definitely rent again through this portal on my next trip to Colombo.",
        subRatings: {
          cleanliness: 5,
          communication: 5,
          valueForMoney: 4,
          vehicleCondition: 5,
        },
        tripType: "Business & City Travel",
        recommended: true,
        helpfulCount: 9,
        isVerifiedTrip: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        user: users[9]?._id || users[0]._id,
        vehicle: null,
        rating: 5,
        title: "Best car rental platform experience in Sri Lanka!",
        comment:
          "From booking via WhatsApp to easy vehicle handover, everything was seamless. The hosts are verified and trustworthy. No hidden fees or surprise deposits. 10/10 service!",
        subRatings: {
          cleanliness: 5,
          communication: 5,
          valueForMoney: 5,
          vehicleCondition: 5,
        },
        tripType: "Family Vacation",
        recommended: true,
        helpfulCount: 22,
        isVerifiedTrip: true,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        user: users[10]?._id || users[0]._id,
        vehicle: vehicles[0]?._id || null,
        rating: 4,
        title: "Reliable and convenient for short city trips",
        comment:
          "Super easy to handle in city traffic. Clean interior and fair daily pricing. The host was very friendly and made returning the car effortless.",
        subRatings: {
          cleanliness: 4,
          communication: 5,
          valueForMoney: 5,
          vehicleCondition: 4,
        },
        tripType: "City Commute & Weekend",
        recommended: true,
        helpfulCount: 6,
        isVerifiedTrip: true,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
    ];

    const count = await Review.countDocuments();
    if (count === 0) {
      await Review.insertMany(sampleReviews);
      console.log("Seeded initial rich reviews successfully!");
    } else {
      console.log(`Reviews collection already has ${count} records.`);
    }
  } catch (err) {
    console.error("Seed reviews error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedReviews();
