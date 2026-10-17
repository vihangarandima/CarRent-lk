require("dotenv").config({ path: "c:/Users/Yasira/Desktop/CarRent-lk/backend/.env" });
const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const Rental = require("./models/Rental");
const Vehicle = require("./models/Vehicle");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("=== ALL VEHICLES ===");
  const v = await Vehicle.find();
  v.forEach(x => console.log(x._id.toString(), x.brand, x.model, "status:", x.status));

  console.log("\n=== LATEST 5 BOOKINGS ===");
  const b = await Booking.find().sort({ createdAt: -1 }).limit(5);
  b.forEach(x => console.log(x.bookingNumber, "veh:", x.vehicle?.toString(), "start:", x.startDate, "end:", x.endDate, "status:", x.status, "created:", x.createdAt));

  console.log("\n=== LATEST 5 RENTALS ===");
  const r = await Rental.find().sort({ createdAt: -1 }).limit(5);
  r.forEach(x => console.log(x._id.toString(), "veh:", x.vehicle?.toString(), "pickup:", x.pickupDate, "return:", x.returnDate, "status:", x.status, "created:", x.createdAt));

  process.exit(0);
}

check().catch(console.error);
