import axios from "axios";
import { API_URL } from "../config";

// Shrink big phone photos (max 1600px, JPEG 85%) so uploads are fast on mobile data
const compressImage = (file) =>
  new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });

// Uploads one vehicle photo and returns its permanent URL. Throws a readable Error on failure.
export const uploadVehicleImage = async (file) => {
  if (!file?.type?.startsWith("image/")) throw new Error("Please choose an image file (JPG, PNG or WebP).");
  if (file.size > 10 * 1024 * 1024) throw new Error("Photo is larger than 10MB.");
  const data = new FormData();
  data.append("image", await compressImage(file));
  try {
    const res = await axios.post(`${API_URL}/api/upload`, data);
    if (!res.data?.url) throw new Error("Upload did not return an image URL.");
    return res.data.url;
  } catch (err) {
    throw new Error(err.response?.data?.msg || err.message || "Upload failed.");
  }
};
