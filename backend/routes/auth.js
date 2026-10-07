const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");
const OTP = require("../models/OTP");
const { sendEmail } = require("../utils/mailer");
const { auth, escapeRegex } = require("../middleware/auth");
const verifyFirebaseToken = require("../utils/verifyFirebaseToken");

// Roles a user may pick for themselves. "admin" is only granted by an existing admin.
const SELF_ASSIGNABLE_ROLES = ["renter", "owner", "company"];
const MAX_OTP_ATTEMPTS = 5;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

// Case-insensitive lookup so accounts created before emails were normalised still match
const findUserByEmail = (email) =>
  User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, "i") });

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  profileImage: user.profileImage || "",
});

const companySummary = (company) =>
  company
    ? { id: company._id, companyName: company.companyName, logo: company.logo }
    : null;

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, password, role, companyName, phone, address, otp } = req.body;
    const email = normalizeEmail(req.body.email);
    const resolvedRole = SELF_ASSIGNABLE_ROLES.includes(role) ? role : "renter";

    if (!name || !name.trim() || !email || !password) {
      return res.status(400).json({ msg: "Name, email and password are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters." });
    }
    if (resolvedRole === "company" && !(companyName || "").trim()) {
      return res
        .status(400)
        .json({ msg: "Company name is required for company accounts" });
    }

    // Verify OTP code (limited attempts to stop brute forcing)
    const otpError = await checkOtp(email, otp);
    if (otpError) return res.status(400).json({ msg: otpError });

    let user = await findUserByEmail(email);
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    user = new User({
      name: name.trim(),
      email,
      password: await bcrypt.hash(password, salt),
      phone: (phone || "").trim(),
      role: resolvedRole,
    });
    await user.save();

    // If registering as a company, create the Company profile too
    let company = null;
    if (resolvedRole === "company") {
      company = new Company({
        user: user._id,
        companyName: companyName.trim(),
        contactEmail: email,
        phone: phone || "",
        address: address || "",
      });
      await company.save();
    }

    res.json({
      token: signToken(user),
      user: publicUser(user),
      company: companySummary(company),
    });

    // Remove OTP record after successful registration
    try {
      await OTP.deleteOne({ email });
    } catch (err) {
      console.warn("Failed to delete OTP record:", err.message);
    }
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error during registration" });
  }
});

const otpEmailHtml = (otp, heading, intro) => `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ea580c; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Yamu <span style="color: #0f172a;">Car Rentals</span></h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Sri Lanka's Premier Car Sharing Marketplace</p>
          </div>
          <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-bottom: 8px;">${heading}</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">${intro} This code will expire in <strong>5 minutes</strong>:</p>
          <div style="background: #fff7ed; border: 2px dashed #f97316; padding: 18px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #ea580c; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-top: 24px;">If you did not request this code, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #cbd5e1; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} Yamu Car Rentals LK. All rights reserved.</p>
        </div>
      `;

// Generates a fresh code for this email, stores it and emails it
const issueOtp = async (email, subject, heading, intro) => {
  const hasBrevo = Boolean(process.env.BREVO_API_KEY?.trim());
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasSmtp = Boolean(process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim());

  if (!hasBrevo && !hasResend && !hasSmtp) {
    const err = new Error(
      "Email service is not configured on this server. Please add BREVO_API_KEY or EMAIL_USER and EMAIL_PASS to environment variables."
    );
    err.code = "NO_SMTP";
    throw err;
  }

  // One code per email every 30 seconds (stops double-taps from invalidating a code just sent)
  const recent = await OTP.findOne({ email }).select("createdAt");
  if (recent && Date.now() - new Date(recent.createdAt).getTime() < 30 * 1000) {
    const err = new Error("A code was just sent to this email. Please wait 30 seconds before requesting another.");
    err.code = "OTP_COOLDOWN";
    throw err;
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  // Save or update existing OTP in database (resets the attempt counter)
  await OTP.findOneAndUpdate(
    { email },
    { otp, attempts: 0, createdAt: Date.now() },
    { upsert: true, new: true },
  );

  try {
    await sendEmail({
      to: email,
      subject,
      html: otpEmailHtml(otp, heading, intro),
    });
  } catch (err) {
    // Nothing was sent, so drop the code: otherwise the 30-second cooldown would block
    // the user's retry with "a code was just sent" when no email ever arrived.
    await OTP.deleteOne({ email }).catch(() => {});
    throw err;
  }
};

// Returns null when the code is right, otherwise an error message
const checkOtp = async (email, otp) => {
  const record = await OTP.findOne({ email });
  if (!record) return "Invalid or expired OTP code!";
  if (record.otp !== String(otp || "").trim()) {
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await OTP.deleteOne({ _id: record._id });
      return "Too many incorrect codes. Please request a new verification code.";
    }
    await record.save();
    return "Invalid or expired OTP code!";
  }
  return null;
};

// Message shown to the customer. Technical details stay in the server log.
const otpErrorMessage = (err) => {
  if (err.code === "OTP_COOLDOWN") return err.message;
  if (err.code === "NO_SMTP") {
    return "Email service is not configured on this server. Please add BREVO_API_KEY or EMAIL_USER/EMAIL_PASS in your hosting environment.";
  }
  const isAuthErr = err && (err.code === "EAUTH" || err.responseCode === 535);
  if (isAuthErr) {
    return "SMTP authentication failed. Please check EMAIL_USER and EMAIL_PASS (Gmail App Password) in your hosting dashboard.";
  }
  return `Failed to send verification email: ${err.message || "Connection error. Please try again."}`;
};

