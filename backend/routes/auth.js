const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");
const nodemailer = require("nodemailer");
const OTP = require("../models/OTP");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, companyName, phone, address, otp } =
      req.body;

    // Verify OTP code
    const record = await OTP.findOne({ email });
    if (!record || record.otp !== otp) {
      return res.status(400).json({ msg: "Invalid or expired OTP code!" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ name, email, password, role: role || "renter" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // If registering as a company, create the Company profile too
    let companyData = null;
    if (role === "company") {
      if (!companyName) {
        await User.findByIdAndDelete(user._id);
        return res
          .status(400)
          .json({ msg: "Company name is required for company accounts" });
      }
      const company = new Company({
        user: user._id,
        companyName,
        contactEmail: email,
        phone: phone || "",
        address: address || "",
      });
      await company.save();
      companyData = { id: company._id, companyName: company.companyName };
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user._id, name, email, role: user.role },
      company: companyData,
    });

    // Remove OTP record after successful registration
    try {
      await OTP.deleteOne({ email });
    } catch (err) {
      console.warn("Failed to delete OTP record:", err.message);
    }
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).send("Server Error");
  }
});

// Helper to create mail transporter dynamically
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const rawPass = process.env.EMAIL_PASS?.trim();
  const emailPass = rawPass ? rawPass.replace(/\s+/g, "") : "";

  if (!emailUser || !emailPass) {
    console.warn("⚠️ Warning: EMAIL_USER or EMAIL_PASS is missing from environment variables.");
  }

  // If using Gmail, using service: 'gmail' is much more reliable across cloud providers (Render, Railway, AWS)
  const isGmail = (process.env.EMAIL_HOST || "").includes("gmail") || (emailUser && emailUser.includes("@gmail.com"));

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send Verification OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "An account with this email already exists. Please log in instead." });
    }

    // Verify SMTP config exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Missing EMAIL_USER or EMAIL_PASS in environment variables.");
      return res.status(500).json({
        msg: "Email service is not configured on this server. Please add EMAIL_USER and EMAIL_PASS to environment variables.",
      });
    }

    // Generate a cryptographically secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save or update existing OTP in database
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true },
    );

    // Send Email
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Yamu Car Rentals" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Yamu Car Rentals Verification Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ea580c; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Yamu <span style="color: #0f172a;">Car Rentals</span></h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Sri Lanka's Premier Car Sharing Marketplace</p>
          </div>
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-bottom: 8px;">Verify Your Email</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">Use the 6-digit verification code below to complete your registration. This code will expire in <strong>5 minutes</strong>:</p>
          <div style="background: #fff7ed; border: 2px dashed #f97316; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ea580c; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-top: 24px;">If you did not request this verification code, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #cbd5e1; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Yamu Car Rentals LK. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "Verification OTP sent to your email." });
  } catch (err) {
    console.error("OTP Send Error:", err);
    const isAuthErr = err && (err.code === "EAUTH" || err.responseCode === 535);
    const message = isAuthErr
      ? "SMTP authentication failed. Please check EMAIL_USER and EMAIL_PASS (Gmail App Password) in your hosting dashboard."
      : `Failed to send verification email: ${err.message || "Unknown error"}`;
    res.status(500).json({ msg: message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    // If company, fetch company id too
    let companyData = null;
    if (user.role === "company") {
      const company = await Company.findOne({ user: user._id }).select(
        "_id companyName logo",
      );
      if (company)
        companyData = {
          id: company._id,
          companyName: company.companyName,
          logo: company.logo,
        };
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      company: companyData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server Error");
  }
});

// Firebase Login Route
router.post("/firebase-login", async (req, res) => {
  try {
    const { name, email, firebaseId, role, companyName, phone, address } =
      req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required for authentication" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    let companyData = null;

    if (!user) {
      // Create new user with selected role
      const initialRole = role && ["owner", "renter", "company", "admin"].includes(role) ? role : "renter";
      user = new User({
        name: name || email.split("@")[0],
        email,
        firebaseId,
        role: initialRole,
        password: "firebase_user",
      });
      await user.save();

      // If registered as company, create company profile
      if (initialRole === "company") {
        const company = new Company({
          user: user._id,
          companyName: companyName || (name ? `${name} Rentals` : "My Rental Fleet"),
          contactEmail: email,
          phone: phone || "",
          address: address || "Colombo, Sri Lanka",
          isVerified: true,
        });
        await company.save();
        companyData = {
          id: company._id,
          companyName: company.companyName,
          logo: company.logo,
        };
      }
    } else {
      // Update firebaseId if not set
      if (!user.firebaseId && firebaseId) {
        user.firebaseId = firebaseId;
        await user.save();
      }

      // If user requested role upgrade to company or is already company
      if (role === "company" && user.role !== "company" && user.role !== "admin") {
        user.role = "company";
        await user.save();
      }

      if (user.role === "company") {
        let company = await Company.findOne({ user: user._id }).select(
          "_id companyName logo phone address contactEmail"
        );
        if (!company) {
          company = new Company({
            user: user._id,
            companyName: companyName || `${user.name} Rentals`,
            contactEmail: email,
            phone: phone || "",
            address: address || "Colombo, Sri Lanka",
            isVerified: true,
          });
          await company.save();
        }
        companyData = {
          id: company._id,
          companyName: company.companyName,
          logo: company.logo,
        };
      }
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      company: companyData,
    });
  } catch (err) {
    console.error("Firebase login error:", err);
    res.status(500).json({ msg: "Firebase authentication failed" });
  }
});

// Update User Profile
router.post("/update-profile", async (req, res) => {
  try {
    const { userId, name, phone, address } = req.body;

    if (!userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    const updateFields = {};
    if (name && name.trim()) updateFields.name = name.trim();

    // Find user and update
    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Also update associated company details if applicable
    if (user.role === "company" && (phone || address || name)) {
      await Company.findOneAndUpdate(
        { user: user._id },
        {
          ...(phone ? { phone } : {}),
          ...(address ? { address } : {}),
        }
      );
    }

    res.json({
      msg: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ msg: "Failed to update profile" });
  }
});

module.exports = router;
