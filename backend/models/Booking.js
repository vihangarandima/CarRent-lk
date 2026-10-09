const mongoose = require("mongoose");
const crypto = require("crypto");

const BookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    originalVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: "",
    },
    customerNIC: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    rentMode: {
      type: String,
      enum: ["self-drive", "with-driver", "both"],
      default: "self-drive",
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "finding_alternative", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: "system" },
        note: { type: String, default: "" },
      },
    ],
    // High-entropy cryptographically secure token for Admin Dispatch Dashboard access without login hassle
    dispatchToken: {
      type: String,
      required: true,
      index: true,
    },
    dispatchTokenExpires: {
      type: Date,
    },
    // Admin checklist & progress persistence
    hostContacted: {
      type: Boolean,
      default: false,
    },
    hostContactedAt: {
      type: Date,
      default: null,
    },
    hostAvailabilityStatus: {
      type: String,
      enum: ["pending_check", "available", "unavailable"],
      default: "pending_check",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    cancelledBy: {
      type: String,
      enum: ["admin", "customer", null],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    confirmedRental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
BookingSchema.index({ customer: 1, createdAt: -1 });
BookingSchema.index({ host: 1, createdAt: -1 });
BookingSchema.index({ vehicle: 1, status: 1, startDate: 1, endDate: 1 });
BookingSchema.index({ dispatchToken: 1 });

// Helper method to generate random secure token
BookingSchema.statics.generateDispatchToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

// Helper method to generate booking number
BookingSchema.statics.generateBookingNumber = function () {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `BK-${dateStr}-${randomStr}`;
};

module.exports = mongoose.model("Booking", BookingSchema);
