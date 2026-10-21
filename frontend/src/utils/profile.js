import { Car, KeyRound, Building2 } from "lucide-react";

// Same rules as backend/utils/profile.js: every account needs a mobile number,
// an address and an NIC (or passport number for visitors).

export const ACCOUNT_TYPES = [
  {
    role: "renter",
    icon: Car,
    title: "I want to rent a vehicle",
    desc: "Find bikes, tuk-tuks, cars and vans and book them in minutes.",
  },
  {
    role: "owner",
    icon: KeyRound,
    title: "I want to list my own vehicle",
    desc: "For individuals renting out one or two personal vehicles.",
  },
  {
    role: "company",
    icon: Building2,
    title: "I run a rent-a-car company",
    desc: "Manage your whole fleet and rentals from one dashboard.",
  },
];

export const isValidPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 12;
};

export const isValidIdNumber = (value) => {
  const id = String(value || "").replace(/[\s-]/g, "").toUpperCase();
  // Digits ending in V/X can only be an old-format NIC, so a mistyped NIC isn't taken as a passport
  if (/^\d+[VX]$/.test(id)) return /^\d{9}[VX]$/.test(id);
  return /^\d{12}$/.test(id) || /^[A-Z0-9]{6,12}$/.test(id);
};

export const isValidAddress = (address) => String(address || "").trim().length >= 3;

// Returns the first problem as a message, or "" when everything is fine
export const profileError = ({ phone, address, nic }) => {
  if (!isValidPhone(phone)) return "Please enter a valid mobile number, e.g. 077 123 4567.";
  if (!isValidAddress(address)) return "Please enter your address.";
  if (!isValidIdNumber(nic)) return "Please enter a valid NIC (e.g. 199012345678 or 901234567V) or passport number.";
  return "";
};

// Signed-in users who still owe us a role or required details
export const needsProfileCompletion = (user) =>
  Boolean(user && user.role !== "admin" && (user.profileComplete === false || user.needsRole));
