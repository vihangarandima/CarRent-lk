const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Review = require("../models/Review");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

async function seedActualReviews() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("No MONGO_URI in .env");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for actual reviews sync.");

    // 1. Ensure or find users with their profile avatars and locations
    const usersData = [
      {
        name: "Thivina pehasara",
        email: "thivina.pehasara@yamu.lk",
        location: "",
        profileImage: "/assets/images/thivina.png",
        role: "renter",
      },
      {
        name: "Punsara Rajapaksa",
        email: "punsara.rajapaksa@yamu.lk",
        location: "",
        profileImage: "/assets/images/punsara.png",
        role: "renter",
      },
      {
        name: "Nirmal Perera",
        email: "nirmal.perera@yamu.lk",
        location: "",
        profileImage: "/assets/images/nirmal.png",
        role: "owner",
      },
    ];

    const seededUsers = [];
    for (const u of usersData) {
      let user = await User.findOne({
        $or: [{ email: u.email }, { name: new RegExp(`^${u.name}$`, "i") }],
      });
      if (!user) {
        user = new User({
          name: u.name,
          email: u.email,
          location: u.location,
          profileImage: u.profileImage,
          role: u.role,
        });
        await user.save();
        console.log(`Created user: ${u.name}`);
      } else {
        user.name = u.name;
        user.location = u.location;
        user.profileImage = u.profileImage;
        await user.save();
        console.log(`Updated user: ${u.name}`);
      }
      seededUsers.push(user);
    }

    // 2. Find any active vehicle for optional link (or leave null if general platform review)
    const suvVehicle = await Vehicle.findOne({
      $or: [{ vehicleType: "premium-car" }, { vehicleType: "car" }],
    });

    // 3. Review details matching the landing page testimonials
    const actualReviews = [
      {
        user: seededUsers[0]._id,
        vehicle: suvVehicle?._id || null,
        rating: 5,
        title: "Spotless Toyota Fortuner for our family trip to Ella — highly dependable host!",
        comment:
          "Booked a Toyota Fortuner for our family trip to Ella. Smooth process, verified host, and the car was spotless. Will definitely use again!",
        location: "",
        tripType: "Family Vacation",
        recommended: true,
        helpfulCount: 28,
        isVerifiedTrip: true,
        subRatings: {
          cleanliness: 5,
          communication: 5,
          valueForMoney: 5,
          vehicleCondition: 5,
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        user: seededUsers[1]._id,
        vehicle: null,
        rating: 5,
        title: "Transparent pricing, zero hidden fees and 24/7 support made renting in Sri Lanka effortless",
        comment:
          "As a tourist, Yamu Car Rentals made renting so easy. Transparent pricing, no hidden fees, and 24/7 support when I had a question.",
        location: "",
        tripType: "Road Trip & Leisure",
        recommended: true,
        helpfulCount: 34,
        isVerifiedTrip: true,
        subRatings: {
          cleanliness: 5,
          communication: 5,
          valueForMoney: 5,
          vehicleCondition: 5,
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        user: seededUsers[2]._id,
        vehicle: null,
        rating: 5,
        title: "Listed my car and started earning within a week — all-in-one verification and bookings",
        comment:
          "I listed my car and started earning within a week. The platform handles everything — verification, bookings, payments. Highly recommend!",
        location: "",
        tripType: "Business & Airport",
        recommended: true,
        helpfulCount: 42,
        isVerifiedTrip: true,
        subRatings: {
          cleanliness: 5,
          communication: 5,
          valueForMoney: 5,
          vehicleCondition: 5,
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];

    for (const r of actualReviews) {
      const existing = await Review.findOne({
        user: r.user,
        comment: new RegExp(r.comment.slice(0, 30), "i"),
      });
      if (existing) {
        existing.rating = r.rating;
        existing.title = r.title;
        existing.comment = r.comment;
        existing.location = r.location;
        existing.subRatings = r.subRatings;
        existing.tripType = r.tripType;
        existing.helpfulCount = r.helpfulCount;
        existing.isVerifiedTrip = true;
        await existing.save();
        console.log(`Updated review for user ${r.user}`);
      } else {
        const newRev = new Review(r);
        await newRev.save();
        console.log(`Created new actual review for user ${r.user}`);
      }
    }

    const total = await Review.countDocuments();
    console.log(`Total reviews in database now: ${total}`);
  } catch (err) {
    console.error("Error seeding actual reviews:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedActualReviews();
