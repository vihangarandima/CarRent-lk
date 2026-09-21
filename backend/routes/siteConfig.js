const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const SiteConfig = require("../models/SiteConfig");
const SiteSnapshot = require("../models/SiteSnapshot");
const User = require("../models/User");

// Middleware: Auth check
const auth = async (req, res, next) => {
  const token =
    req.header("x-auth-token") ||
    req.header("Authorization")?.replace("Bearer ", "");
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

// Middleware: Admin check
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Access denied. Admin privileges required." });
    }
    req.adminUser = user;
    next();
  } catch (err) {
    res.status(500).json({ msg: "Authorization error" });
  }
};

// @route   GET /api/site-config
// @desc    Get current site configuration (public cached)
router.get("/", async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig({});
      await config.save();
    }
    res.json(config);
  } catch (err) {
    console.error("Error fetching site config:", err);
    res.status(500).json({ msg: "Server error fetching site configuration" });
  }
});

// @route   PUT /api/site-config
// @desc    Update site configuration & save automated snapshot (Admin Only)
router.put("/", auth, adminOnly, async (req, res) => {
  try {
    const updateData = req.body;

    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig({});
    }

    // Create an automatic snapshot before applying updates
    const currentConfigObj = config.toObject();
    delete currentConfigObj._id;
    delete currentConfigObj.__v;

    const snapshotName =
      req.body._snapshotName ||
      `Auto Snapshot (${new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" })})`;

    const snapshot = new SiteSnapshot({
      name: snapshotName,
      description: req.body._snapshotDesc || "Admin configuration update",
      config: currentConfigObj,
      createdBy: req.user.id,
    });
    await snapshot.save();

    // Apply updates
    if (updateData.global) config.global = { ...config.global.toObject(), ...updateData.global };
    if (updateData.hero) config.hero = { ...config.hero.toObject(), ...updateData.hero };
    if (updateData.home) config.home = { ...config.home.toObject(), ...updateData.home };
    if (updateData.vehicleListing) {
      config.vehicleListing = {
        ...config.vehicleListing.toObject(),
        ...updateData.vehicleListing,
      };
    }
    if (updateData.companies) {
      config.companies = {
        ...config.companies.toObject(),
        ...updateData.companies,
      };
    }
    if (updateData.whyUs) config.whyUs = { ...config.whyUs.toObject(), ...updateData.whyUs };
    if (updateData.footer) config.footer = { ...config.footer.toObject(), ...updateData.footer };

    config.updatedBy = req.user.id;
    config.updatedAt = Date.now();

    await config.save();
    res.json({ msg: "Configuration updated successfully", config });
  } catch (err) {
    console.error("Error updating site config:", err);
    res.status(500).json({ msg: "Server error updating site configuration" });
  }
});

// @route   GET /api/site-config/snapshots
// @desc    Get version history snapshots (Admin Only)
router.get("/snapshots", auth, adminOnly, async (req, res) => {
  try {
    const snapshots = await SiteSnapshot.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(snapshots);
  } catch (err) {
    console.error("Error fetching snapshots:", err);
    res.status(500).json({ msg: "Server error fetching snapshots" });
  }
});

// @route   POST /api/site-config/rollback/:snapshotId
// @desc    Rollback to a specific snapshot (Admin Only)
router.post("/rollback/:snapshotId", auth, adminOnly, async (req, res) => {
  try {
    const snapshot = await SiteSnapshot.findById(req.params.snapshotId);
    if (!snapshot) {
      return res.status(404).json({ msg: "Snapshot not found" });
    }

    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig({});
    }

    // Save current as pre-rollback backup
    const preRollback = new SiteSnapshot({
      name: `Pre-Rollback Backup (${new Date().toLocaleTimeString()})`,
      description: `Auto backup created before restoring snapshot "${snapshot.name}"`,
      config: config.toObject(),
      createdBy: req.user.id,
    });
    await preRollback.save();

    // Overwrite config with snapshot config
    const snapData = snapshot.config;
    if (snapData.global) config.global = snapData.global;
    if (snapData.hero) config.hero = snapData.hero;
    if (snapData.home) config.home = snapData.home;
    if (snapData.vehicleListing) config.vehicleListing = snapData.vehicleListing;
    if (snapData.companies) config.companies = snapData.companies;
    if (snapData.whyUs) config.whyUs = snapData.whyUs;
    if (snapData.footer) config.footer = snapData.footer;

    config.updatedBy = req.user.id;
    config.updatedAt = Date.now();

    await config.save();
    res.json({
      msg: `Successfully restored to snapshot "${snapshot.name}"`,
      config,
    });
  } catch (err) {
    console.error("Error performing rollback:", err);
    res.status(500).json({ msg: "Server error during rollback" });
  }
});

// @route   POST /api/site-config/reset
// @desc    Reset configuration to factory defaults (Admin Only)
router.post("/reset", auth, adminOnly, async (req, res) => {
  try {
    await SiteConfig.deleteMany({});
    const newConfig = new SiteConfig({});
    await newConfig.save();
    res.json({
      msg: "Site configuration reset to factory defaults",
      config: newConfig,
    });
  } catch (err) {
    console.error("Error resetting site config:", err);
    res.status(500).json({ msg: "Server error resetting site config" });
  }
});

module.exports = router;
