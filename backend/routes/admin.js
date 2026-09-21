const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Company = require("../models/Company");
const Bid = require("../models/Bid");
const Review = require("../models/Review");

// Middleware: Auth check
const auth = async (req, res, next) => {
  const token =
    req.header("x-auth-token") ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Middleware: Admin check
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin privileges required." });
    }
    req.adminUser = user;
    next();
  } catch (err) {
    res.status(500).json({ msg: "Authorization error" });
  }
};

// @route   GET /api/admin/stats
// @desc    Get real-time platform metrics and analytics
router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      rentersCount,
      ownersCount,
      companiesCount,
      adminsCount,
      totalVehicles,
      featuredVehicles,
      totalRegisteredCompanies,
      verifiedCompanies,
      totalBids,
      pendingBids,
      acceptedBids,
      rejectedBids,
      totalReviews,
      recentUsers,
      recentVehicles,
      recentBids,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "renter" }),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "company" }),
      User.countDocuments({ role: "admin" }),
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ isFeatured: true }),
      Company.countDocuments(),
      Company.countDocuments({ isVerified: true }),
      Bid.countDocuments(),
      Bid.countDocuments({ status: "pending" }),
      Bid.countDocuments({ status: "accepted" }),
      Bid.countDocuments({ status: "rejected" }),
      Review.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
      Vehicle.find().sort({ createdAt: -1 }).limit(5).populate("owner", "name email"),
      Bid.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("renter", "name email")
        .populate("vehicle", "brand model pricePerDay"),
    ]);

    // Aggregate vehicle types distribution
    const vehicleTypeStats = await Vehicle.aggregate([
      { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
    ]);

    // Calculate average review rating
    const avgRatingAgg = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const averageRating =
      avgRatingAgg.length > 0 ? avgRatingAgg[0].avg.toFixed(1) : "5.0";

    res.json({
      users: {
        total: totalUsers,
        renters: rentersCount,
        owners: ownersCount,
        companies: companiesCount,
        admins: adminsCount,
      },
      vehicles: {
        total: totalVehicles,
        featured: featuredVehicles,
        byType: vehicleTypeStats,
      },
      companies: {
        total: totalRegisteredCompanies,
        verified: verifiedCompanies,
        pending: totalRegisteredCompanies - verifiedCompanies,
      },
      bids: {
        total: totalBids,
        pending: pendingBids,
        accepted: acceptedBids,
        rejected: rejectedBids,
      },
      reviews: {
        total: totalReviews,
        averageRating,
      },
      recent: {
        users: recentUsers,
        vehicles: recentVehicles,
        bids: recentBids,
      },
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ msg: "Server error fetching admin stats" });
  }
});

// @route   GET /api/admin/users
// @desc    List and search users
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role && role !== "all") query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ msg: "Server error fetching users" });
  }
});

// @route   PATCH /api/admin/users/:id/role
// @desc    Change user role
router.patch("/users/:id/role", auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["renter", "owner", "company", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role specified" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: `User role updated to ${role}`, user });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ msg: "Server error updating user role" });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: "Cannot delete your own admin account" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ msg: "Server error deleting user" });
  }
});

// @route   GET /api/admin/companies
// @desc    List companies with verification info
router.get("/companies", auth, adminOnly, async (req, res) => {
  try {
    const companies = await Company.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ msg: "Server error fetching companies" });
  }
});

// @route   PATCH /api/admin/companies/:id/verify
// @desc    Toggle company verification status
router.patch("/companies/:id/verify", auth, adminOnly, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ msg: "Company not found" });

    company.isVerified = !company.isVerified;
    await company.save();

    res.json({
      msg: `Company verification ${company.isVerified ? "approved" : "revoked"}`,
      company,
    });
  } catch (err) {
    console.error("Error verifying company:", err);
    res.status(500).json({ msg: "Server error verifying company" });
  }
});

// @route   GET /api/admin/vehicles
// @desc    List all vehicles with full details
router.get("/vehicles", auth, adminOnly, async (req, res) => {
  try {
    const { vehicleType, isFeatured, search } = req.query;
    let query = {};
    if (vehicleType && vehicleType !== "all") query.vehicleType = vehicleType;
    if (isFeatured !== undefined && isFeatured !== "all") {
      query.isFeatured = isFeatured === "true";
    }
    if (search) {
      query.$or = [
        { brand: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
      ];
    }
    const vehicles = await Vehicle.find(query)
      .populate("owner", "name email")
      .populate("company", "companyName logo isVerified")
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error("Error fetching admin vehicles:", err);
    res.status(500).json({ msg: "Server error fetching vehicles" });
  }
});

// @route   PATCH /api/admin/vehicles/:id/feature
// @desc    Toggle featured status on homepage
router.patch("/vehicles/:id/feature", auth, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });

    vehicle.isFeatured = !vehicle.isFeatured;
    await vehicle.save();

    res.json({
      msg: `Vehicle ${vehicle.isFeatured ? "pinned as Featured" : "unpinned from Featured"}`,
      vehicle,
    });
  } catch (err) {
    console.error("Error toggling vehicle feature:", err);
    res.status(500).json({ msg: "Server error updating vehicle" });
  }
});

// @route   DELETE /api/admin/vehicles/:id
// @desc    Delete vehicle listing
router.delete("/vehicles/:id", auth, adminOnly, async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ msg: "Vehicle deleted successfully" });
  } catch (err) {
    console.error("Error deleting vehicle:", err);
    res.status(500).json({ msg: "Server error deleting vehicle" });
  }
});

// @route   GET /api/admin/reviews
// @desc    List all reviews
router.get("/reviews", auth, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("vehicle", "brand model year images")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ msg: "Server error fetching reviews" });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete review
router.delete("/reviews/:id", auth, adminOnly, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ msg: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ msg: "Server error deleting review" });
  }
});

module.exports = router;
