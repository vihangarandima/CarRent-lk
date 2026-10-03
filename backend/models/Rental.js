const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    default: null,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Customer details (optional - for quick recording)
  customerName: { type: String, default: "" },
  customerPhone: { type: String },
  customerEmail: { type: String },
  customerNIC: { type: String }, // National ID for Sri Lankan context

  // Rental period
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },

  // Pricing
  dailyRate: { type: Number, required: true },
  totalDays: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  extraKmCharge: { type: Number, default: 0 },

  // Status: active = currently rented, completed = returned, cancelled
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },

  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

RentalSchema.index({ owner: 1, createdAt: -1 });
RentalSchema.index({ status: 1, returnDate: 1 });

module.exports = mongoose.model("Rental", RentalSchema);
