import { API_URL } from "../config";

export const CATEGORY_FALLBACK_IMAGES = {
  car: "https://res.cloudinary.com/gjjnq5g0/image/upload/v1790524186/carrents/defaults/njzonjz9pb5swcki6per.png",
  "mini-car": "https://res.cloudinary.com/gjjnq5g0/image/upload/v1790524197/carrents/defaults/nlthlhvfralvpvnhbbdo.png",
  "premium-car": "https://res.cloudinary.com/gjjnq5g0/image/upload/v1790524207/carrents/defaults/uzke0ksf5zwzufph6ucp.png",
  "mini-van": "https://res.cloudinary.com/gjjnq5g0/image/upload/v1790524234/carrents/defaults/zkgwkpwwir7l8ixicvjn.png",
  van: "https://res.cloudinary.com/gjjnq5g0/image/upload/v1790524269/carrents/defaults/itsq4tlqulctne8pgyqb.png",
  threewheeler: "https://res.cloudinary.com/gjjnq5g0/image/upload/v1790524320/carrents/defaults/a3az0yk5atobp1ci2e4d.png",
  bicycle: "https://res.cloudinary.com/gjjnq5g0/image/upload/v1790524342/carrents/defaults/bf3pg6qy5r6r7wjdix6x.png",
  others: "https://res.cloudinary.com/gjjnq5g0/image/upload/v1790524186/carrents/defaults/njzonjz9pb5swcki6per.png",
};

export const DEFAULT_CAR_IMAGE = CATEGORY_FALLBACK_IMAGES.car;

/**
 * Injects dynamic Cloudinary transformations on the fly:
 * - f_auto: Serves modern WebP or AVIF based on browser support
 * - q_auto: Intelligent compression reducing file sizes by ~85-95%
 * - w_700: Downscales high-res 4000px camera photos to crisp card dimensions
 * - c_fill, g_auto: Perfectly centers the vehicle
 */
export const optimizeCloudinaryUrl = (url, width = 700) => {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    // Avoid double transformation if already present
    if (!url.includes("/image/upload/f_auto") && !url.includes("/image/upload/w_")) {
      return url.replace(
        "/image/upload/",
        `/image/upload/f_auto,q_auto,w_${width},c_fill,g_auto/`
      );
    }
  }
  return url;
};

/**
 * Resolves vehicle image URLs cleanly:
 * - If already a Cloudinary or remote HTTPS link, returns as-is with auto-compression.
 * - If pointing to the old dead blue car or broken render disk, replaces with category fallback.
 * - If pointing to localhost:5000 in production, swaps it with active API_URL.
 * - If a relative path (/uploads/...), prepends API_URL.
 * - If invalid/empty, returns category-aware cloud placeholder.
 */
export const formatVehicleImageUrl = (imgInput, vehicleType = "car") => {
  const fallback = CATEGORY_FALLBACK_IMAGES[vehicleType] || DEFAULT_CAR_IMAGE;
  let imgUrl = imgInput;
  if (Array.isArray(imgInput)) {
    imgUrl = imgInput.find((img) => typeof img === "string" && img.trim() !== "") || null;
  }

  if (!imgUrl || typeof imgUrl !== "string" || imgUrl.trim() === "") {
    return optimizeCloudinaryUrl(fallback, 700);
  }

  const trimmed = imgUrl.trim();

  // Banish the old blue Fiat 500 & dead render disk links permanently
  if (trimmed.includes("photo-1549317661") || trimmed.includes("carrents-backend.onrender.com")) {
    return optimizeCloudinaryUrl(fallback, 700);
  }

  // If it's a blob/object URL or inline data URI, return as-is
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // If it's a localhost link from an older upload or local DB
  if (trimmed.startsWith("http://localhost:5000") || trimmed.startsWith("http://127.0.0.1:5000")) {
    if (API_URL && !API_URL.includes("localhost")) {
      return trimmed.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/, API_URL.replace(/\/$/, ""));
    }
  }

  // If it's a relative path (/uploads/...)
  if (trimmed.startsWith("/uploads/")) {
    return `${API_URL.replace(/\/$/, "")}${trimmed}`;
  }

  // Automatically optimize Cloudinary URLs to lightweight WebP/AVIF
  return optimizeCloudinaryUrl(trimmed, 700);
};

/**
 * Image onError handler to prevent broken image icons / text
 */
export const handleImageError = (e, fallbackUrl = DEFAULT_CAR_IMAGE) => {
  if (e?.target) {
    e.target.onerror = null; // Prevent infinite error loops
    e.target.src = fallbackUrl;
  }
};
