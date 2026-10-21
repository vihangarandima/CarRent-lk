// Tidy display text for values that hosts type in freely ("auto", "petrol", ...)

const titleCase = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const formatGearbox = (value) => {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "";
  if (v === "auto" || v === "automatic" || v === "at") return "Automatic";
  if (v === "manual" || v === "mt") return "Manual";
  return titleCase(v);
};

export const formatFuel = (value) => {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return "";
  if (v === "ev") return "Electric";
  return titleCase(v);
};
