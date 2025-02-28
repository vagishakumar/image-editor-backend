require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const { router: aiRoutes } = require("../routes/removeBg");
const areaEraser = require("../routes/areaEraser");

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const allowedOrigins = [
  "http://localhost:3002",
  "http://localhost:3000",
  "https://image-editor-socialpilot.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies and headers
  })
);

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
