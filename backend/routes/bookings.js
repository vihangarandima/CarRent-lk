const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Rental = require("../models/Rental");
const User = require("../models/User");
const Company = require("../models/Company");
const { auth } = require("../middleware/auth");

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

    const booking = await Booking.findById(id).select("+dispatchToken +dispatchTokenExpires");
    if (!booking) return res.status(404).json({ msg: "Booking record not found" });

    // 1. Allow access if a valid, unexpired dispatch token is provided (query param, header, or body)
    const queryToken =
      req.query.token ||
      req.header("x-dispatch-token") ||
      req.header("X-Dispatch-Token") ||
      req.body?.token;
    if (
      queryToken &&
      booking.dispatchToken &&
      queryToken === booking.dispatchToken &&
      (!booking.dispatchTokenExpires || new Date() < new Date(booking.dispatchTokenExpires))
    ) {
      req.booking = booking;
      req.isDispatchTokenAuth = true;
      return next();
    }

    // 2. Fall back to Admin JWT Authentication
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
router.post("/", auth, async (req, res) => {
  try {
    const {
      vehicleId,
      startDate,
      endDate,
      customerName,
      customerPhone,
      customerEmail,
      customerNIC,
      customerMessage,
      rentMode,
      clientBaseUrl,
    } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ msg: "Vehicle is required." });
    }
    if (!isValidId(vehicleId)) return res.status(404).json({ msg: "Vehicle not found." });

    const vehicle = await Vehicle.findById(vehicleId)
      .populate("owner", "name phone email")
      .populate("company", "companyName phone contactEmail logo");

    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found." });

    const hasDates = Boolean(startDate);
    let start, end, totalDays;

    if (hasDates) {
      start = new Date(startDate);
      end = endDate ? new Date(endDate) : new Date(startDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ msg: "Invalid booking dates provided." });
      }
      if (end < start) {
        return res.status(400).json({ msg: "Return date must be on or after pickup date." });
      }
      const diffMs = Math.abs(new Date(end).setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0));
      // Inclusive calendar rental days: same day = 1 day, next day = 2 days, etc.
      totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      if (vehicle.minRentalDays && totalDays < vehicle.minRentalDays) {
        return res.status(400).json({
          msg: `This vehicle requires a minimum rental period of ${vehicle.minRentalDays} day(s).`,
        });
      }
    } else {
      // Default to tomorrow for minRentalDays if customer inquired without selecting specific calendar dates
      start = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const minDays = vehicle.minRentalDays || 1;
      end = new Date(start.getTime() + (minDays - 1) * 24 * 60 * 60 * 1000);
      totalDays = minDays;
    }

    // Determine customer info from authenticated user
    const user = await User.findById(req.user.id).select("name email phone");
    if (!user) return res.status(401).json({ msg: "User account not found. Please log in again." });

    const resolvedCustomerName = (customerName || user.name || "Customer").trim();
    let resolvedCustomerPhone = (customerPhone || user.phone || "").trim();

    // If phone was provided in the booking but missing on profile, save it
    if (customerPhone && !user.phone) {
      user.phone = customerPhone.trim();
      await user.save().catch(() => {});
    }

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
      customer: req.user.id,
      customerName: resolvedCustomerName,
      customerPhone: resolvedCustomerPhone,
      customerEmail: user.email || customerEmail || "",
      customerNIC: customerNIC || "",
      customerMessage: customerMessage ? String(customerMessage).trim() : "",
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
    const isSingleDay = start.toDateString() === end.toDateString();
    const dateRangeStr = hasDates
      ? isSingleDay
        ? `${start.toLocaleDateString("en-GB")} (1 Day)`
        : `${start.toLocaleDateString("en-GB")} to ${end.toLocaleDateString("en-GB")} (${totalDays} Days)`
      : "Flexible / To be confirmed with host";
    const rentModeStr = rentMode === "with-driver" ? "With Driver" : "Self-Drive";

    const customerDisplay = resolvedCustomerPhone ? `${resolvedCustomerName} (${resolvedCustomerPhone})` : resolvedCustomerName;
    const trimmedMsg = customerMessage ? String(customerMessage).trim() : "";
    const whatsappMessage = 
      `\u{1F697} *New Booking Request - Yamu Car Rentals*\n` +
      `\u2022 *Ref:* ${bookingNumber}\n` +
      `\u2022 *Vehicle:* ${vehicle.brand} ${vehicle.model} (${vehicle.year})\n` +
      `\u2022 *Dates:* ${dateRangeStr}\n` +
      `\u2022 *Mode:* ${rentModeStr}\n` +
      `\u2022 *Customer:* ${customerDisplay}\n` +
      (trimmedMsg ? `\u2022 *Customer Note:* "${trimmedMsg}"\n` : "") +
      `\u2022 *Est. Total:* Rs. ${totalPrice.toLocaleString()}`;

    // Fire background automated email alert to all platform administrators
    (async () => {
      try {
        const { sendEmail } = require("../utils/mailer");
        const adminUsers = await User.find({ role: "admin" }).select("email name");
        const adminEmails = adminUsers.map((a) => a.email).filter(Boolean);
        if (!adminEmails.includes("yamucarrentals@gmail.com")) {
          adminEmails.push("yamucarrentals@gmail.com");
        }

        const emailHtml = `
          <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 18px 22px; border-radius: 8px; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800;">🚗 New Booking Request Received</h2>
              <p style="margin: 6px 0 0; opacity: 0.92; font-size: 13px;">Reference ID: <strong>${bookingNumber}</strong></p>
            </div>
            <div style="padding: 22px 4px;">
              <p style="font-size: 14.5px; color: #334155; margin-top: 0;">A customer has just submitted a booking request on <strong>Yamu Car Rentals</strong>.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13.5px;">
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 9px 0; color: #64748b;">Vehicle:</td><td style="padding: 9px 0; font-weight: 700; color: #0f172a;">${vehicle.brand} ${vehicle.model} (${vehicle.year})</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 9px 0; color: #64748b;">Customer:</td><td style="padding: 9px 0; font-weight: 700; color: #0f172a;">${resolvedCustomerName} (${resolvedCustomerPhone})</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 9px 0; color: #64748b;">Rental Dates:</td><td style="padding: 9px 0; font-weight: 700; color: #0f172a;">${dateRangeStr} (${totalDays} day${totalDays > 1 ? "s" : ""})</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 9px 0; color: #64748b;">Mode:</td><td style="padding: 9px 0; font-weight: 700; color: #0f172a;">${rentModeStr}</td></tr>
                <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 9px 0; color: #64748b;">Total Value:</td><td style="padding: 9px 0; font-weight: 800; color: #ea580c;">Rs. ${totalPrice.toLocaleString()}</td></tr>
                ${trimmedMsg ? `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 9px 0; color: #64748b;">Customer Note:</td><td style="padding: 9px 0; color: #1e293b; font-style: italic; background: #fff7ed; padding: 8px 10px; border-radius: 6px;">"${trimmedMsg}"</td></tr>` : ""}
              </table>

              <div style="text-align: center; margin: 28px 0 10px;">
                <a href="${dispatchUrl}" style="background: #f97316; color: #ffffff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                  Open Admin Concierge Dispatch Desk →
                </a>
              </div>
            </div>
            <div style="text-align: center; padding: 14px 0 0; font-size: 11.5px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
              Yamu Car Rentals Platform Operations • Instant Booking Notification
            </div>
          </div>
        `;

        for (const email of adminEmails) {
          sendEmail({
            to: email,
            subject: `[New Booking ${bookingNumber}] ${vehicle.brand} ${vehicle.model} - ${resolvedCustomerName}`,
            html: emailHtml,
          }).catch((e) => console.warn(`Admin notification email to ${email} failed:`, e.message));
        }
      } catch (mailErr) {
        console.warn("Background admin email alert error:", mailErr.message);
      }
    })();

    // The dispatch link is for Yamu admins (emailed above), never for the customer
    const { dispatchToken: _token, dispatchTokenExpires: _expires, ...customerBooking } = savedBooking.toObject();
    res.status(201).json({
      success: true,
      booking: customerBooking,
      whatsappMessage,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ msg: "Could not send your booking request. Please try again or call us." });
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
        if (booking.confirmedRental) {
          try {
            const rentalToCancel = await Rental.findById(booking.confirmedRental);
            if (rentalToCancel && rentalToCancel.status === "active") {
              rentalToCancel.status = "cancelled";
              await rentalToCancel.save();
              const rentedVeh = await Vehicle.findById(rentalToCancel.vehicle);
              if (rentedVeh && rentedVeh.status === "rented") {
                rentedVeh.status = "active";
                await rentedVeh.save();
              }
            }
          } catch (e) {
            console.error("Error reverting rental on cancel:", e);
          }
        }
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
            rentalType: "rental",
            isBlocked: false,
            notes: `Confirmed via Yamu Concierge Booking #${booking.bookingNumber}`,
          });
          const savedRental = await rental.save();
          booking.confirmedRental = savedRental._id;

          // Mark vehicle rented only if active and the rental window is currently ongoing today
          const now = new Date();
          const pickupStart = new Date(booking.startDate).setHours(0, 0, 0, 0);
          const returnEnd = new Date(booking.endDate).setHours(23, 59, 59, 999);
          const nowTime = now.getTime();
          if (nowTime >= pickupStart && nowTime <= returnEnd && vehicleToRent.status === "active") {
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
// @route   DELETE /api/bookings/batch OR DELETE /api/bookings
// @desc    Admin deletes multiple bookings at once
router.delete("/batch", auth, async (req, res) => {
  try {
    let role = req.user?.role;
    if (!role && req.user?.id) {
      const dbUser = await User.findById(req.user.id).select("role");
      role = dbUser?.role;
    }
    if (role !== "admin") return res.status(403).json({ msg: "Admin access required" });

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ msg: "Please provide an array of booking IDs to delete" });
    }

    const result = await Booking.deleteMany({ _id: { $in: ids } });
    res.json({ msg: `Successfully deleted ${result.deletedCount} booking(s)` });
  } catch (err) {
    console.error("Error batch deleting bookings:", err);
    res.status(500).json({ msg: "Server error batch deleting bookings" });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Admin deletes a single booking
router.delete("/:id", auth, async (req, res) => {
  try {
    let role = req.user?.role;
    if (!role && req.user?.id) {
      const dbUser = await User.findById(req.user.id).select("role");
      role = dbUser?.role;
    }
    if (role !== "admin") return res.status(403).json({ msg: "Admin access required" });

    if (!isValidId(req.params.id)) return res.status(400).json({ msg: "Invalid booking ID" });

    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    res.json({ msg: "Booking inquiry deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ msg: "Server error deleting booking" });
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
    let role = req.user?.role;
    if (!role && req.user?.id) {
      const dbUser = await User.findById(req.user.id).select("role");
      role = dbUser?.role;
    }
    if (role !== "admin") return res.status(403).json({ msg: "Admin access required" });

    const { status } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    const bookings = await Booking.find(query)
      .populate("vehicle", "brand model year vehicleType pricePerDay images location")
      .populate("assignedVehicle", "brand model year vehicleType pricePerDay images location")
      .populate("customer", "name phone email profileImage")
      .populate("host", "name phone email")
      .populate("company", "companyName logo phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ msg: "Server error fetching bookings" });
  }
});

// @route   DELETE /api/bookings/admin/batch
// @desc    Admin deletes multiple bookings at once
router.delete("/admin/batch", auth, async (req, res) => {
  try {
    let role = req.user?.role;
    if (!role && req.user?.id) {
      const dbUser = await User.findById(req.user.id).select("role");
      role = dbUser?.role;
    }
    if (role !== "admin") return res.status(403).json({ msg: "Admin access required" });

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ msg: "Please provide an array of booking IDs to delete" });
    }

    const result = await Booking.deleteMany({ _id: { $in: ids } });
    res.json({ msg: `Successfully deleted ${result.deletedCount} booking(s)` });
  } catch (err) {
    console.error("Error batch deleting bookings:", err);
    res.status(500).json({ msg: "Server error batch deleting bookings" });
  }
});

// @route   DELETE /api/bookings/admin/:id
// @desc    Admin deletes a single booking
router.delete("/admin/:id", auth, async (req, res) => {
  try {
    let role = req.user?.role;
    if (!role && req.user?.id) {
      const dbUser = await User.findById(req.user.id).select("role");
      role = dbUser?.role;
    }
    if (role !== "admin") return res.status(403).json({ msg: "Admin access required" });

    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    res.json({ msg: "Booking inquiry deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ msg: "Server error deleting booking" });
  }
});


// @route   GET /api/bookings/host
// @desc    Host fetches incoming booking inquiries for their vehicles in Host Dashboard
router.get("/host", auth, async (req, res) => {
  try {
    const hostCompany = await Company.findOne({ user: req.user.id }).select("_id");
    
    // Find all vehicles owned by this host or host's company
    const vehicleQuery = {
      $or: [{ owner: req.user.id }],
    };
    if (hostCompany) {
      vehicleQuery.$or.push({ company: hostCompany._id });
    }
    const hostVehicles = await Vehicle.find(vehicleQuery).select("_id");
    const vehicleIds = hostVehicles.map((v) => v._id);

    const bookingQuery = {
      $or: [
        { host: req.user.id },
        ...(hostCompany ? [{ company: hostCompany._id }] : []),
        ...(vehicleIds.length > 0 ? [{ vehicle: { $in: vehicleIds } }, { assignedVehicle: { $in: vehicleIds } }] : []),
      ],
    };

    const bookings = await Booking.find(bookingQuery)
      .populate("vehicle", "brand model year vehicleType pricePerDay images location rentMode minRentalDays owner")
      .populate("assignedVehicle", "brand model year vehicleType pricePerDay images location rentMode minRentalDays owner")
      .populate("customer", "name phone email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching host bookings:", err);
    res.status(500).json({ msg: "Server error fetching incoming booking inquiries" });
  }
});

// @route   PATCH /api/bookings/:id/host-response
// @desc    Host one-tap response to booking inquiry ("available" or "unavailable")
router.patch("/:id/host-response", auth, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ msg: "Invalid booking ID" });

    const { response, note } = req.body;
    if (!["available", "unavailable"].includes(response)) {
      return res.status(400).json({ msg: "Response must be 'available' or 'unavailable'" });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("vehicle")
      .populate("assignedVehicle");

    if (!booking) return res.status(404).json({ msg: "Booking record not found" });

    // Authorization check
    const hostCompany = await Company.findOne({ user: req.user.id }).select("_id");
    const isDirectHost = booking.host && booking.host.toString() === req.user.id;
    const isCompanyMatch = hostCompany && booking.company && booking.company.toString() === hostCompany._id.toString();
    const isVehicleOwner = booking.vehicle && booking.vehicle.owner && booking.vehicle.owner.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isDirectHost && !isCompanyMatch && !isVehicleOwner && !isAdmin) {
      return res.status(403).json({ msg: "Not authorized to respond to this booking request" });
    }

    booking.hostAvailabilityStatus = response;
    booking.hostContacted = true;
    booking.hostContactedAt = new Date();

    const noteText = response === "available"
      ? (note ? `Host confirmed car available: ${note}` : "Host confirmed vehicle is available")
      : (note ? `Host marked car busy / unavailable: ${note}` : "Host marked vehicle as busy / unavailable");

    booking.statusHistory.push({
      status: booking.status,
      changedAt: new Date(),
      changedBy: "Host",
      note: noteText,
    });

    // If host marks busy and booking is still in initial pending state, trigger alternative search workflow
    if (response === "unavailable" && booking.status === "pending") {
      booking.status = "finding_alternative";
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("vehicle", "brand model year vehicleType pricePerDay images location rentMode minRentalDays owner")
      .populate("assignedVehicle", "brand model year vehicleType pricePerDay images location rentMode minRentalDays owner")
      .populate("customer", "name phone email");

    res.json(populated);
  } catch (err) {
    console.error("Error saving host response:", err);
    res.status(500).json({ msg: "Server error saving your response" });
  }
});

module.exports = router;

