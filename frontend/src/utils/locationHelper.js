// Helper to format location for public viewers: displays only City/District/Sri Lanka
// instead of full street addresses (e.g. "No. 12, Galle Road, Colombo 03" -> "Colombo")

export const sriLankaDistricts = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya"
];

const townToDistrictMap = {
  boralesgamuwa: "Colombo", maharagama: "Colombo", dehiwala: "Colombo",
  "mount lavinia": "Colombo", moratuwa: "Colombo", nugegoda: "Colombo",
  kottawa: "Colombo", homagama: "Colombo", kaduwela: "Colombo", malabe: "Colombo",
  battaramulla: "Colombo", rajagiriya: "Colombo", "sri jayawardenepura": "Colombo",
  kotte: "Colombo", kolonnawa: "Colombo", hanwella: "Colombo", avissawella: "Colombo",
  padukka: "Colombo", piliyandala: "Colombo", kesbewa: "Colombo", ratmalana: "Colombo",
  wellawatte: "Colombo", bambalapitiya: "Colombo", kollupitiya: "Colombo", borella: "Colombo",
  cinnamon: "Colombo", dematagoda: "Colombo", maradana: "Colombo", fort: "Colombo",
  pettah: "Colombo", kotahena: "Colombo", mattakkuliya: "Colombo", angoda: "Colombo",
  athurugiriya: "Colombo", pannipitiya: "Colombo", hokandara: "Colombo", thalawathugoda: "Colombo",
  pelawatte: "Colombo", kohuwala: "Colombo", kalubowila: "Colombo", nawala: "Colombo",
  kirulapone: "Colombo",
  negombo: "Gampaha", katunayake: "Gampaha", wattala: "Gampaha", "ja-ela": "Gampaha",
  jaela: "Gampaha", kandana: "Gampaha", kelaniya: "Gampaha", peliyagoda: "Gampaha",
  kiribathgoda: "Gampaha", kadawatha: "Gampaha", biyagama: "Gampaha", ragama: "Gampaha",
  gampaha: "Gampaha", minuwangoda: "Gampaha", mirigama: "Gampaha", veyangoda: "Gampaha",
  nittambuwa: "Gampaha", seeduwa: "Gampaha", mahabage: "Gampaha", yakkala: "Gampaha",
  panadura: "Kalutara", wadduwa: "Kalutara", kalutara: "Kalutara", beruwala: "Kalutara",
  aluthgama: "Kalutara", horana: "Kalutara", bandaragama: "Kalutara", matugama: "Kalutara",
  kandy: "Kandy", peradeniya: "Kandy", katugastota: "Kandy", gampola: "Kandy",
  kundasale: "Kandy", digana: "Kandy", akurana: "Kandy", kadugannawa: "Kandy",
  matale: "Matale", dambulla: "Matale", sigiriya: "Matale",
  "nuwara eliya": "Nuwara Eliya", hatton: "Nuwara Eliya", ella: "Badulla",
  badulla: "Badulla", bandarawela: "Badulla", haputale: "Badulla",
  galle: "Galle", hikkaduwa: "Galle", unawatuna: "Galle", bentota: "Galle", ambalangoda: "Galle",
  matara: "Matara", mirissa: "Matara", weligama: "Matara", dickwella: "Matara",
  tangalle: "Hambantota", hambantota: "Hambantota", yala: "Hambantota",
  kurunegala: "Kurunegala", kuliyapitiya: "Kurunegala",
  anuradhapura: "Anuradhapura", polonnaruwa: "Polonnaruwa",
  trincomalee: "Trincomalee", nilaveli: "Trincomalee",
  batticaloa: "Batticaloa", "arugam bay": "Ampara", ampara: "Ampara",
  jaffna: "Jaffna",
};

/**
 * Strips street-level details (e.g. "No. 12, Galle Road, Colombo 03" -> "Colombo")
 * so only city / district / general region is shown to website visitors.
 */
export const formatPublicLocation = (rawLocation) => {
  if (!rawLocation || typeof rawLocation !== "string") return "Sri Lanka";

  const trimmed = rawLocation.trim();
  if (!trimmed) return "Sri Lanka";

  const lower = trimmed.toLowerCase();

  // 1. Direct district match
  for (const d of sriLankaDistricts) {
    if (lower === d.toLowerCase() || lower === `${d.toLowerCase()}, sri lanka`) {
      return d;
    }
  }

  // 2. Check town dictionary match
  for (const [town, dist] of Object.entries(townToDistrictMap)) {
    if (new RegExp(`\\b${town}\\b`, "i").test(lower)) {
      return dist;
    }
  }

  // 3. Fallback check for district contained in string
  for (const d of sriLankaDistricts) {
    if (new RegExp(`\\b${d}\\b`, "i").test(lower)) {
      return d;
    }
  }

  // 4. If comma separated (like "Street, Town, City"), take the last sensible segment before "Sri Lanka"
  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    const candidate = parts[parts.length - 1];
    if (/sri lanka/i.test(candidate) && parts.length > 2) {
      return parts[parts.length - 2].replace(/\d+/g, "").trim() || "Sri Lanka";
    }
    if (!/sri lanka/i.test(candidate)) {
      return candidate.replace(/\d+/g, "").trim() || "Sri Lanka";
    }
  }

  // If nothing else, strip house numbers / "No." prefix
  const clean = trimmed.replace(/^(no\.?|#)\s*\d+[^,]*,?/i, "").trim();
  return clean || "Sri Lanka";
};
