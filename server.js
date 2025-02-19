// server/server.js
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const aiRoutes = require("./routes/removeBg");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use("/api/ai", aiRoutes);

// API endpoint for image processing (example: resize)
app.post("/api/resize", upload.single("image"), async (req, res) => {
  try {
    const { width, height } = req.body;
    const resizedImage = await sharp(req.file.buffer)
      .resize(parseInt(width), parseInt(height))
      .toBuffer();

    // Set the proper headers and return the image
    res.set("Content-Type", "image/png");
    res.send(resizedImage);
  } catch (error) {
    res.status(500).send({ error: "Image processing failed" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
