// What every account must have before it can use the site:
// a mobile number, an address and an NIC (or passport for visitors).

const phoneDigits = (phone) => String(phone || "").replace(/\D/g, "");

const isValidPhone = (phone) => {
  const digits = phoneDigits(phone);
  return digits.length >= 9 && digits.length <= 12;
};

// Sri Lankan NIC: old format 9 digits + V/X, new format 12 digits.
// Anything else is treated as a passport number (letters and digits, 6–12 long).
const normalizeIdNumber = (value) => String(value || "").replace(/[\s-]/g, "").toUpperCase();

const isValidIdNumber = (value) => {
  const id = normalizeIdNumber(value);
  // Digits ending in V/X can only be an old-format NIC, so a mistyped NIC isn't taken as a passport
  if (/^\d+[VX]$/.test(id)) return /^\d{9}[VX]$/.test(id);
  return /^\d{12}$/.test(id) || /^[A-Z0-9]{6,12}$/.test(id);
};

const isValidAddress = (address) => String(address || "").trim().length >= 3;

const missingProfileFields = (user) => {
  const missing = [];
  if (!isValidPhone(user?.phone)) missing.push("phone");
  if (!isValidAddress(user?.address)) missing.push("address");
  if (!isValidIdNumber(user?.nic)) missing.push("nic");
  return missing;
};

module.exports = {
  isValidPhone,
  isValidIdNumber,
  isValidAddress,
  normalizeIdNumber,
  missingProfileFields,
};
