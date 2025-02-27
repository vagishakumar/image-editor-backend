const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dcwwmcunh",
  api_key: "479877815518324",
  api_secret: "iqj6EVeVxKz6vNxfRGW20k2P_FA",
});

async function uploadImageCloudinary(fileBuffer) {
  try {
    // Convert file buffer to Base64
    const base64Image = `data:image/jpeg;base64,${fileBuffer.toString(
      "base64"
    )}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: "uploads", // Optional: Organize images in a folder
    });

    console.log("Upload successful:", uploadResult.secure_url);
    return uploadResult.secure_url; // Return uploaded image URL
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error; // Rethrow error for handling in route
  }
}

module.exports = uploadImageCloudinary;
