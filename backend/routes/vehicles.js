const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Company = require("../models/Company");
const User = require("../models/User");
const Review = require("../models/Review");
const { auth, escapeRegex } = require("../middleware/auth");
const { autoExpireRentals } = require("../utils/rentalExpiry");

const VEHICLE_TYPES = ["bicycle", "threewheeler", "mini-car", "car", "premium-car", "mini-van", "van", "others"];

// Only active, approved listings are shown to public browsing customers
const PUBLIC_STATUS_FILTER = { status: "active" };

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Optional listing details shared by single and bulk create
const listingExtras = (src = {}) => {
  const out = {};
  if (["self-drive", "with-driver", "both"].includes(src.rentMode)) out.rentMode = src.rentMode;
  const seats = Number(src.seats);
  if (seats >= 1 && seats <= 60) out.seats = Math.round(seats);
  if (src.kmPerDay !== undefined && src.kmPerDay !== "" && Number(src.kmPerDay) >= 0) out.kmPerDay = Number(src.kmPerDay);
  const minDays = Number(src.minRentalDays);
  if (minDays >= 1 && minDays <= 60) out.minRentalDays = Math.round(minDays);
  return out;
};


const cleanImages = (images) =>
  Array.isArray(images)
    ? images.filter((img) => typeof img === "string" && img.trim() !== "").slice(0, 5)
    : [];

