const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Rental = require("../models/Rental");
const User = require("../models/User");
const Company = require("../models/Company");
const { auth, optionalAuth } = require("../middleware/auth");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Helper to check distance in KM using Haversine formula
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Middleware: Strictly Require Admin Authentication for Concierge Dispatch
 */
const verifyDispatchAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(404).json({ msg: "Invalid booking ID" });

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ msg: "Booking record not found" });

    // Enforce Admin Authentication
    const jwtToken =
      req.header("x-auth-token") || req.header("Authorization")?.replace("Bearer ", "");

    if (!jwtToken) {
      return res.status(401).json({
        msg: "Admin login required. Please sign in with your administrator account to access this dispatch portal.",
        authRequired: true,
      });
    }

    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("role name email");

      if (!user || user.role !== "admin") {
        return res.status(403).json({
          msg: "Access denied. Only authorized Yamu administrators can access the concierge dispatch portal.",
          adminRequired: true,
        });
      }

      req.booking = booking;
      req.user = user;
      req.isAdminAuth = true;
      return next();
    } catch (tokenErr) {
      return res.status(401).json({
        msg: "Session expired or invalid. Please log in with your administrator account.",
        authRequired: true,
      });
    }
  } catch (err) {
    console.error("Error in verifyDispatchAccess:", err);
    res.status(500).json({ msg: "Server authorization error" });
  }
};

// @route   POST /api/bookings
// @desc    Customer initiates a booking via WhatsApp on Vehicle Details page
router.post("/", optionalAuth, async (req, res) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      customerName,
      customerPhone,
      customerEmail,
      customerNIC,
      rentMode,
      clientBaseUrl,
    } = req.body;

    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ msg: "Vehicle and booking dates are required." });
    }
    if (!isValidId(vehicleId)) return res.status(404).json({ msg: "Vehicle not found." });

    const vehicle = await Vehicle.findById(vehicleId)
      .populate("owner", "name phone email")
      .populate("company", "companyName phone contactEmail logo");

    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found." });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ msg: "Invalid booking dates provided." });
    }
    if (end < start) {
      return res.status(400).json({ msg: "Return date must be on or after pickup date." });
    }

    const diffMs = Math.abs(new Date(end).setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0));
    const totalDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    if (vehicle.minRentalDays && totalDays < vehicle.minRentalDays) {
      return res.status(400).json({
        msg: `This vehicle requires a minimum rental period of ${vehicle.minRentalDays} day(s).`,
      });
    }

    // Determine customer info
    const resolvedCustomerName = customerName || (req.user ? req.user.name : "Guest Customer");
    const resolvedCustomerPhone = customerPhone || (req.user ? req.user.phone : "");

    const dailyRate = vehicle.pricePerDay || 0;
    const totalPrice = totalDays * dailyRate;

    const bookingNumber = Booking.generateBookingNumber();
    const dispatchToken = Booking.generateDispatchToken();
    const dispatchTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const newBooking = new Booking({
      bookingNumber,
      vehicle: vehicle._id,
      originalVehicle: vehicle._id,
      assignedVehicle: vehicle._id,
      host: vehicle.owner?._id || vehicle.owner,
      company: vehicle.company?._id || vehicle.company || null,
      customer: req.user ? req.user.id : null,
      customerName: resolvedCustomerName,
      customerPhone: resolvedCustomerPhone,
      customerEmail: customerEmail || (req.user ? req.user.email : ""),
      customerNIC: customerNIC || "",
      startDate: start,
      endDate: end,
      totalDays,
      dailyRate,
      totalPrice,
      rentMode: rentMode || vehicle.rentMode || "self-drive",
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          changedAt: new Date(),
          changedBy: "Customer",
          note: "Customer submitted booking request via WhatsApp",
        },
      ],
      dispatchToken,
      dispatchTokenExpires,
    });

    const savedBooking = await newBooking.save();

    // Generate dispatch URL
    const baseUrl = clientBaseUrl || process.env.CLIENT_URL || "http://localhost:5173";
    const cleanBaseUrl = baseUrl.split(",")[0].trim().replace(/\/$/, "");
    const dispatchUrl = `${cleanBaseUrl}/dispatch/${savedBooking._id}?token=${dispatchToken}`;

    // Construct pre-formatted WhatsApp message
    const dateRangeStr = `${start.toLocaleDateString("en-GB")} to ${end.toLocaleDateString("en-GB")}`;
    const rentModeStr = rentMode === "with-driver" ? "With Driver" : "Self-Drive";

    const customerDisplay = resolvedCustomerPhone ? `${resolvedCustomerName} (${resolvedCustomerPhone})` : resolvedCustomerName;
    const whatsappMessage = 
      `\u{1F697} *New Booking Request - Yamu Car Rentals*\n` +
      `\u2022 *Ref:* ${bookingNumber}\n` +
      `\u2022 *Vehicle:* ${vehicle.brand} ${vehicle.model} (${vehicle.year})\n` +
      `\u2022 *Dates:* ${dateRangeStr} (${totalDays} day${totalDays > 1 ? "s" : ""})\n` +
      `\u2022 *Mode:* ${rentModeStr}\n` +
      `\u2022 *Customer:* ${customerDisplay}\n` +
      `\u2022 *Est. Total:* Rs. ${totalPrice.toLocaleString()}\n\n` +
      `\u{1F511} *Admin Concierge Dispatch Portal:*\n` +
      `${dispatchUrl}`;

    res.status(201).json({
      success: true,
      booking: savedBooking,
      dispatchToken,
      dispatchUrl,
      whatsappMessage,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ msg: "Server error while creating booking: " + err.message });
  }
});

