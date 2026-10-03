const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { sanitizeInput, securityHeaders, rateLimit } = require("./middleware/security");

// Fail fast with a clear message instead of crashing later on the first request
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}
for (const key of ["EMAIL_USER", "EMAIL_PASS", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
  if (!process.env[key]) console.warn(`⚠️  ${key} is not set — related features will not work.`);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Behind Render/Railway proxies: needed so req.ip is the real client IP for rate limiting
app.set("trust proxy", 1);

// CORS: set CLIENT_URL (comma separated) in production to lock the API to your site
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  }),
);
app.use(securityHeaders);
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeInput);

// Throttle endpoints that send emails or accept passwords
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many attempts. Please wait a few minutes and try again.",
});
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many codes requested. Please wait 15 minutes and try again.",
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/auth/send-otp", emailLimiter);
app.use("/api/auth/forgot-password", emailLimiter);

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

app.get("/", (req, res) => {
  res.send("CarRents.lk API is running...");
});

// Health check for uptime monitors
app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// Unknown API route
app.use("/api", (req, res) => {
  res.status(404).json({ msg: "API route not found" });
});

// Last-resort error handler: malformed JSON, unexpected throws, etc.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ msg: "Invalid request body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ msg: "Request is too large" });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ msg: "Something went wrong. Please try again." });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