// @route   GET api/vehicles
// @desc    Get all vehicles with filters (only active public listings by default)
router.get("/", async (req, res) => {
  try {
    await autoExpireRentals(); // Refresh overdue rentals into active inventory
    const { brand, model, location, minPrice, maxPrice, companyId, vehicleType, mode } = req.query;
    // Only approved, live listings are public — the query string can't widen this
    let query = { status: "active" };
    // "self-drive" also matches vehicles offered both ways (and older listings without a mode)
    if (mode === "self-drive") query.rentMode = { $in: ["self-drive", "both", null] };
    else if (mode === "with-driver") query.rentMode = { $in: ["with-driver", "both"] };
    if (brand) query.brand = new RegExp(escapeRegex(brand), "i");
    if (model) query.model = new RegExp(escapeRegex(model), "i");
    if (location) query.location = new RegExp(escapeRegex(location), "i");
    if (vehicleType) query.vehicleType = String(vehicleType);
    if (companyId && isValidId(companyId)) query.company = companyId;
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      const parsedMin = parseInt(minPrice, 10);
      const parsedMax = parseInt(maxPrice, 10);
      if (!isNaN(parsedMin)) query.pricePerDay.$gte = parsedMin;
      if (!isNaN(parsedMax)) query.pricePerDay.$lte = parsedMax;
      if (Object.keys(query.pricePerDay).length === 0) delete query.pricePerDay;
    }

    const vehicles = await Vehicle.find(query)
      .populate("owner", "name role phone")
      .populate("company", "companyName logo address phone contactEmail isVerified")
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();
    res.json(vehicles);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET api/vehicles/my
// @desc    Get all vehicles listed by the logged-in user (owner or company)
router.get("/my", auth, async (req, res) => {
  try {
    await autoExpireRentals(req.user.id); // Refresh host vehicles
    const vehicles = await Vehicle.find({ owner: req.user.id })
      .populate("company", "companyName logo phone address isVerified")
      .sort({ createdAt: -1 });

    // Attach review stats per vehicle so the dashboard can show real numbers
    const ids = vehicles.map((v) => v._id);
    const stats = await Review.aggregate([
      { $match: { vehicle: { $in: ids } } },
      { $group: { _id: "$vehicle", count: { $sum: 1 }, avg: { $avg: "$rating" } } },
    ]);
    const statsById = Object.fromEntries(stats.map((s) => [s._id.toString(), s]));

    res.json(
      vehicles.map((v) => {
        const s = statsById[v._id.toString()];
        return {
          ...v.toObject(),
          reviewCount: s ? s.count : 0,
          rating: s ? Number(s.avg.toFixed(1)) : 0,
        };
      })
    );
  } catch (err) {
    console.error("Error fetching user vehicles:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST api/vehicles
// @desc    List a new vehicle (Owner or Company)
router.post("/", auth, async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      pricePerDay,
      pricePerKmAfter100km,
      vehicleType,
      fuelType,
      transmission,
      description,
      location,
      lat,
      lng,
      images,
      availableFrom,
      availableTo,
    } = req.body;

    if (!vehicleType || !VEHICLE_TYPES.includes(vehicleType)) {
      return res.status(400).json({ msg: "Valid vehicle type is required." });
    }
    if (!brand || !model || !location) {
      return res.status(400).json({ msg: "Brand, model and location are required." });
    }
    const price = Number(pricePerDay);
    if (!price || price <= 0) {
      return res.status(400).json({ msg: "Please enter a valid daily price." });
    }

    // Validation for images: At least 1 valid image required (up to 5)
    const validImages = cleanImages(images);
    if (validImages.length === 0) {
      return res.status(400).json({ msg: "Please upload at least 1 image of the vehicle." });
    }

    const lister = await User.findById(req.user.id).select("role");
    if (!lister) return res.status(401).json({ msg: "Account not found. Please sign in again." });

    // A renter who lists a car becomes an owner (host)
    if (lister.role === "renter") {
      lister.role = "owner";
      await lister.save();
    }

    // Auto-attach company if the lister is a company account
    let companyId = null;
    if (lister.role === "company") {
      const company = await Company.findOne({ user: req.user.id });
      if (company) companyId = company._id;
    }

    const isListerAdmin = lister.role === "admin";
    const newVehicle = new Vehicle({
      ...listingExtras(req.body),
      owner: req.user.id,
      brand,
      model,
      year,
      pricePerDay: price,
      pricePerKmAfter100km: Number(pricePerKmAfter100km) || 0,
      vehicleType,
      fuelType,
      transmission,
      description,
      location,
      lat: lat || null,
      lng: lng || null,
      images: validImages,
      availableFrom,
      availableTo,
      company: companyId,
      status: isListerAdmin ? "active" : "pending",
      approvedAt: isListerAdmin ? new Date() : undefined,
    });
    const vehicle = await newVehicle.save();
    res.json({
      ...vehicle.toObject(),
      listerRole: lister.role,
      requiresApproval: !isListerAdmin,
      msg: isListerAdmin
        ? "Vehicle published live."
        : "Vehicle submitted successfully! It is now pending review by Super Admin.",
    });
  } catch (err) {
    console.error("Listing Crash Error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: "Server error while saving the listing" });
  }
});

// @route   POST api/vehicles/bulk
// @desc    Quick-add several vehicles in one go (fleet companies). Each row is validated on
//          its own, so one bad row doesn't block the rest. Photos are optional here and can
//          be added later from the dashboard.
const MAX_BULK = 50;
router.post("/bulk", auth, async (req, res) => {
  try {
    const rows = Array.isArray(req.body.vehicles) ? req.body.vehicles : [];
    if (rows.length === 0) return res.status(400).json({ msg: "Add at least one vehicle." });
    if (rows.length > MAX_BULK) {
      return res.status(400).json({ msg: `You can add up to ${MAX_BULK} vehicles at a time.` });
    }

    const lister = await User.findById(req.user.id).select("role");
    if (!lister) return res.status(401).json({ msg: "Account not found. Please sign in again." });
    if (lister.role === "renter") {
      lister.role = "owner";
      await lister.save();
    }
    let companyId = null;
    if (lister.role === "company") {
      const company = await Company.findOne({ user: req.user.id }).select("_id");
      if (company) companyId = company._id;
    }

    const now = new Date();
    const oneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const isListerAdmin = lister.role === "admin";
    const results = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || {};
      const brand = String(row.brand || "").trim();
      const model = String(row.model || "").trim();
      const location = String(row.location || "").trim();
      const price = Number(row.pricePerDay);
      const year = Number(row.year);

      let error = null;
      if (!VEHICLE_TYPES.includes(row.vehicleType)) error = "Choose a vehicle type";
      else if (!brand || !model) error = "Brand and model are required";
      else if (!(price > 0)) error = "Enter a daily price";
      else if (!(year >= 1950 && year <= now.getFullYear() + 1)) error = "Enter a valid year";
      else if (!location) error = "Location is required";
      if (error) {
        results.push({ index: i, ok: false, msg: error });
        continue;
      }

      try {
        const vehicle = await new Vehicle({
          ...listingExtras(row),
          owner: req.user.id,
          company: companyId,
          brand,
          model,
          year,
          pricePerDay: price,
          pricePerKmAfter100km: Number(row.pricePerKmAfter100km) || 0,
          vehicleType: row.vehicleType,
          fuelType: row.fuelType || undefined,
          transmission: row.transmission || undefined,
          location,
          images: cleanImages(row.images),
          availableFrom: now,
          availableTo: oneYear,
          status: isListerAdmin ? "active" : "pending",
          approvedAt: isListerAdmin ? new Date() : undefined,
        }).save();
        results.push({ index: i, ok: true, vehicle });
      } catch (rowErr) {
        results.push({ index: i, ok: false, msg: rowErr.name === "ValidationError" ? rowErr.message : "Could not save this row" });
      }
    }

    const saved = results.filter((r) => r.ok).length;
    res.status(saved > 0 ? 200 : 400).json({ saved, failed: results.length - saved, results, listerRole: lister.role });
  } catch (err) {
    console.error("Bulk listing error:", err);
    res.status(500).json({ msg: "Server error while saving vehicles" });
  }
});

// @route   GET api/vehicles/:id
// @desc    Get a single vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Vehicle not found" });
    await autoExpireRentals(); // Refresh vehicle status if rental period passed
    // Owner phone is public on purpose: customers contact hosts directly on WhatsApp
    const vehicle = await Vehicle.findById(req.params.id)
      .populate("owner", "name phone createdAt")
      .populate("company", "companyName logo phone contactEmail address createdAt");
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   PUT / PATCH api/vehicles/:id  (and PATCH api/vehicles/:id/availability)
// @desc    Update a listing: its owner, the company it belongs to, or an admin
const handleVehicleUpdate = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Vehicle not found" });
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });

    const user = await User.findById(req.user.id).select("role");
    const isAdmin = user?.role === "admin";
    let isAuthorized = isAdmin || vehicle.owner.toString() === req.user.id;
    if (!isAuthorized && vehicle.company) {
      const company = await Company.findOne({ user: req.user.id }).select("_id");
      isAuthorized = Boolean(company && vehicle.company.toString() === company._id.toString());
    }
    if (!isAuthorized) return res.status(403).json({ msg: "Not authorized" });

    const editable = [
      "brand", "model", "year", "pricePerDay", "pricePerKmAfter100km", "fuelType",
      "transmission", "description", "location", "lat", "lng", "availableFrom", "availableTo",
      "rentMode", "seats", "kmPerDay", "minRentalDays",
    ];
    for (const key of editable) {
      if (req.body[key] !== undefined && req.body[key] !== "") vehicle[key] = req.body[key];
    }

    if (req.body.vehicleType !== undefined) {
      if (!VEHICLE_TYPES.includes(req.body.vehicleType)) {
        return res.status(400).json({ msg: "Valid vehicle type is required." });
      }
      vehicle.vehicleType = req.body.vehicleType;
    }

    if (req.body.images !== undefined) {
      const validImages = cleanImages(req.body.images);
      if (validImages.length === 0) {
        return res.status(400).json({ msg: "A listing needs at least 1 photo." });
      }
      vehicle.images = validImages;
    }

    // Status: listers may pause/resume. "rented" is managed by the rentals flow,
    // and only an admin can clear a "flagged" listing.
    const nextStatus = req.body.status;
    if (nextStatus !== undefined && nextStatus !== vehicle.status) {
      if (isAdmin) {
        vehicle.status = nextStatus;
      } else if (!["active", "hidden"].includes(nextStatus)) {
        return res.status(400).json({ msg: "Invalid status" });
      } else if (vehicle.status === "pending" || vehicle.status === "rejected") {
        // Owners can't approve their own listing
        return res.status(403).json({ msg: "This listing is waiting for admin approval." });
      } else if (vehicle.status === "flagged") {
        return res.status(403).json({ msg: "This listing was flagged by an admin. Please contact support." });
      } else if (vehicle.status === "rented") {
        return res.status(400).json({ msg: "This vehicle is currently rented. Mark the rental as returned first." });
      } else {
        vehicle.status = nextStatus;
      }
    }

    if (!(Number(vehicle.pricePerDay) > 0)) {
      return res.status(400).json({ msg: "Please enter a valid daily price." });
    }

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error("Error updating vehicle:", err);
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: "Server error while updating the listing" });
  }
};

