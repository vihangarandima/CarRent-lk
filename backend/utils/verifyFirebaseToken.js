const jwt = require("jsonwebtoken");

// Firebase project id is public (it ships in the frontend bundle)
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "yamucarrentals-2e798";
const CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let cachedCerts = null;
let certsExpireAt = 0;

const getCerts = async () => {
  if (cachedCerts && Date.now() < certsExpireAt) return cachedCerts;
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error("Could not fetch Firebase signing keys");
  cachedCerts = await res.json();
  const maxAge = /max-age=(\d+)/.exec(res.headers.get("cache-control") || "");
  certsExpireAt = Date.now() + (maxAge ? Number(maxAge[1]) * 1000 : 3600 * 1000);
  return cachedCerts;
};

// Verifies a Firebase ID token and returns its decoded claims.
// Throws if the token is forged, expired, or issued for another project.
const verifyFirebaseToken = async (idToken) => {
  if (!idToken) throw new Error("Missing Firebase ID token");
  const header = jwt.decode(idToken, { complete: true })?.header;
  if (!header?.kid) throw new Error("Malformed Firebase ID token");

  const certs = await getCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error("Unknown Firebase signing key");

  const claims = jwt.verify(idToken, cert, {
    algorithms: ["RS256"],
    audience: PROJECT_ID,
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
  });
  if (!claims.sub) throw new Error("Firebase token has no subject");
  if (!claims.email || claims.email_verified === false) {
    throw new Error("Firebase account email is not verified");
  }
  return claims;
};

module.exports = verifyFirebaseToken;
