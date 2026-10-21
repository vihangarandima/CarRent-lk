const Rental = require("../models/Rental");
const Vehicle = require("../models/Vehicle");

let lastGlobalRun = 0;
const GLOBAL_THROTTLE_MS = 10000; // 10 seconds throttle for global checks to prevent redundant DB roundtrips

/**
 * Automatically expires overdue active rentals where returnDate < now,
 * marks them as "completed", and restores the vehicle's status to "active"
 * (provided no other active rental is currently ongoing today).
 *
 * Also synchronizes vehicle status:
 * - Vehicles with an active ongoing rental today (pickupDate <= now <= returnDate) are set to "rented"
 * 
 * @param {string|null} ownerId - Optional owner ID. If null, runs globally for all owners.
 * @param {boolean} force - If true, bypasses the throttle.
 * @param {string|null} companyId - Optional company ID to check company-owned rentals.
 * @returns {Promise<number>} Number of expired rentals processed.
 */
async function autoExpireRentals(ownerId = null, force = false, companyId = null) {
  try {
    const now = new Date();

    // Throttle un-scoped global runs to at most once every 10 seconds
    if (!ownerId && !companyId && !force && Date.now() - lastGlobalRun < GLOBAL_THROTTLE_MS) {
      return 0;
    }

    if (!ownerId && !companyId) {
      lastGlobalRun = Date.now();
    }

    const query = {
      status: "active",
      returnDate: { $lt: now },
    };
    if (ownerId && companyId) {
      query.$or = [{ owner: ownerId }, { company: companyId }];
    } else if (ownerId) {
      query.owner = ownerId;
    } else if (companyId) {
      query.company = companyId;
    }

    const expiredRentals = await Rental.find(query);
    if (expiredRentals && expiredRentals.length > 0) {
      for (const rental of expiredRentals) {
        rental.status = "completed";
        await rental.save();

        // Set vehicle back to active if no other rental is currently ongoing today
        const vehicle = await Vehicle.findById(rental.vehicle);
        if (vehicle && vehicle.status === "rented") {
          const otherOngoing = await Rental.findOne({
            _id: { $ne: rental._id },
            vehicle: rental.vehicle,
            status: "active",
            pickupDate: { $lte: now },
            returnDate: { $gte: now },
          });
          if (!otherOngoing) {
            vehicle.status = "active";
            await vehicle.save();
          }
        }
      }
    }

    // Date-aware synchronization:
    // Activate "rented" status for vehicles that have an active rental ongoing today
    const ongoingQuery = {
      status: "active",
      pickupDate: { $lte: now },
      returnDate: { $gte: now },
    };
    if (ownerId && companyId) {
      ongoingQuery.$or = [{ owner: ownerId }, { company: companyId }];
    } else if (ownerId) {
      ongoingQuery.owner = ownerId;
    } else if (companyId) {
      ongoingQuery.company = companyId;
    }

    const ongoingRentals = await Rental.find(ongoingQuery).select("vehicle");
    const ongoingVehicleIds = ongoingRentals.map((r) => r.vehicle).filter(Boolean);
    if (ongoingVehicleIds.length > 0) {
      await Vehicle.updateMany(
        { _id: { $in: ongoingVehicleIds }, status: "active" },
        { $set: { status: "rented" } }
      );
    }

    return expiredRentals ? expiredRentals.length : 0;
  } catch (err) {
    console.error("Auto-expire rentals error:", err);
    return 0;
  }
}

module.exports = {
  autoExpireRentals,
};
