const express = require("express");
const router = express.Router();
const Rental = require("../models/Rental");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Company = require("../models/Company");
const mongoose = require("mongoose");
const { auth } = require("../middleware/auth");
const { autoExpireRentals } = require("../utils/rentalExpiry");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: Build rental query covering individual owner OR rental company fleet
const getHostRentalQuery = async (userId) => {
  const userCompany = await Company.findOne({ user: userId }).select("_id");
  const vehicleFilter = userCompany
    ? { $or: [{ owner: userId }, { company: userCompany._id }] }
    : { owner: userId };
  const userVehicles = await Vehicle.find(vehicleFilter).select("_id");
  const vehicleIds = userVehicles.map((v) => v._id);

  const orConditions = [{ owner: userId }];
  if (userCompany) {
    orConditions.push({ company: userCompany._id });
  }
  if (vehicleIds.length > 0) {
    orConditions.push({ vehicle: { $in: vehicleIds } });
  }

  const query = orConditions.length > 1 ? { $or: orConditions } : orConditions[0];
  return { query, userCompany };
};

// @route   GET api/rentals/vehicle/:id
// @desc    Get active booked date ranges for a vehicle (merges active rentals and live bookings)
router.get("/vehicle/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Invalid vehicle ID" });
    await autoExpireRentals(); // Check global overdue rentals
    const now = new Date();

    // 1. Active rentals from Rental collection
    const activeRentals = await Rental.find({
      vehicle: req.params.id,
      status: "active",
      returnDate: { $gte: now },
    }).select("pickupDate returnDate");

    // 2. Active bookings (confirmed, reviewing, or pending) from Booking collection
    const activeBookings = await Booking.find({
      $or: [{ vehicle: req.params.id }, { assignedVehicle: req.params.id }],
      status: { $in: ["confirmed", "pending", "reviewing"] },
      endDate: { $gte: now },
    }).select("startDate endDate status");

    const intervals = [];

    activeRentals.forEach((r) => {
      if (r.pickupDate && r.returnDate) {
        intervals.push({
          pickupDate: r.pickupDate,
          returnDate: r.returnDate,
          source: "rental",
        });
      }
    });

    activeBookings.forEach((b) => {
      if (b.startDate && b.endDate) {
        intervals.push({
          pickupDate: b.startDate,
          returnDate: b.endDate,
          source: "booking",
          status: b.status,
        });
      }
    });

    res.json(intervals);
  } catch (err) {
    console.error("Error fetching vehicle booked dates:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET api/rentals/my
// @desc    Get all rentals for vehicles owned by the logged-in user/company
router.get("/my", auth, async (req, res) => {
  try {
    const { query, userCompany } = await getHostRentalQuery(req.user.id);
    // Auto-expire any overdue rentals first (checking both user and company)
    await autoExpireRentals(req.user.id, false, userCompany?._id);

    const rentals = await Rental.find(query)
      .populate("vehicle", "brand model year pricePerDay images vehicleType location")
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    console.error("Error fetching rentals:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET api/rentals/stats
// @desc    Get rental stats for dashboard (revenue, counts, monthly breakdown)
router.get("/stats", auth, async (req, res) => {
  try {
    const { query, userCompany } = await getHostRentalQuery(req.user.id);
    // Auto-expire any overdue rentals first
    await autoExpireRentals(req.user.id, false, userCompany?._id);

    const rentals = await Rental.find(query);

    const now = new Date();
    const monthlyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const rev = rentals
        .filter((r) => {
          if (r.status === "cancelled") return false;
          const rd = new Date(r.createdAt);
          return rd >= d && rd <= monthEnd;
        })
        .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      monthlyRevenue.push({ month: monthNames[d.getMonth()], revenue: rev });
    }

    const activeRentals = rentals.filter((r) => r.status === "active").length;
    const completedRentals = rentals.filter((r) => r.status === "completed").length;
    const totalRevenue = rentals
      .filter((r) => r.status !== "cancelled" && !r.isBlocked)
      .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const activeRevenue = rentals
      .filter((r) => r.status === "active" && !r.isBlocked)
      .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const completedRevenue = rentals
      .filter((r) => r.status === "completed" && !r.isBlocked)
      .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);

    res.json({
      totalRevenue,
      activeRevenue,
      completedRevenue,
      activeRentals,
      completedRentals,
      totalRentals: rentals.length,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("Error fetching rental stats:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST api/rentals
// @desc    Record a new rental (mark vehicle as rented) — quick recording, no customer details required
router.post("/", auth, async (req, res) => {
  try {
    const {
      vehicleId,
      customerName,
      customerPhone,
      customerEmail,
      customerNIC,
      pickupDate,
      returnDate,
      dailyRate,
      extraKmCharge,
      notes,
      isBlocked,
      blockReason,
      rentalType,
    } = req.body;

    // Validate only essential fields — dates and rate
    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({ msg: "Vehicle, pickup date, and return date are required." });
    }

    // Verify vehicle belongs to user
    if (!isValidId(vehicleId)) return res.status(404).json({ msg: "Vehicle not found" });
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    let isOwner = vehicle.owner?.toString() === req.user.id;
    if (!isOwner && vehicle.company) {
      const company = await Company.findOne({ user: req.user.id }).select("_id");
      isOwner = Boolean(company && vehicle.company.toString() === company._id.toString());
    }
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized - vehicle doesn't belong to you" });
    }
    if (vehicle.status === "flagged") {
      return res.status(400).json({ msg: "Cannot create rental: vehicle has been flagged by an administrator." });
    }

    // Calculate total days and amount
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(returnD.getTime())) {
      return res.status(400).json({ msg: "Please enter valid pickup and return dates." });
    }
    if (returnD < pickup) {
      return res.status(400).json({ msg: "Return date must be on or after the pickup date." });
    }

    const pickupStart = new Date(pickup).setHours(0, 0, 0, 0);
    const returnEnd = new Date(returnD).setHours(23, 59, 59, 999);

    // Collision check 1: Active rentals or blocks overlapping the selected date range
    const overlappingRental = await Rental.findOne({
      vehicle: vehicleId,
      status: "active",
      pickupDate: { $lte: new Date(returnEnd) },
      returnDate: { $gte: new Date(pickupStart) },
    });
    if (overlappingRental) {
      const fromStr = overlappingRental.pickupDate ? new Date(overlappingRental.pickupDate).toISOString().split("T")[0] : "";
      const toStr = overlappingRental.returnDate ? new Date(overlappingRental.returnDate).toISOString().split("T")[0] : "";
      return res.status(400).json({
        msg: `Vehicle already has an active rental/block from ${fromStr} to ${toStr}. Please choose different dates.`,
      });
    }

    // Collision check 2: Active bookings overlapping the selected date range
    const overlappingBooking = await Booking.findOne({
      $or: [{ vehicle: vehicleId }, { assignedVehicle: vehicleId }],
      status: { $in: ["confirmed", "pending", "reviewing"] },
      startDate: { $lte: new Date(returnEnd) },
      endDate: { $gte: new Date(pickupStart) },
    });
    if (overlappingBooking) {
      const fromStr = overlappingBooking.startDate ? new Date(overlappingBooking.startDate).toISOString().split("T")[0] : "";
      const toStr = overlappingBooking.endDate ? new Date(overlappingBooking.endDate).toISOString().split("T")[0] : "";
      return res.status(400).json({
        msg: `Vehicle already has a booking from ${fromStr} to ${toStr}. Please choose different dates.`,
      });
    }

    const diffMs = Math.abs(new Date(returnD).setHours(0, 0, 0, 0) - new Date(pickup).setHours(0, 0, 0, 0));
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const isBlockingMode = Boolean(isBlocked || rentalType === "maintenance" || rentalType === "personal" || rentalType === "other");
    const rate = isBlockingMode ? (Number(dailyRate) || 0) : (Number(dailyRate) || vehicle.pricePerDay || 0);
    if (!isBlockingMode && !(rate > 0)) {
      return res.status(400).json({ msg: "Please enter a valid daily rate." });
    }
    const totalAmount = isBlockingMode ? 0 : (totalDays * rate + (Number(extraKmCharge) || 0));

    // Find company if exists
    let companyId = null;
    if (vehicle.company) {
      companyId = vehicle.company;
    } else {
      const company = await Company.findOne({ user: req.user.id });
      if (company) companyId = company._id;
    }

    const newRental = new Rental({
      vehicle: vehicleId,
      company: companyId,
      owner: req.user.id,
      customerName: isBlockingMode ? (customerName || (blockReason ? `Blocked: ${blockReason}` : "Maintenance / Servicing")) : (customerName || ""),
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
      customerNIC: customerNIC || "",
      pickupDate: pickup,
      returnDate: returnD,
      dailyRate: rate,
      totalDays,
      totalAmount,
      extraKmCharge: isBlockingMode ? 0 : (Number(extraKmCharge) || 0),
      notes: notes || (isBlockingMode ? (blockReason || "Dates blocked by host") : ""),
      status: "active",
      isBlocked: isBlockingMode,
      blockReason: blockReason || (isBlockingMode ? "Maintenance" : ""),
      rentalType: rentalType || (isBlockingMode ? "maintenance" : "rental"),
    });

    const rental = await newRental.save();

    // Date-aware vehicle status handling:
    // Only mark status as "rented" if the rental is currently ongoing today.
    // If it's for a future date range, the vehicle stays "active" so it remains discoverable in public listings.
    const now = new Date();
    const nowTime = now.getTime();
    const isCurrentlyOngoing = nowTime >= pickupStart && nowTime <= returnEnd;

    if (isCurrentlyOngoing && vehicle.status !== "flagged" && vehicle.status !== "rejected") {
      vehicle.status = "rented";
      await vehicle.save();
    }

    // Populate vehicle data before returning (including status)
    const populatedRental = await Rental.findById(rental._id).populate(
      "vehicle",
      "brand model year pricePerDay images vehicleType location status"
    );

    res.json(populatedRental);
  } catch (err) {
    console.error("Rental creation error:", err);
    res.status(500).json({ msg: "Server error while recording the rental" });
  }
});

// @route   PUT api/rentals/:id
// @desc    Update rental (e.g., mark as completed/returned)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Rental not found" });
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ msg: "Rental not found" });

    let isAuthorized = req.user.role === "admin" || rental.owner?.toString() === req.user.id;
    if (!isAuthorized && rental.company) {
      const userCompany = await Company.findOne({ user: req.user.id }).select("_id");
      if (userCompany && rental.company.toString() === userCompany._id.toString()) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const { status, extraKmCharge, notes } = req.body;

    if (status !== undefined && status !== rental.status) {
      if (!["completed", "cancelled"].includes(status) || rental.status !== "active") {
        return res.status(400).json({ msg: "Only an active rental can be marked returned or cancelled." });
      }
      rental.status = status;

      // The vehicle is free again if no other rental is currently ongoing today — don't undo a pause or admin flag
      const vehicle = await Vehicle.findById(rental.vehicle);
      if (vehicle && vehicle.status === "rented") {
        const now = new Date();
        const otherOngoingRental = await Rental.findOne({
          _id: { $ne: rental._id },
          vehicle: rental.vehicle,
          status: "active",
          pickupDate: { $lte: now },
          returnDate: { $gte: now },
        });
        if (!otherOngoingRental) {
          vehicle.status = "active";
          await vehicle.save();
        }
      }
    }
    if (extraKmCharge !== undefined) {
      const extra = Math.max(0, Number(extraKmCharge) || 0);
      rental.extraKmCharge = extra;
      rental.totalAmount = rental.totalDays * rental.dailyRate + extra;
    }
    if (notes !== undefined) rental.notes = notes;

    const updated = await rental.save();
    const populated = await Rental.findById(updated._id).populate(
      "vehicle",
      "brand model year pricePerDay images vehicleType location status"
    );
    res.json(populated);
  } catch (err) {
    console.error("Rental update error:", err);
    res.status(500).json({ msg: "Server error while updating the rental" });
  }
});

// @route   DELETE api/rentals/:id
// @desc    Delete a rental record
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Rental not found" });
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ msg: "Rental not found" });

    let isAuthorized = req.user.role === "admin" || rental.owner?.toString() === req.user.id;
    if (!isAuthorized && rental.company) {
      const userCompany = await Company.findOne({ user: req.user.id }).select("_id");
      if (userCompany && rental.company.toString() === userCompany._id.toString()) {
        isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // If was active, check if any other rental is currently ongoing today
    if (rental.status === "active") {
      const vehicle = await Vehicle.findById(rental.vehicle);
      if (vehicle && vehicle.status === "rented") {
        const now = new Date();
        const otherOngoingRental = await Rental.findOne({
          _id: { $ne: rental._id },
          vehicle: rental.vehicle,
          status: "active",
          pickupDate: { $lte: now },
          returnDate: { $gte: now },
        });
        if (!otherOngoingRental) {
          vehicle.status = "active";
          await vehicle.save();
        }
      }
    }

    await rental.deleteOne();
    res.json({ msg: "Rental record removed" });
  } catch (err) {
    console.error("Rental delete error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
