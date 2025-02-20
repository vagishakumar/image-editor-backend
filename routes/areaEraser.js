const express = require("express");
const multer = require("multer");
const router = express.Router();
const uploadResponseImg = require("./removeBg");

const myHeaders = new Headers();
myHeaders.append("api_token", "99712e743d394fe792889d2b0bae2a12");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/eraser", upload.none(), async (req, res) => {
  console.log("req.body", req.body);

  const imageUrl = (req.body && req.body.imageUrl) || "";
  const maskUrl = (req.body && req.body.maskUrl) || "";

  if (!imageUrl || !maskUrl) {
    console.log("no image");
    res.send({ message: "no image" });
    return;
  }

  console.log("imageUrl", imageUrl);
  console.log("maskUrl", maskUrl);

  const formdata = new FormData();
  formdata.append("mask_url", maskUrl);
  formdata.append("image_url", imageUrl);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      mask_url: maskUrl,
      image_url: imageUrl,
    }),
    redirect: "follow",
  };

  const resp = await fetch(
    "https://engine.prod.bria-api.com/v1/eraser",
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

module.exports = router;
