// Lightweight security middleware (no extra dependencies)

// Strips MongoDB operators ("$gt", "$ne", ...) and dotted keys from user input
// so request data can never change the shape of a database query.
const stripOperators = (value) => {
  if (Array.isArray(value)) return value.map(stripOperators);
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
      } else {
        value[key] = stripOperators(value[key]);
      }
    }
  }
  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) stripOperators(req.body);
  // This API only uses flat query strings: keep plain text values, drop nested objects
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      const value = req.query[key];
      if (Array.isArray(value)) req.query[key] = typeof value[0] === "string" ? value[0] : "";
      else if (typeof value !== "string") delete req.query[key];
    }
    stripOperators(req.query);
  }
  if (req.params) stripOperators(req.params);
  next();
};

// Basic security headers
const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
};

// In-memory rate limiter: `max` requests per `windowMs` per IP for the routes it guards
const rateLimit = ({ windowMs, max, message }) => {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ msg: message });
    }
    next();
  };
};

module.exports = { sanitizeInput, securityHeaders, rateLimit };
