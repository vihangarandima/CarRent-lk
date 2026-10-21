const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  firebaseId: { type: String },
  phone: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  location: { type: String, default: "" },
  address: { type: String, default: "" },
  // NIC for Sri Lankans, passport number for visitors
  nic: { type: String, default: "" },
  role: {
    type: String,
    enum: ["owner", "renter", "company", "admin"],
    default: "renter",
  },
  // False only for Google accounts created from the sign-in page, which never picked a role
  roleChosen: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
