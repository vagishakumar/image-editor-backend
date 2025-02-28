const FormData = require("form-data");
const axios = require("axios");

const apiKey = process.env.IMG_BB_API_KEY || "";

async function uploadImageToImgbb(fileBuffer) {
  try {
    // Ensure req.file exists
    if (!fileBuffer) {
      throw new Error("No file provided");
    }

    // Create a new instance of FormData
    const formData = new FormData();

    // Option 1: Upload as a base64 encoded string (commonly used by imgbb)
    // Convert the buffer to a base64 string
    const base64Image = fileBuffer.toString("base64");
    formData.append("image", base64Image);

    // Option 2: If the API supports binary uploads, you could alternatively try:
    // formData.append('image', req.file.buffer, {
    //   filename: req.file.originalname,
    //   contentType: req.file.mimetype,
    // });

    // Make the POST request to imgbb API
    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Accept: "application/json",
        },
        params: {
          key: apiKey,
        },
      }
    );

    // Get the URL from the response
    if (response.data && response.data.data && response.data.data.url) {
      console.log("Image uploaded successfully!");
      console.log("Image URL:", response.data.data.url);
      return response.data.data.url;
    } else {
      console.error("Failed to upload image", response.data);
      throw new Error("Image upload failed");
    }
  } catch (error) {
    console.error("Error uploading image:");
    throw error;
  }
}

module.exports = uploadImageToImgbb;
