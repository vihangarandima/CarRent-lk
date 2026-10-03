const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { escapeRegex } = require("../middleware/auth");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Company = require("../models/Company");
const Bid = require("../models/Bid");
const Review = require("../models/Review");
const Rental = require("../models/Rental");

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
        .json({ msg: "Access denied. Super Admin privileges required." });
    }
    req.adminUser = user;
    next();
  } catch (err) {
    res.status(500).json({ msg: "Authorization error" });
  }
};

// @route   GET /api/admin/stats
// @desc    Get real-time platform metrics, analytics and pending action counts
router.get("/stats", auth, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      rentersCount,
      ownersCount,
      companiesCount,
      adminsCount,
      totalVehicles,
      pendingApprovalVehicles,
      activeVehicles,
      rentedVehicles,
      rejectedVehicles,
      featuredVehicles,
      totalRegisteredCompanies,
      verifiedCompanies,
      totalRentals,
      activeRentals,
      completedRentals,
      totalBids,
      pendingBids,
      totalReviews,
      recentUsers,
      recentVehicles,
      recentRentals,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "renter" }),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ role: "company" }),
      User.countDocuments({ role: "admin" }),
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: "pending" }),
      Vehicle.countDocuments({ status: "active" }),
      Vehicle.countDocuments({ status: "rented" }),
      Vehicle.countDocuments({ status: "rejected" }),
      Vehicle.countDocuments({ isFeatured: true }),
      Company.countDocuments(),
      Company.countDocuments({ isVerified: true }),
      Rental.countDocuments(),
      Rental.countDocuments({ status: "active" }),
      Rental.countDocuments({ status: "completed" }),
      Bid.countDocuments(),
      Bid.countDocuments({ status: "pending" }),
      Review.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
      Vehicle.find().sort({ createdAt: -1 }).limit(6).populate("owner", "name email role").populate("company", "companyName logo"),
      Rental.find().sort({ createdAt: -1 }).limit(5).populate("vehicle", "brand model year").populate("owner", "name email"),
    ]);

    // Aggregate vehicle types distribution
    const vehicleTypeStats = await Vehicle.aggregate([
      { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
    ]);

    // Calculate total platform revenue from rentals
    const rentalRevenueAgg = await Rental.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalPlatformRevenue = rentalRevenueAgg.length > 0 ? rentalRevenueAgg[0].total : 0;

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
        pending: pendingApprovalVehicles,
        active: activeVehicles,
        rented: rentedVehicles,
        rejected: rejectedVehicles,
        featured: featuredVehicles,
        byType: vehicleTypeStats,
      },
      companies: {
        total: totalRegisteredCompanies,
        verified: verifiedCompanies,
        pending: totalRegisteredCompanies - verifiedCompanies,
      },
      rentals: {
        total: totalRentals,
        active: activeRentals,
        completed: completedRentals,
        totalRevenue: totalPlatformRevenue,
      },
      bids: {
        total: totalBids,
        pending: pendingBids,
      },
      reviews: {
        total: totalReviews,
        averageRating,
      },
      pendingApprovals: {
        vehicles: pendingApprovalVehicles,
        companies: totalRegisteredCompanies - verifiedCompanies,
        total: pendingApprovalVehicles + (totalRegisteredCompanies - verifiedCompanies),
      },
      recent: {
        users: recentUsers,
        vehicles: recentVehicles,
        rentals: recentRentals,
      },
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ msg: "Server error fetching admin stats" });
  }
});

// ==========================================
// VEHICLE LISTINGS & APPROVALS (SUPER ADMIN)
// ==========================================

// @route   GET /api/admin/vehicles
// @desc    List all vehicles with full details and status filter
router.get("/vehicles", auth, adminOnly, async (req, res) => {
  try {
    const { status, vehicleType, isFeatured, search } = req.query;
    let query = {};
    if (status && status !== "all") query.status = status;
    if (vehicleType && vehicleType !== "all") query.vehicleType = vehicleType;
    if (isFeatured !== undefined && isFeatured !== "all") {
      query.isFeatured = isFeatured === "true";
    }
    if (search) {
      query.$or = [
        { brand: new RegExp(escapeRegex(search), "i") },
        { model: new RegExp(escapeRegex(search), "i") },
        { location: new RegExp(escapeRegex(search), "i") },
      ];
    }
    const vehicles = await Vehicle.find(query)
      .populate("owner", "name email role phone")
      .populate("company", "companyName logo isVerified phone address")
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error("Error fetching admin vehicles:", err);
    res.status(500).json({ msg: "Server error fetching vehicles" });
  }
});

