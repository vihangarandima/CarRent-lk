const express = require("express");
const router = express.Router();
const Rental = require("../models/Rental");
const Vehicle = require("../models/Vehicle");
const Company = require("../models/Company");
const mongoose = require("mongoose");
const { auth } = require("../middleware/auth");
const { autoExpireRentals } = require("../utils/rentalExpiry");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   GET api/rentals/vehicle/:id
// @desc    Get active booked date ranges for a vehicle (public)
router.get("/vehicle/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Invalid vehicle ID" });
    await autoExpireRentals(); // Check global overdue rentals
    const now = new Date();
    // Read-only: overdue rentals are expired by the background job in server.js, which also
    // puts the vehicle back to "active". Only upcoming/current bookings are returned here.
    const activeRentals = await Rental.find({
      vehicle: req.params.id,
      status: "active",
      returnDate: { $gte: now },
    }).select("pickupDate returnDate");
    res.json(activeRentals);
  } catch (err) {
    console.error("Error fetching vehicle booked dates:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET api/rentals/my
// @desc    Get all rentals for vehicles owned by the logged-in user/company
router.get("/my", auth, async (req, res) => {
  try {
    // Auto-expire any overdue rentals first
    await autoExpireRentals(req.user.id);

    const rentals = await Rental.find({ owner: req.user.id })
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
    // Auto-expire any overdue rentals first
    await autoExpireRentals(req.user.id);

    const rentals = await Rental.find({ owner: req.user.id });

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
      .filter((r) => r.status !== "cancelled")
      .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const activeRevenue = rentals
      .filter((r) => r.status === "active")
      .reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
    const completedRevenue = rentals
      .filter((r) => r.status === "completed")
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
    } = req.body;

    // Validate only essential fields — dates and rate
    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({ msg: "Vehicle, pickup date, and return date are required." });
    }

    // Verify vehicle belongs to user
    if (!isValidId(vehicleId)) return res.status(404).json({ msg: "Vehicle not found" });
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    if (vehicle.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized - vehicle doesn't belong to you" });
    }
    if (vehicle.status === "rented") {
      return res.status(400).json({ msg: "This vehicle is already rented. Mark that rental as returned first." });
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
    const diffMs = returnD - pickup;
    const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const rate = Number(dailyRate) || vehicle.pricePerDay || 0;
    if (!(rate > 0)) {
      return res.status(400).json({ msg: "Please enter a valid daily rate." });
    }
    const totalAmount = totalDays * rate + (Number(extraKmCharge) || 0);

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
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
      customerNIC: customerNIC || "",
      pickupDate: pickup,
      returnDate: returnD,
      dailyRate: rate,
      totalDays,
      totalAmount,
      extraKmCharge: Number(extraKmCharge) || 0,
      notes: notes || "",
      status: "active",
    });

    const rental = await newRental.save();

    // Mark the vehicle as "rented" (hides it from public listings) unless an admin flagged it
    if (vehicle.status !== "flagged") {
      vehicle.status = "rented";
      await vehicle.save();
    }

    // Populate vehicle data before returning
    const populatedRental = await Rental.findById(rental._id).populate(
      "vehicle",
      "brand model year pricePerDay images vehicleType location"
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
    if (rental.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const { status, extraKmCharge, notes } = req.body;

    if (status !== undefined && status !== rental.status) {
      if (!["completed", "cancelled"].includes(status) || rental.status !== "active") {
        return res.status(400).json({ msg: "Only an active rental can be marked returned or cancelled." });
      }
      rental.status = status;

      // The vehicle is free again — but don't undo a pause or an admin flag
      const vehicle = await Vehicle.findById(rental.vehicle);
      if (vehicle && vehicle.status === "rented") {
        vehicle.status = "active";
        await vehicle.save();
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
      "brand model year pricePerDay images vehicleType location"
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
    if (rental.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // If was active, set vehicle back to active
    if (rental.status === "active") {
      const vehicle = await Vehicle.findById(rental.vehicle);
      if (vehicle && vehicle.status === "rented") {
        vehicle.status = "active";
        await vehicle.save();
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