// Send Verification OTP
router.post("/send-otp", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ msg: "Please enter a valid email address" });
    }

    // Check if email already registered
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: "An account with this email already exists. Please log in instead." });
    }

    await issueOtp(
      email,
      "Your Yamu Car Rentals Verification Code",
      "Verify Your Email",
      "Use the 6-digit verification code below to complete your registration."
    );
    res.json({ msg: "Verification OTP sent to your email." });
  } catch (err) {
    console.error("OTP Send Error:", err.code, err.message);
    res.status(err.code === "OTP_COOLDOWN" ? 429 : 500).json({ msg: otpErrorMessage(err) });
  }
});

// Forgot password: email a reset code to an existing account
router.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ msg: "Please enter your email address" });

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ msg: "No account found with this email address." });
    }

    await issueOtp(
      email,
      "Reset your Yamu Car Rentals password",
      "Reset Your Password",
      "Use the 6-digit code below to set a new password for your account."
    );
    res.json({ msg: "A password reset code has been sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err.code, err.message);
    res.status(err.code === "OTP_COOLDOWN" ? 429 : 500).json({ msg: otpErrorMessage(err) });
  }
});

// Reset password with the emailed code
router.post("/reset-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ msg: "Email, code and new password are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters." });
    }

    const otpError = await checkOtp(email, otp);
    if (otpError) return res.status(400).json({ msg: otpError });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ msg: "Account not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    await OTP.deleteOne({ email });

    res.json({ msg: "Password updated. You can now sign in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error resetting password" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter your email and password" });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    // Accounts created through Google have no usable password
    if (!user.password || !user.password.startsWith("$2")) {
      return res.status(400).json({
        msg: "This account was created with Google. Please use 'Continue with Google' to sign in.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    // If company, fetch company id too
    let company = null;
    if (user.role === "company") {
      company = await Company.findOne({ user: user._id }).select("_id companyName logo");
    }

    res.json({
      token: signToken(user),
      user: publicUser(user),
      company: companySummary(company),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

// Firebase (Google) Login Route
// The client must send the Firebase ID token; identity is taken from the verified token,
// never from client-supplied email fields.
router.post("/firebase-login", async (req, res) => {
  try {
    const { idToken, name, role, companyName, phone, address } = req.body;

    let claims;
    try {
      claims = await verifyFirebaseToken(idToken);
    } catch (verifyErr) {
      console.warn("Firebase token rejected:", verifyErr.message);
      return res
        .status(401)
        .json({ msg: "Google sign-in could not be verified. Please try again." });
    }

    const email = normalizeEmail(claims.email);
    const firebaseId = claims.sub;
    const requestedRole = SELF_ASSIGNABLE_ROLES.includes(role) ? role : null;

    let user = await findUserByEmail(email);
    let company = null;

    if (!user) {
      user = new User({
        name: (name || claims.name || email.split("@")[0]).trim(),
        email,
        firebaseId,
        phone: (phone || "").trim(),
        role: requestedRole || "renter",
      });
      await user.save();
    } else {
      if (!user.firebaseId) {
        user.firebaseId = firebaseId;
      }
      // A renter who signs up again as a lister gets upgraded (never touches admins)
      if (
        requestedRole &&
        requestedRole !== "renter" &&
        (user.role === "renter" || (user.role === "owner" && requestedRole === "company"))
      ) {
        user.role = requestedRole;
      }
      await user.save();
    }

    if (user.role === "company") {
      company = await Company.findOne({ user: user._id }).select("_id companyName logo");
      if (!company) {
        company = new Company({
          user: user._id,
          companyName: (companyName || "").trim() || `${user.name} Rentals`,
          contactEmail: email,
          phone: phone || "",
          address: address || "",
        });
        await company.save();
      }
    }

    res.json({
      token: signToken(user),
      user: publicUser(user),
      company: companySummary(company),
    });
  } catch (err) {
    console.error("Firebase login error:", err);
    res.status(500).json({ msg: "Google authentication failed" });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile data
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    let companyData = null;
    if (user.role === "company") {
      const company = await Company.findOne({ user: user._id }).select(
        "_id companyName logo phone address"
      );
      if (company) {
        companyData = {
          id: company._id,
          companyName: company.companyName,
          logo: company.logo,
        };
      }
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      },
      company: companyData,
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update User Profile
// Users can only ever update their own profile (identity comes from the JWT)
router.post("/update-profile", auth, async (req, res) => {
  try {
    const { name, phone, address, profileImage } = req.body;
    const userId = req.user.id;

    const updateFields = {};
    if (typeof name === "string" && name.trim()) updateFields.name = name.trim();
    if (typeof phone === "string") updateFields.phone = phone.trim();
    if (typeof profileImage === "string") updateFields.profileImage = profileImage;

    // Find user and update
    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Also update associated company details if applicable
    if (user.role === "company" && (phone || address || name || profileImage)) {
      await Company.findOneAndUpdate(
        { user: user._id },
        {
          ...(phone ? { phone } : {}),
          ...(address ? { address } : {}),
          ...(profileImage ? { logo: profileImage } : {}),
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
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ msg: "Failed to update profile" });
  }
});

module.exports = router;
