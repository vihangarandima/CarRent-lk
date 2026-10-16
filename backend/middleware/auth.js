const jwt = require("jsonwebtoken");
const User = require("../models/User");

const readToken = (req) =>
  req.header("x-auth-token") ||
  req.header("Authorization")?.replace("Bearer ", "");

// Rejects the request unless it carries a valid JWT
const auth = async (req, res, next) => {
  const token = readToken(req);
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Ensure role and core profile fields are attached
    if (!req.user.role) {
      const dbUser = await User.findById(decoded.id).select("role name email phone");
      if (dbUser) {
        req.user.role = dbUser.role;
        req.user.name = dbUser.name;
        req.user.email = dbUser.email;
        req.user.phone = dbUser.phone;
      }
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Attaches req.user when a valid JWT is present, otherwise continues anonymously
const optionalAuth = async (req, res, next) => {
  const token = readToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (!req.user.role) {
        const dbUser = await User.findById(decoded.id).select("role name email phone");
        if (dbUser) {
          req.user.role = dbUser.role;
          req.user.name = dbUser.name;
          req.user.email = dbUser.email;
          req.user.phone = dbUser.phone;
        }
      }
    } catch (err) {
      // ignore invalid token
    }
  }
  next();
};

// Escape user input before using it inside a RegExp
const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { auth, optionalAuth, escapeRegex };