// @route   PATCH /api/admin/vehicles/:id/approve
// @desc    Super Admin approves vehicle listing (sets status to active)
router.patch("/vehicles/:id/approve", auth, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });

    vehicle.status = "active";
    vehicle.approvedAt = new Date();
    vehicle.approvedBy = req.user.id;
    vehicle.rejectionReason = "";
    await vehicle.save();

    const populated = await Vehicle.findById(vehicle._id)
      .populate("owner", "name email role phone")
      .populate("company", "companyName logo isVerified");

    res.json({
      msg: `Listing approved! ${vehicle.brand} ${vehicle.model} is now LIVE on the marketplace.`,
      vehicle: populated,
    });
  } catch (err) {
    console.error("Error approving vehicle:", err);
    res.status(500).json({ msg: "Server error approving vehicle" });
  }
});

// @route   PATCH /api/admin/vehicles/:id/reject
// @desc    Super Admin rejects vehicle listing with an optional reason
router.patch("/vehicles/:id/reject", auth, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });

    vehicle.status = "rejected";
    vehicle.rejectionReason = String(reason || "Does not meet platform quality or verification guidelines").trim();
    await vehicle.save();

    const populated = await Vehicle.findById(vehicle._id)
      .populate("owner", "name email role phone")
      .populate("company", "companyName logo isVerified");

    res.json({
      msg: `Listing rejected. Reason: "${vehicle.rejectionReason}"`,
      vehicle: populated,
    });
  } catch (err) {
    console.error("Error rejecting vehicle:", err);
    res.status(500).json({ msg: "Server error rejecting vehicle" });
  }
});

// @route   PATCH /api/admin/vehicles/:id/status
// @desc    Super Admin sets any vehicle status (active, pending, rejected, hidden, flagged, rented)
router.patch("/vehicles/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!["active", "pending", "rejected", "hidden", "flagged", "rented"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value." });
    }
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });

    vehicle.status = status;
    if (status === "active") {
      vehicle.approvedAt = vehicle.approvedAt || new Date();
      vehicle.approvedBy = req.user.id;
      vehicle.rejectionReason = "";
    } else if (status === "rejected" && reason) {
      vehicle.rejectionReason = reason;
    }
    await vehicle.save();

    const populated = await Vehicle.findById(vehicle._id)
      .populate("owner", "name email role phone")
      .populate("company", "companyName logo isVerified");

    res.json({ msg: `Vehicle status changed to ${status}`, vehicle: populated });
  } catch (err) {
    console.error("Error updating vehicle status:", err);
    res.status(500).json({ msg: "Server error updating status" });
  }
});

// @route   PUT /api/admin/vehicles/:id
// @desc    Super Admin edit EVERYTHING on a vehicle
router.put("/vehicles/:id", auth, adminOnly, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;

    if (updateData.pricePerDay) updateData.pricePerDay = Number(updateData.pricePerDay);
    if (updateData.pricePerKmAfter100km !== undefined) {
      updateData.pricePerKmAfter100km = Number(updateData.pricePerKmAfter100km);
    }
    if (updateData.year) updateData.year = Number(updateData.year);

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("owner", "name email role phone")
      .populate("company", "companyName logo isVerified");

    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    res.json({ msg: "Vehicle updated successfully by Super Admin", vehicle });
  } catch (err) {
    console.error("Error editing vehicle as Super Admin:", err);
    res.status(500).json({ msg: "Server error updating vehicle: " + (err.message || "") });
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
// @desc    Super Admin permanently delete vehicle listing
router.delete("/vehicles/:id", auth, adminOnly, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    // Also clean up associated bids
    await Bid.deleteMany({ vehicle: req.params.id });
    res.json({ msg: "Vehicle and associated inquiries permanently deleted." });
  } catch (err) {
    console.error("Error deleting vehicle:", err);
    res.status(500).json({ msg: "Server error deleting vehicle" });
  }
});

// ==========================================
// USER MANAGEMENT (SUPER ADMIN)
// ==========================================

// @route   GET /api/admin/users
// @desc    List and search all users
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role && role !== "all") query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(escapeRegex(search), "i") },
        { email: new RegExp(escapeRegex(search), "i") },
        { phone: new RegExp(escapeRegex(search), "i") },
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

// @route   PUT /api/admin/users/:id
// @desc    Super Admin update any user's profile details
router.put("/users/:id", auth, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (email) update.email = email.trim().toLowerCase();
    if (phone !== undefined) update.phone = phone.trim();
    if (role && ["renter", "owner", "company", "admin"].includes(role)) {
      update.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ msg: "Server error updating user" });
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
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Cascade delete company and listings
    await Company.deleteMany({ user: req.params.id });
    await Vehicle.deleteMany({ owner: req.params.id });

    res.json({ msg: "User and associated data deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ msg: "Server error deleting user" });
  }
});

// ==========================================
// COMPANY MANAGEMENT (SUPER ADMIN)
// ==========================================

