const express = require("express");
const multer = require("multer");
const router = express.Router();
const uploadImageToImgbb = require("../helpers/uploadImage");

const upload = multer({ storage: multer.memoryStorage() });

const myHeaders = new Headers();
myHeaders.append("api_token", "99712e743d394fe792889d2b0bae2a12");

const axios = require("axios");

const apiKey = "0e2f12d36919f68ec1c3473677d19ee9";

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

async function uploadNoBgImg(url) {
  const buffer = await downloadImage(url);
  const imageUrl = await uploadImageToImgbb(buffer, apiKey);
  return imageUrl;
}

// fetch("https://engine.prod.bria-api.com/v1/background/remove", requestOptions)
//   .then((response) => response.text())
//   .then((result) => console.log(result))
//   .catch((error) => console.error(error));

router.post("/removebg", upload.single("image"), async (req, res) => {
  console.log("req.file", req.file);

  if (!req.file.buffer) {
    console.log("no buffer");
    return;
  }

  const imageUrl = await uploadImageToImgbb(req.file.buffer, apiKey);

  console.log("imageUrl", imageUrl);

  //   res.json({ message: "Image processed successfully", imageUrl });

  //   uploadImage();

  const formdata = new FormData();
  formdata.append(
    "image_url",
    `${imageUrl}`
    // "https://awsstage-test-ap-south-1.s3.ap-south-1.amazonaws.com/114972/932262e3-7a74-4dd8-9b98-fd83fda98b8c.jpeg"
  );

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
  //   .then((response) => response.text())
  //   .then((result) => console.log(result))
  //   .catch((error) => console.error(error));

  console.log("resp", data);

  if (!data.result_url) {
    res.send({ data });
    return;
  }

  const resultUrl = await uploadNoBgImg(data.result_url);

  res.send({ data, resultUrl });
  //   res.send({
  //     message: "ok",
  //   });
});

module.exports = router;
