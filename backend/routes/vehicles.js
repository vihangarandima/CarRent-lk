const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Company = require("../models/Company");
const User = require("../models/User");
const Review = require("../models/Review");
const { auth, escapeRegex } = require("../middleware/auth");

const VEHICLE_TYPES = ["bicycle", "threewheeler", "mini-car", "car", "premium-car", "mini-van", "van", "others"];

// Listings the owner paused or an admin flagged are not shown publicly
const PUBLIC_STATUS_FILTER = { status: { $nin: ["hidden", "flagged"] } };

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const cleanImages = (images) =>
  Array.isArray(images)
    ? images.filter((img) => typeof img === "string" && img.trim() !== "").slice(0, 5)
    : [];

// @route   GET api/vehicles
// @desc    Get all vehicles with filters
router.get("/", async (req, res) => {
  try {
    const { brand, model, location, minPrice, maxPrice, companyId, vehicleType } = req.query;
    let query = { ...PUBLIC_STATUS_FILTER };
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
      .populate("owner", "name role")
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

    const newVehicle = new Vehicle({
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
    });
    const vehicle = await newVehicle.save();
    res.json({ ...vehicle.toObject(), listerRole: lister.role });
  } catch (err) {
    console.error("Listing Crash Error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: "Server error while saving the listing" });
  }
});

// @route   GET api/vehicles/:id
// @desc    Get a single vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Vehicle not found" });
    // Owner phone is public on purpose: customers contact hosts directly on WhatsApp
    const vehicle = await Vehicle.findById(req.params.id)
      .populate("owner", "name phone")
      .populate("company", "companyName logo phone contactEmail address");
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   PUT api/vehicles/:id
// @desc    Update a listing (only the lister who owns it)
router.put("/:id", auth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Vehicle not found" });
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found" });
    if (vehicle.owner.toString() !== req.user.id)
      return res.status(403).json({ msg: "Not authorized" });

    const editable = [
      "brand", "model", "year", "pricePerDay", "pricePerKmAfter100km", "fuelType",
      "transmission", "description", "location", "lat", "lng", "availableFrom", "availableTo",
    ];
    for (const key of editable) {
      if (req.body[key] !== undefined) vehicle[key] = req.body[key];
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

    // Owners can pause/resume a listing, but cannot clear an admin flag
    if (req.body.status !== undefined) {
      if (!["active", "hidden"].includes(req.body.status)) {
        return res.status(400).json({ msg: "Invalid status" });
      }
      if (vehicle.status === "flagged") {
        return res.status(403).json({ msg: "This listing was flagged by an admin. Please contact support." });
      }
      vehicle.status = req.body.status;
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
});

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

    if (vehicle.owner.toString() === req.user.id) {
      return res.status(400).json({ msg: "You cannot review your own vehicle" });
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