// @route   GET /api/admin/companies
// @desc    List all companies with owner info and verification status
router.get("/companies", auth, adminOnly, async (req, res) => {
  try {
    const { search, isVerified } = req.query;
    let query = {};
    if (isVerified !== undefined && isVerified !== "all") {
      query.isVerified = isVerified === "true";
    }
    if (search) {
      query.$or = [
        { companyName: new RegExp(escapeRegex(search), "i") },
        { contactEmail: new RegExp(escapeRegex(search), "i") },
        { phone: new RegExp(escapeRegex(search), "i") },
        { address: new RegExp(escapeRegex(search), "i") },
      ];
    }
    const companies = await Company.find(query)
      .populate("user", "name email role phone")
      .sort({ createdAt: -1 });

    // Attach vehicle counts
    const counts = await Vehicle.aggregate([
      { $group: { _id: "$company", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id?.toString(), c.count]));

    const result = companies.map((c) => ({
      ...c.toObject(),
      vehicleCount: countMap.get(c._id.toString()) || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ msg: "Server error fetching companies" });
  }
});

// @route   PUT /api/admin/companies/:id
// @desc    Super Admin update any company details
router.put("/companies/:id", auth, adminOnly, async (req, res) => {
  try {
    const update = { ...req.body };
    delete update._id;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).populate("user", "name email role");

    if (!company) return res.status(404).json({ msg: "Company not found" });
    res.json({ msg: "Company profile updated successfully", company });
  } catch (err) {
    console.error("Error updating company:", err);
    res.status(500).json({ msg: "Server error updating company" });
  }
});

// @route   PATCH /api/admin/companies/:id/verify
// @desc    Toggle or set company verification status
router.patch("/companies/:id/verify", auth, adminOnly, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ msg: "Company not found" });

    company.isVerified = typeof req.body.isVerified === "boolean" ? req.body.isVerified : !company.isVerified;
    await company.save();

    res.json({
      msg: `Company verification ${company.isVerified ? "approved & verified" : "revoked"}`,
      company,
    });
  } catch (err) {
    console.error("Error verifying company:", err);
    res.status(500).json({ msg: "Server error verifying company" });
  }
});

// @route   DELETE /api/admin/companies/:id
// @desc    Delete company
router.delete("/companies/:id", auth, adminOnly, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ msg: "Company not found" });
    res.json({ msg: "Company deleted successfully" });
  } catch (err) {
    console.error("Error deleting company:", err);
    res.status(500).json({ msg: "Server error deleting company" });
  }
});

// ==========================================
// RENTALS MANAGEMENT (SUPER ADMIN)
// ==========================================

// @route   GET /api/admin/rentals
// @desc    List all platform rentals with full details
router.get("/rentals", auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== "all") query.status = status;

    const rentals = await Rental.find(query)
      .populate("vehicle", "brand model year vehicleType pricePerDay images location status")
      .populate("owner", "name email phone")
      .populate("company", "companyName logo")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (err) {
    console.error("Error fetching admin rentals:", err);
    res.status(500).json({ msg: "Server error fetching rentals" });
  }
});

// @route   PATCH /api/admin/rentals/:id/status
// @desc    Super Admin force update rental status (active, completed, cancelled)
router.patch("/rentals/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ msg: "Invalid rental status" });
    }

    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ msg: "Rental record not found" });

    rental.status = status;
    await rental.save();

    // If rental completed or cancelled, restore vehicle to active if it was rented
    if (status === "completed" || status === "cancelled") {
      const vehicle = await Vehicle.findById(rental.vehicle);
      if (vehicle && vehicle.status === "rented") {
        vehicle.status = "active";
        await vehicle.save();
      }
    } else if (status === "active") {
      const vehicle = await Vehicle.findById(rental.vehicle);
      if (vehicle) {
        vehicle.status = "rented";
        await vehicle.save();
      }
    }

    const populated = await Rental.findById(rental._id)
      .populate("vehicle", "brand model year vehicleType pricePerDay images location")
      .populate("owner", "name email phone")
      .populate("company", "companyName logo");

    res.json({ msg: `Rental status updated to ${status}`, rental: populated });
  } catch (err) {
    console.error("Error updating rental status:", err);
    res.status(500).json({ msg: "Server error updating rental status" });
  }
});

// @route   DELETE /api/admin/rentals/:id
// @desc    Super Admin delete rental record
router.delete("/rentals/:id", auth, adminOnly, async (req, res) => {
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    if (!rental) return res.status(404).json({ msg: "Rental record not found" });
    res.json({ msg: "Rental record deleted successfully" });
  } catch (err) {
    console.error("Error deleting rental:", err);
    res.status(500).json({ msg: "Server error deleting rental" });
  }
});

// ==========================================
// REVIEWS MANAGEMENT (SUPER ADMIN)
// ==========================================

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
