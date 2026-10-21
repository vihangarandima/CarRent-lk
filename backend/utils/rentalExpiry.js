const Rental = require("../models/Rental");
const Vehicle = require("../models/Vehicle");

let lastGlobalRun = 0;
const GLOBAL_THROTTLE_MS = 10000; // 10 seconds throttle for global checks to prevent redundant DB roundtrips

/**
 * Automatically expires overdue active rentals where returnDate < now,
 * marks them as "completed", and restores the vehicle's status to "active".
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
    if (!expiredRentals || expiredRentals.length === 0) {
      return 0;
    }

    for (const rental of expiredRentals) {
      rental.status = "completed";
      await rental.save();

      // Set vehicle back to active so it shows in public listings again (unless flagged or hidden)
      const vehicle = await Vehicle.findById(rental.vehicle);
      if (vehicle && vehicle.status === "rented") {
        vehicle.status = "active";
        await vehicle.save();
      }
    }

    return expiredRentals.length;
  } catch (err) {
    console.error("Auto-expire rentals error:", err);
    return 0;
  }
}

module.exports = {
  autoExpireRentals,
};
