const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  vehicleType: {
    type: String,
    enum: ["bicycle", "threewheeler", "mini-car", "car", "premium-car", "mini-van", "van", "others"],
    required: true,
  },
  pricePerKmAfter100km: { type: Number, default: 0 },
  fuelType: { type: String },
  transmission: { type: String },
  description: { type: String },
  location: { type: String, required: true },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  images: [{ type: String }], // URLs to images
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    default: null,
  }, // set when a company lists this vehicle
  availableFrom: { type: Date, required: true },
  availableTo: { type: Date, required: true },
  isFeatured: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["active", "pending", "rejected", "hidden", "flagged", "rented"],
    default: "pending",
  },
  rejectionReason: { type: String, default: "" },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

// Indexes for the queries the site runs on every page load
VehicleSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
VehicleSchema.index({ owner: 1, createdAt: -1 });
VehicleSchema.index({ company: 1 });
VehicleSchema.index({ vehicleType: 1, pricePerDay: 1 });

module.exports = mongoose.model("Vehicle", VehicleSchema);
