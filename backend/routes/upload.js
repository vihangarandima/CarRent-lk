const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const { auth } = require("../middleware/auth");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Credentials must come from the environment (never commit secrets to git)
const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn(
    "⚠️ Cloudinary is not configured: falling back to local /uploads directory."
  );
}

// Use RAM memory buffer before upload
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const extname = filetypes.test(
      (file.originalname || "").toLowerCase().split(".").pop()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images Only (JPEG, PNG, WebP, GIF)!"));
    }
  },
});

// @route   POST api/upload
// @desc    Upload an image to Cloudinary (or local disk fallback)
router.post("/", auth, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "File too large. Maximum allowed size is 10MB." });
      }
      return res
        .status(400)
        .json({ msg: err.message || "Failed to upload file. Images only." });
    }

    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ msg: "No image file provided." });
      }

      // If Cloudinary credentials are not set, save locally to /uploads
      if (!cloudinaryConfigured) {
        const ext = (req.file.originalname || "").toLowerCase().split(".").pop() || "jpg";
        const filename = `vehicle-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, req.file.buffer);
        const localUrl = `/uploads/${filename}`;
        console.log("📸 Image saved locally to:", localUrl);
        return res.json({ url: localUrl, msg: "Image uploaded successfully!" });
      }

      // Stream memory buffer directly into Cloudinary CDN
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "carrents/vehicles",
            resource_type: "image",
            transformation: [
              { width: 1400, height: 950, crop: "limit", quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      const result = await uploadPromise;
      const imageUrl = result.secure_url || result.url;

      console.log("📸 Image successfully uploaded to Cloudinary:", imageUrl);
      return res.json({ url: imageUrl, msg: "Image uploaded successfully!" });
    } catch (error) {
      console.error("Upload error:", error);
      return res
        .status(500)
        .json({ msg: "Failed to upload image: " + (error.message || "Unknown error") });
    }
  });
});

module.exports = router;

