const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins for development; restrict in production
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/bids", require("./routes/bids"));
app.use("/api/companies", require("./routes/companies"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/site-config", require("./routes/siteConfig"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/rentals", require("./routes/rentals"));

// Serve the uploads folder statically so frontend can access images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");

    // ── Background auto-expire: check every 10 minutes ──
    // When a rental's returnDate has passed, mark it completed and restore the vehicle to "active"
    const Rental = require("./models/Rental");
    const Vehicle = require("./models/Vehicle");

    async function autoExpireAllRentals() {
      try {
        const now = new Date();
        const expiredRentals = await Rental.find({
          status: "active",
          returnDate: { $lt: now },
        });

        for (const rental of expiredRentals) {
          rental.status = "completed";
          await rental.save();

          const vehicle = await Vehicle.findById(rental.vehicle);
          if (vehicle && vehicle.status === "rented") {
            vehicle.status = "active";
            await vehicle.save();
          }
        }

        if (expiredRentals.length > 0) {
          console.log(`Auto-expired ${expiredRentals.length} overdue rental(s)`);
        }
      } catch (err) {
        console.error("Auto-expire background error:", err);
      }
    }

    // Run once on startup, then every 10 minutes
    autoExpireAllRentals();
    setInterval(autoExpireAllRentals, 10 * 60 * 1000);
  })
  .catch((err) => console.log("Database connection error:", err));

app.get("/", (req, res) => {
  res.send("CarRents.lk API is running...");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

