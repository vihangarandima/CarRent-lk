# Critical Implementation Guide - Rental Booking System

## 🎯 WHAT'S MISSING (Most Critical)

Your app can show cars but **cannot accept bookings**. When a customer wants to rent a car:

1. ❌ There's no rental record created
2. ❌ There's no payment collected
3. ❌ There's no confirmation sent
4. ❌ Company has no way to track it

---

## 📋 STEP 1: Add Rental Model (Backend)

Create `backend/models/Rental.js`:

```javascript
const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema({
  // Links
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  // Dates
  pickupDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    required: true,
  },

  // Pricing
  pricePerDay: {
    type: Number,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  }, // basePrice = pricePerDay * totalDays
  discount: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  }, // totalPrice = basePrice - discount + taxes + fees

  // Locations
  pickupLocation: {
    type: String,
    required: true,
  },
  returnLocation: {
    type: String,
    default: null,
  },

  // Status
  status: {
    type: String,
    enum: [
      "pending_confirmation",
      "confirmed",
      "awaiting_pickup",
      "active",
      "completed",
      "cancelled",
    ],
    default: "pending_confirmation",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "partial", "paid", "refunded"],
    default: "pending",
  },

  // Details
  notes: {
    type: String,
    default: "",
  },
  renterNotes: {
    type: String,
    default: "",
  },
  companyNotes: {
    type: String,
    default: "",
  },

  // Damage/Issues
  damageReported: {
    type: Boolean,
    default: false,
  },
  damageDetails: {
    type: String,
    default: null,
  },
  damageCharge: {
    type: Number,
    default: 0,
  },
  fuelStatus: {
    pickupFuel: { type: Number, default: 100 }, // %
    returnFuel: { type: Number, default: 100 },
    fuelCharge: { type: Number, default: 0 },
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: {
    type: Date,
  },
  pickupAt: {
    type: Date,
  },
  returnedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Rental", RentalSchema);
```

---

## 💳 STEP 2: Add Payment Model

Create `backend/models/Payment.js`:

```javascript
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  // Links
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rental",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Amount
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "LKR",
  },

  // Payment Details
  paymentMethod: {
    type: String,
    enum: ["card", "online_banking", "mobile_wallet", "cash"],
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  }, // from payment gateway
  paymentGateway: {
    type: String,
    default: "sslcommerz",
  },

  // Status
  status: {
    type: String,
    enum: ["initiated", "completed", "failed", "pending", "refunded"],
    default: "initiated",
  },

  // Gateway Response
  gatewayResponse: {
    type: Object,
    default: {},
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
```

---

## 🔌 STEP 3: Add API Routes for Rentals

Create `backend/routes/rentals.js`:

