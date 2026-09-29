const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Cloudinary credentials with verified project defaults so uploads NEVER fail
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "gjjnq5g0";
const apiKey = process.env.CLOUDINARY_API_KEY || "719527795383164";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "5-qhsQBo_a62SzTyQDBpod-zjrc";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

// Use RAM memory buffer before direct stream to Cloudinary CDN
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
// @desc    Upload an image directly to Cloudinary and return permanent CDN URL
router.post("/", (req, res) => {
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
      console.error("Cloudinary upload error:", error);
      return res
        .status(500)
        .json({ msg: "Failed to upload image to cloud storage: " + (error.message || "Unknown error") });
    }
  });
});

module.exports = router;

