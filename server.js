const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const { router: aiRoutes } = require("./routes/removeBg");
const areaEraser = require("./routes/areaEraser");

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));

app.use("/api/ai", aiRoutes);
app.use("/api/ai", areaEraser);

app.post("/api/resize", upload.single("image"), async (req, res) => {
  try {
    const { width, height } = req.body;
    const resizedImage = await sharp(req.file.buffer)
      .resize(parseInt(width), parseInt(height))
      .toBuffer();

    res.set("Content-Type", "image/png");
    res.send(resizedImage);
  } catch (error) {
    res.status(500).json({ error: "Image processing failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Image Editing AI Backend 🚀");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports.handler = serverless(app);