```javascript
const express = require("express");
const router = express.Router();
const Rental = require("../models/Rental");
const Vehicle = require("../models/Vehicle");
const Company = require("../models/Company");
const Payment = require("../models/Payment");
const jwt = require("jsonwebtoken");

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
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

// @route   POST /api/rentals
// @desc    Create a new rental booking
// @access  Private (Renter)
router.post("/", auth, async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate, pickupLocation, notes } =
      req.body;

    // Validate dates
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    if (pickup >= returnD) {
      return res
        .status(400)
        .json({ msg: "Return date must be after pickup date" });
    }

    // Check vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }

    // Check vehicle is available
    if (vehicle.availableFrom > pickup || vehicle.availableTo < returnD) {
      return res
        .status(400)
        .json({ msg: "Vehicle not available for selected dates" });
    }

    // Check no conflicting rentals
    const conflict = await Rental.findOne({
      vehicle: vehicleId,
      status: { $in: ["confirmed", "active"] },
      $or: [{ pickupDate: { $lt: returnD }, returnDate: { $gt: pickup } }],
    });

    if (conflict) {
      return res
        .status(400)
        .json({ msg: "Vehicle already booked for these dates" });
    }

    // Calculate pricing
    const totalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));
    const basePrice = vehicle.pricePerDay * totalDays;
    const totalPrice = basePrice; // Add taxes/fees later

    // Create rental
    const rental = new Rental({
      vehicle: vehicleId,
      renter: req.user.id,
      company: vehicle.company,
      pickupDate: pickup,
      returnDate: returnD,
      pricePerDay: vehicle.pricePerDay,
      totalDays,
      basePrice,
      totalPrice,
      pickupLocation: pickupLocation || vehicle.location,
      returnLocation: vehicle.location,
      renterNotes: notes || "",
    });

    await rental.save();

    // Populate data
    await rental.populate("vehicle renter company");

    res.json({
      msg: "Rental created successfully",
      rental,
      nextStep: "Make payment to confirm booking",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/rentals/company
// @desc    Get all rentals for a company
// @access  Private (Company)
router.get("/company", auth, async (req, res) => {
  try {
    // Get company
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    const { status } = req.query;
    let filter = { company: company._id };

    if (status) filter.status = status;

    const rentals = await Rental.find(filter)
      .populate("vehicle", "brand model images pricePerDay")
      .populate("renter", "name email")
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/rentals/company/stats
// @desc    Get company rental statistics
// @access  Private (Company)
router.get("/company/stats", auth, async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // Get this month's data
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Total revenue this month
    const paidRentals = await Rental.find({
      company: company._id,
      paymentStatus: "paid",
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalRevenue = paidRentals.reduce((sum, r) => sum + r.totalPrice, 0);

    // Active bookings
    const activeRentals = await Rental.countDocuments({
      company: company._id,
      status: { $in: ["confirmed", "active", "awaiting_pickup"] },
    });

    // Pending payments
    const pendingPayments = await Rental.find({
      company: company._id,
      paymentStatus: { $in: ["pending", "partial"] },
    });

    const outstandingAmount = pendingPayments.reduce(
      (sum, r) => sum + r.totalPrice,
      0,
    );

    res.json({
      thisMonthRevenue: totalRevenue,
      activeBookings: activeRentals,
      outstandingPayments: pendingPayments.length,
      outstandingAmount,
      totalBookingsThisMonth: paidRentals.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   PUT /api/rentals/:id/status
// @desc    Update rental status (company only)
// @access  Private (Company)
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending_confirmation",
      "confirmed",
      "awaiting_pickup",
      "active",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ msg: "Rental not found" });
    }

    // Verify company
    const company = await Company.findOne({ user: req.user.id });
    if (rental.company.toString() !== company._id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Update status
    rental.status = status;

    if (status === "confirmed") rental.confirmedAt = new Date();
    if (status === "active") rental.pickupAt = new Date();
    if (status === "completed") rental.returnedAt = new Date();

    await rental.save();
    await rental.populate("vehicle renter");

    res.json(rental);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/rentals/:id
// @desc    Get rental details
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("vehicle")
      .populate("renter", "name email phone")
      .populate("company", "companyName phone contactEmail");

    if (!rental) {
      return res.status(404).json({ msg: "Rental not found" });
    }

    res.json(rental);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
```

---

## 🔌 STEP 4: Register Routes in server.js

Add this line to `backend/server.js`:

```javascript
// Add with other routes (around line 14):
app.use("/api/rentals", require("./routes/rentals"));
```

---

## 💳 STEP 5: Payment Integration (SSLCommerz)

Create `backend/routes/payments.js`:

```javascript
const express = require("express");
const router = express.Router();
const axios = require("axios");
const Payment = require("../models/Payment");
const Rental = require("../models/Rental");
const jwt = require("jsonwebtoken");

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
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

// @route   POST /api/payments/initiate
// @desc    Initiate payment with SSLCommerz
// @access  Private
router.post("/initiate", auth, async (req, res) => {
  try {
    const { rentalId } = req.body;

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ msg: "Rental not found" });
    }

    if (rental.renter.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Create payment record
    const payment = new Payment({
      rental: rentalId,
      user: req.user.id,
      amount: rental.totalPrice,
      paymentMethod: "online_banking",
      status: "initiated",
    });

    await payment.save();

    // SSLCommerz payload
    const store_id = process.env.SSL_STORE_ID;
    const store_password = process.env.SSL_STORE_PASSWORD;
    const is_live = process.env.SSL_IS_LIVE === "true";

    const payload = {
      store_id,
      store_passwd: store_password,
      total_amount: rental.totalPrice,
      currency: "LKR",
      tran_id: payment._id.toString(),
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      fail_url: `${process.env.FRONTEND_URL}/payment/failed`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancelled`,
      ipn_url: `${process.env.BACKEND_URL}/api/payments/ipn`,

      cus_name: rental.renter?.name || "Customer",
      cus_email: rental.renter?.email || "user@example.com",
      cus_add1: rental.pickupLocation,
      cus_city: "Colombo",
      cus_country: "Sri Lanka",

      product_name: `Car Rental - ${rental.vehicle?.brand} ${rental.vehicle?.model}`,
      product_category: "Car Rental",

      shipping_method: "NO",
      num_of_item: 1,
      weight: "0",
      value_a: "",
      value_b: "",
      value_c: "",
      value_d: "",
    };

    const sslUrl = is_live
      ? "https://securepay.sslcommerz.com/gwp/v4/api.php"
      : "https://sandbox.sslcommerz.com/gwp/v4/api.php";

    const response = await axios.post(sslUrl, payload);

    if (response.data.status === "SUCCESS") {
      res.json({
        status: "success",
        gatewayUrl: response.data.redirectGatewayURL,
        paymentId: payment._id,
      });
    } else {
      res.status(400).json({ msg: "Failed to initiate payment" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST /api/payments/ipn
// @desc    Instant Payment Notification from SSLCommerz
// @access  Public (Webhook)
router.post("/ipn", async (req, res) => {
  try {
    const { tran_id, status, amount } = req.body;

    const payment = await Payment.findById(tran_id);
    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    if (status === "VALID" || status === "VALIDATED") {
      // Payment successful
      payment.status = "completed";
      payment.completedAt = new Date();
      payment.gatewayResponse = req.body;
      await payment.save();

      // Update rental
      const rental = await Rental.findById(payment.rental);
      rental.paymentStatus = "paid";
      rental.status = "confirmed";
      await rental.save();

      // Send confirmation email (implement this)
      // sendBookingConfirmationEmail(rental);
    }

    res.json({ msg: "IPN processed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
```

---

## 🎨 STEP 6: Add to Company Dashboard

Update `frontend/src/pages/CompanyDashboard.jsx` to include bookings section:

```jsx
// Add this section after company info, inside the component:

<section className="dashboard-section">
  <h2>Active Bookings ({activeBookings?.length || 0})</h2>

  {activeBookings?.length > 0 ? (
    <div className="bookings-list">
      {activeBookings.map((booking) => (
        <div key={booking._id} className="booking-card">
          <div className="booking-header">
            <h3>{booking.vehicle.brand} {booking.vehicle.model}</h3>
            <span className={`status ${booking.status}`}>{booking.status}</span>
          </div>

          <div className="booking-details">
            <p><strong>Renter:</strong> {booking.renter.name}</p>
            <p><strong>Dates:</strong> {new Date(booking.pickupDate).toLocaleDateString()} to {new Date(booking.returnDate).toLocaleDateString()}</p>
            <p><strong>Days:</strong> {booking.totalDays}</p>
            <p><strong>Amount:</strong> Rs. {booking.totalPrice.toLocaleString()}</p>
            <p><strong>Payment:</strong> <span className={booking.paymentStatus}>{booking.paymentStatus}</span></p>
          </div>

          <div className="booking-actions">
            <button onClick={() => handleViewDetails(booking._id)}>View Details</button>
            <button onClick={() => handleUpdateStatus(booking._id)}>Update Status</button>
            <button onClick={() => handleMessage(booking.renter._id)}>Message Renter</button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p>No active bookings</p>
  )}
</section>

// Add revenue section:
<section className="dashboard-section">
  <h2>This Month Revenue</h2>
  <div className="revenue-cards">
    <div className="card">
      <h3>Total Revenue</h3>
      <p className="amount">Rs. {stats.thisMonthRevenue?.toLocaleString() || 0}</p>
    </div>
    <div className="card">
      <h3>Active Bookings</h3>
      <p className="amount">{stats.activeBookings || 0}</p>
    </div>
    <div className="card">
      <h3>Outstanding Amount</h3>
      <p className="amount">Rs. {stats.outstandingAmount?.toLocaleString() || 0}</p>
    </div>
  </div>
</section>
```

---

## ⚙️ STEP 7: Environment Variables

Add to `.env`:

```
# SSLCommerz
SSL_STORE_ID=your_store_id
SSL_STORE_PASSWORD=your_store_password
SSL_IS_LIVE=false

# Frontend
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

---

## 🚀 TESTING CHECKLIST

After implementation:

- [ ] Create a test rental via API
- [ ] Verify rental appears in company dashboard
- [ ] Test payment initiation (use SSLCommerz test card)
- [ ] Verify payment status updates in database
- [ ] Test booking status transitions
- [ ] Verify revenue calculation
- [ ] Test error cases (double booking, invalid dates)
- [ ] Check email notifications (when added)

---

## 📊 DATABASE INDEXES TO ADD

Run in MongoDB shell:

```javascript
db.rentals.createIndex({ company: 1, status: 1, createdAt: -1 });
db.rentals.createIndex({ vehicle: 1, pickupDate: 1, returnDate: 1 });
db.rentals.createIndex({ renter: 1, createdAt: -1 });
db.payments.createIndex({ rental: 1 });
db.payments.createIndex({ user: 1, createdAt: -1 });
db.payments.createIndex({ status: 1 });
```

---

## ✅ QUICK WINS (BEFORE MOVING TO NEXT FEATURES)

1. ✅ All code above implemented and tested
2. ✅ Company can see bookings in dashboard
3. ✅ Payments captured correctly
4. ✅ Revenue calculated accurately
5. ✅ Booking flow complete (create → pay → confirm → pickup → complete)

**Estimated time: 3-4 hours**

This is your MVP rental system. Build this first, test thoroughly, then add analytics!