// @route   GET /api/bookings/dispatch/:id
// @desc    Admin opens dispatch link from WhatsApp: persists progress, auto-updates to "reviewing"
router.get("/dispatch/:id", verifyDispatchAccess, async (req, res) => {
  try {
    const booking = req.booking;

    // Persist progress: If this is the first time admin visits the pending booking, transition to "reviewing"
    if (booking.status === "pending") {
      booking.status = "reviewing";
      booking.statusHistory.push({
        status: "reviewing",
        changedAt: new Date(),
        changedBy: "Admin Concierge",
        note: "Admin opened dispatch link to review host availability",
      });
      await booking.save();
    }

    const populated = await Booking.findById(booking._id)
      .populate("vehicle")
      .populate("originalVehicle")
      .populate("assignedVehicle")
      .populate("host", "name phone email createdAt")
      .populate("company", "companyName phone contactEmail logo address")
      .populate("customer", "name phone email");

    res.json({
      success: true,
      booking: populated,
    });
  } catch (err) {
    console.error("Error fetching dispatch booking:", err);
    res.status(500).json({ msg: "Server error fetching booking details" });
  }
});

// @route   PATCH /api/bookings/dispatch/:id/status
// @desc    Admin updates status (reviewing, finding_alternative, confirmed, cancelled) & checklist
router.patch("/dispatch/:id/status", verifyDispatchAccess, async (req, res) => {
  try {
    const booking = req.booking;
    const {
      status,
      hostContacted,
      hostAvailabilityStatus,
      adminNotes,
      assignedVehicleId,
      cancellationReason,
    } = req.body;

    if (hostContacted !== undefined) {
      booking.hostContacted = Boolean(hostContacted);
      if (hostContacted && !booking.hostContactedAt) {
        booking.hostContactedAt = new Date();
      }
    }

    if (hostAvailabilityStatus) {
      booking.hostAvailabilityStatus = hostAvailabilityStatus;
    }

    if (adminNotes !== undefined) {
      booking.adminNotes = adminNotes;
    }

    // Switch or assign an alternative vehicle
    if (assignedVehicleId && isValidId(assignedVehicleId)) {
      const newVeh = await Vehicle.findById(assignedVehicleId);
      if (newVeh) {
        booking.assignedVehicle = newVeh._id;
        booking.dailyRate = newVeh.pricePerDay;
        booking.totalPrice = booking.totalDays * newVeh.pricePerDay;
        // Also update host/company if car belongs to someone else
        booking.host = newVeh.owner;
        booking.company = newVeh.company || null;
      }
    }

    if (status && status !== booking.status) {
      const validStatuses = ["pending", "reviewing", "finding_alternative", "confirmed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ msg: "Invalid status transition" });
      }

      booking.status = status;
      booking.statusHistory.push({
        status,
        changedAt: new Date(),
        changedBy: "Admin Concierge",
        note: req.body.note || `Status updated to ${status}`,
      });

      if (status === "cancelled") {
        booking.cancelledBy = "admin";
        booking.cancellationReason = cancellationReason || "Admin cancelled booking";
      }

      // If CONFIRMED, create or activate a Rental document in the database
      if (status === "confirmed") {
        const vehicleToRent = await Vehicle.findById(booking.assignedVehicle || booking.vehicle);
        if (vehicleToRent) {
          const rental = new Rental({
            vehicle: vehicleToRent._id,
            company: vehicleToRent.company || null,
            owner: vehicleToRent.owner,
            customerName: booking.customerName,
            customerPhone: booking.customerPhone,
            customerEmail: booking.customerEmail || "",
            customerNIC: booking.customerNIC || "",
            pickupDate: booking.startDate,
            returnDate: booking.endDate,
            dailyRate: booking.dailyRate,
            totalDays: booking.totalDays,
            totalAmount: booking.totalPrice,
            status: "active",
            notes: `Confirmed via Yamu Concierge Booking #${booking.bookingNumber}`,
          });
          const savedRental = await rental.save();
          booking.confirmedRental = savedRental._id;

          // Mark vehicle rented if active
          if (vehicleToRent.status === "active") {
            vehicleToRent.status = "rented";
            await vehicleToRent.save();
          }
        }
      }
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("vehicle")
      .populate("originalVehicle")
      .populate("assignedVehicle")
      .populate("host", "name phone email")
      .populate("company", "companyName phone contactEmail logo")
      .populate("customer", "name phone email");

    res.json({
      success: true,
      msg: "Booking progress saved successfully",
      booking: populated,
    });
  } catch (err) {
    console.error("Error updating dispatch status:", err);
    res.status(500).json({ msg: "Server error updating status: " + err.message });
  }
});

// @route   GET /api/bookings/dispatch/:id/alternatives
// @desc    Intelligent alternative vehicle finder (Same host, same model <=15km, similar cars)
router.get("/dispatch/:id/alternatives", verifyDispatchAccess, async (req, res) => {
  try {
    const booking = await Booking.findById(req.booking._id).populate("vehicle");
    const currentVeh = booking.vehicle;
    if (!currentVeh) return res.status(404).json({ msg: "Vehicle not found" });

    // Exclude vehicles booked for these dates
    const conflictingRentals = await Rental.find({
      status: "active",
      pickupDate: { $lt: booking.endDate },
      returnDate: { $gt: booking.startDate },
    }).select("vehicle");
    const bookedVehIds = conflictingRentals.map((r) => r.vehicle.toString());
    bookedVehIds.push(currentVeh._id.toString());

    // 1. Same Host/Company vehicles
    const sameHostQuery = {
      _id: { $nin: bookedVehIds },
      status: "active",
    };
    if (currentVeh.company) {
      sameHostQuery.company = currentVeh.company;
    } else {
      sameHostQuery.owner = currentVeh.owner;
    }
    const sameHostVehicles = await Vehicle.find(sameHostQuery)
      .populate("company", "companyName logo phone")
      .populate("owner", "name phone")
      .limit(8);

    // 2. Same Model Nearby (within 15km if coords available, or same city/location)
    const sameModelQuery = {
      _id: { $nin: bookedVehIds },
      status: "active",
      model: new RegExp(`^${currentVeh.model}$`, "i"),
    };
    const sameModelCandidates = await Vehicle.find(sameModelQuery)
      .populate("company", "companyName logo phone")
      .populate("owner", "name phone")
      .limit(20);

    const sameModelNearby = sameModelCandidates
      .map((v) => {
        const distKm = getDistanceKm(currentVeh.lat, currentVeh.lng, v.lat, v.lng);
        const isSameLocation =
          v.location && currentVeh.location &&
          v.location.toLowerCase().includes(currentVeh.location.toLowerCase());
        return {
          ...v.toObject(),
          distanceKm: distKm !== null ? distKm : isSameLocation ? 3 : null,
          isWithin15Km: distKm !== null ? distKm <= 15 : isSameLocation,
        };
      })
      .filter((v) => v.isWithin15Km)
      .slice(0, 10);

    // 3. Similar Vehicles (Same seats, +/- 1000 daily rate, same vehicleType)
    const minPrice = Math.max(0, currentVeh.pricePerDay - 1000);
    const maxPrice = currentVeh.pricePerDay + 1000;
    const similarQuery = {
      _id: { $nin: bookedVehIds },
      status: "active",
      vehicleType: currentVeh.vehicleType,
      pricePerDay: { $gte: minPrice, $lte: maxPrice },
    };
    if (currentVeh.seats) {
      similarQuery.seats = currentVeh.seats;
    }
    const similarVehicles = await Vehicle.find(similarQuery)
      .populate("company", "companyName logo phone")
      .populate("owner", "name phone")
      .limit(10);

    res.json({
      success: true,
      alternatives: {
        sameHostVehicles,
        sameModelNearby,
        similarVehicles,
      },
    });
  } catch (err) {
    console.error("Error finding alternatives:", err);
    res.status(500).json({ msg: "Server error searching alternative vehicles" });
  }
});

// @route   POST /api/bookings/dispatch/:id/quick-add-vehicle
// @desc    Admin quick-lists an unlisted vehicle for the same host & optionally assigns it
router.post("/dispatch/:id/quick-add-vehicle", verifyDispatchAccess, async (req, res) => {
  try {
    const booking = req.booking;
    const currentVeh = await Vehicle.findById(booking.vehicle);

    const {
      brand,
      model,
      year,
      vehicleType,
      pricePerDay,
      transmission,
      seats,
      images,
      rentMode,
      autoAssign,
    } = req.body;

    if (!brand || !model || !pricePerDay) {
      return res.status(400).json({ msg: "Brand, model, and daily price are required." });
    }

    const newVehicle = new Vehicle({
      owner: booking.host,
      company: booking.company || null,
      brand,
      model,
      year: Number(year) || new Date().getFullYear(),
      vehicleType: vehicleType || currentVeh?.vehicleType || "car",
      pricePerDay: Number(pricePerDay),
      transmission: transmission || currentVeh?.transmission || "Automatic",
      seats: Number(seats) || currentVeh?.seats || 5,
      location: currentVeh?.location || "Colombo",
      lat: currentVeh?.lat || null,
      lng: currentVeh?.lng || null,
      images: Array.isArray(images) && images.length > 0 ? images : currentVeh?.images || [],
      rentMode: rentMode || currentVeh?.rentMode || "self-drive",
      status: "active",
      availableFrom: new Date(),
      availableTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    const savedVehicle = await newVehicle.save();

    if (autoAssign) {
      booking.assignedVehicle = savedVehicle._id;
      booking.dailyRate = savedVehicle.pricePerDay;
      booking.totalPrice = booking.totalDays * savedVehicle.pricePerDay;
      booking.statusHistory.push({
        status: booking.status,
        changedAt: new Date(),
        changedBy: "Admin Concierge",
        note: `Quick-added and assigned new vehicle (${brand} ${model}) for host`,
      });
      await booking.save();
    }

    res.status(201).json({
      success: true,
      vehicle: savedVehicle,
      booking,
    });
  } catch (err) {
    console.error("Error quick-adding vehicle:", err);
    res.status(500).json({ msg: "Server error quick-adding vehicle: " + err.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Customer fetches their booking history for Profile.jsx
router.get("/my", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const query = {
      $or: [{ customer: req.user.id }],
    };
    if (user && user.phone) {
      query.$or.push({ customerPhone: user.phone });
    }

    const bookings = await Booking.find(query)
      .populate("vehicle", "brand model year vehicleType pricePerDay images location")
      .populate("assignedVehicle", "brand model year vehicleType pricePerDay images location")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching customer bookings:", err);
    res.status(500).json({ msg: "Server error fetching your bookings" });
  }
});

// @route   PATCH /api/bookings/:id/cancel
// @desc    Customer or Admin cancels a booking
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Invalid booking ID" });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const isCustomer = booking.customer?.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({ msg: "Not authorized to cancel this booking" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ msg: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    booking.cancelledBy = isAdmin ? "admin" : "customer";
    booking.cancellationReason = req.body.reason || (isAdmin ? "Cancelled by Admin" : "Cancelled by Customer");
    booking.statusHistory.push({
      status: "cancelled",
      changedAt: new Date(),
      changedBy: isAdmin ? "Admin" : "Customer",
      note: booking.cancellationReason,
    });

    // If a confirmed rental was tied to it, cancel the rental too
    if (booking.confirmedRental) {
      const rental = await Rental.findById(booking.confirmedRental);
      if (rental) {
        rental.status = "cancelled";
        await rental.save();
        const vehicle = await Vehicle.findById(rental.vehicle);
        if (vehicle && vehicle.status === "rented") {
          vehicle.status = "active";
          await vehicle.save();
        }
      }
    }

    await booking.save();
    res.json({ msg: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ msg: "Server error cancelling booking" });
  }
});

// @route   GET /api/bookings/admin/all
// @desc    Admin fetches all platform bookings for Admin Panel
router.get("/admin/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin access required" });

    const { status } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    const bookings = await Booking.find(query)
      .populate("vehicle", "brand model year vehicleType pricePerDay images location")
      .populate("assignedVehicle", "brand model year vehicleType pricePerDay images location")
      .populate("host", "name phone email")
      .populate("company", "companyName logo phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ msg: "Server error fetching bookings" });
  }
});

module.exports = router;
