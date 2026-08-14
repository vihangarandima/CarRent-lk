const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to backend/uploads folder
  },
  filename: function (req, file, cb) {
    // Create a unique filename: timestamp + original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Create the multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: function (req, file, cb) {
    // Accept only certain image types
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images Only!"));
    }
  },
});

// @route   POST api/upload
// @desc    Upload an image and get back the URL
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // Construct the URL where the image can be accessed statically
    // Use environment variable, fall back to constructed URL
    const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:5000`;
    const imageUrl = `${baseUrl.replace(/\/$/, "")}/uploads/${req.file.filename}`;

    console.log("Image uploaded:", req.file.filename);
    console.log("Image URL:", imageUrl);

    res.json({ url: imageUrl, msg: "Image uploaded successfully!" });
  } catch (err) {
    console.error("Upload error:", err.message);
    res
      .status(500)
      .json({ msg: "Server Error during upload", error: err.message });
  }
});

module.exports = router;
