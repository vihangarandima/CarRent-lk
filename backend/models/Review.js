const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: false,
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    default: "",
  },
  comment: {
    type: String,
    required: true,
  },
  subRatings: {
    cleanliness: { type: Number, min: 1, max: 5, default: 5 },
    communication: { type: Number, min: 1, max: 5, default: 5 },
    valueForMoney: { type: Number, min: 1, max: 5, default: 5 },
    vehicleCondition: { type: Number, min: 1, max: 5, default: 5 },
  },
  tripType: {
    type: String,
    default: "Road Trip & Leisure",
  },
  recommended: {
    type: Boolean,
    default: true,
  },
  images: {
    type: [String],
    default: [],
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  helpfulUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  hostReply: {
    comment: { type: String, default: "" },
    repliedAt: { type: Date, default: null },
  },
  isVerifiedTrip: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", ReviewSchema);
