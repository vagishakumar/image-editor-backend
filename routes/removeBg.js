const express = require("express");
const multer = require("multer");
const router = express.Router();
const uploadImageToCloud = require("../helpers/uploadImageCloudinary");
const uploadImageToImgbb = require("../helpers/uploadImage");

const upload = multer({ storage: multer.memoryStorage() });

const myHeaders = new Headers();
myHeaders.append("api_token", process.env.BRIA_API_TOKEN);

const axios = require("axios");

async function downloadImage(url) {
  try {
    // Fetch the image as an array buffer so we can convert it to a Buffer
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}

async function uploadResponseImg(url) {
  const buffer = await downloadImage(url);
  const imageUrl = await uploadImageToCloud(buffer);
  return imageUrl;
}

router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file.buffer) {
    console.log("no buffer");
    return;
  }
  const imageUrl = await uploadImageToCloud(req.file.buffer);
  res.send({ imageUrl });
});

router.post("/removebg", upload.none(), async (req, res) => {
  console.log("req.body", req.body);
  if (!req.body.imageUrl) {
    console.log("no image");
    res.send({ message: "no image" });
    return;
  }

  const imageUrl = req.body.imageUrl;

  console.log("imageUrl", imageUrl);

  const formdata = new FormData();
  formdata.append("image_url", imageUrl);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  const resp = await fetch(
    "https://engine.prod.bria-api.com/v1/background/remove",
    requestOptions
  );

  const data = await resp.json();

  console.log("resp", data);

  if (!data.result_url) {
    res.send({ data });
    return;
  }

  const resultUrl = await uploadResponseImg(data.result_url);

  res.send({ data, resultUrl });
});

router.post("/increaseResolution", upload.none(), async (req, res) => {
  console.log("req.body", req.body);
  if (!req.body.imageUrl) {
    console.log("no image");
    res.send({ message: "no image" });
    return;
  }

  const query = new URLSearchParams({ desired_increase: "2" }).toString();
  const imageUrl = req.body.imageUrl;

  console.log("imageUrl", imageUrl);

  const formdata = new FormData();
  formdata.append("image_url", imageUrl);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  const resp = await fetch(
    `https://engine.prod.bria-api.com/v1/image/increase_resolution?${query}`,
    requestOptions
  );

  const data = await resp.json();

  console.log("resp", data);

  if (!data.result_url) {
    res.send({ data });
    return;
  }

  const resultUrl = await uploadImageToImgbb(data.result_url);

  res.send({ data, resultUrl });
});

router.post("/removeForeground", upload.none(), async (req, res) => {
  if (!req.body.imageUrl) {
    res.send({ message: "no image" });
    return;
  }

  const imageUrl = req.body.imageUrl;

  const raw = JSON.stringify({ image_url: imageUrl });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const resp = await fetch(
    "https://engine.prod.bria-api.com/v1/erase_foreground",
    requestOptions
  );

  const data = await resp.json();

  if (!data.result_url) {
    res.send({ data });
    return;
  }

  const resultUrl = await uploadResponseImg(data.result_url);
  res.send({ data, resultUrl });
});

router.post("/blurBg", upload.none(), async (req, res) => {
  if (!req.body.imageUrl) {
    res.send({ message: "no image" });
    return;
  }

  const imageUrl = req.body.imageUrl;
  const raw = JSON.stringify({ image_url: imageUrl });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const resp = await fetch(
    "https://engine.prod.bria-api.com/v1/background/blur",
    requestOptions
  );

  const data = await resp.json();

  if (!data.result_url) {
    res.send({ data });
    return;
  }

  const resultUrl = await uploadResponseImg(data.result_url);

  res.send({ data, resultUrl });
});

module.exports = {
  router,
  uploadResponseImg,
};