router.put("/:id", auth, handleVehicleUpdate);
router.patch("/:id", auth, handleVehicleUpdate);
router.patch("/:id/availability", auth, handleVehicleUpdate);

// @route   DELETE api/vehicles/:id
// @desc    Delete a vehicle (owner/company must own it)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Vehicle not found" });
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    if (vehicle.owner.toString() !== req.user.id)
      return res.status(403).json({ msg: "Not authorized" });
    await vehicle.deleteOne();
    res.json({ msg: "Vehicle removed" });
  } catch (err) {
    console.error("Error deleting vehicle:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST api/vehicles/:id/reviews
// @desc    Add a review for a vehicle
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ msg: "Rating and comment are required" });
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Vehicle not found" });
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });

    if (vehicle.owner && vehicle.owner.toString() === req.user.id) {
      return res.status(400).json({ msg: "You cannot review your own vehicle" });
    }
    if (vehicle.company) {
      const userCompany = await Company.findOne({ user: req.user.id }).select("_id");
      if (userCompany && vehicle.company.toString() === userCompany._id.toString()) {
        return res.status(400).json({ msg: "You cannot review a vehicle listed by your company" });
      }
    }

    // Ensure the user hasn't already reviewed this vehicle
    const existingReview = await Review.findOne({ vehicle: req.params.id, user: req.user.id });
    if (existingReview) {
      return res.status(400).json({ msg: "You have already reviewed this vehicle" });
    }

    const newReview = new Review({
      vehicle: req.params.id,
      user: req.user.id,
      rating: numRating,
      comment
    });

    const review = await newReview.save();
    res.json(review);
  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET api/vehicles/:id/reviews
// @desc    Get all reviews for a vehicle
router.get("/:id/reviews", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.json([]);
    const reviews = await Review.find({ vehicle: req.params.id }).populate("user", "name").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
