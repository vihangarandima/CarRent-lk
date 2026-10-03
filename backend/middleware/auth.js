const jwt = require("jsonwebtoken");

const readToken = (req) =>
  req.header("x-auth-token") ||
  req.header("Authorization")?.replace("Bearer ", "");

// Rejects the request unless it carries a valid JWT
const auth = (req, res, next) => {
  const token = readToken(req);
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Attaches req.user when a valid JWT is present, otherwise continues anonymously
const optionalAuth = (req, res, next) => {
  const token = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
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
