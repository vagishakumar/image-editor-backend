const express = require("express");
const multer = require("multer");
const router = express.Router();
const Bluebird = require("bluebird");
const { uploadResponseImg } = require("./removeBg");

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("api_token", process.env.BRIA_API_TOKEN);

const upload = multer({ storage: multer.memoryStorage() });

router.post("/eraser", upload.none(), async (req, res) => {
  const imageUrl = (req.body && req.body.imageUrl) || "";
  const maskUrl = (req.body && req.body.maskUrl) || "";

  if (!imageUrl || !maskUrl) {
    res.send({ message: "no image" });
    return;
  }

  const raw = JSON.stringify({
    image_url: imageUrl,
    mask_url: maskUrl,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const resp = await fetch(
    "https://engine.prod.bria-api.com/v1/eraser",
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

router.post("/generator", upload.none(), async (req, res) => {
  const prompt = (req.body && req.body.prompt) || "";

  if (!prompt) {
    res.send({ message: "no prompt" });
    return;
  }

  const raw = JSON.stringify({
    prompt: prompt,
    num_results: 1,
    sync: true,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const resp = await fetch(
    "https://engine.prod.bria-api.com/v1/text-to-image/base/2.3",
    requestOptions
  );

  const data = await resp.json();

  const result = data.result[0];
  const { urls } = result;

  if (!(Array.isArray(urls) && urls.length)) {
    res.send({ data });
    return;
  }

  const resultUrls = await Bluebird.map(urls, async (url) => {
    return uploadResponseImg(url);
  });

  res.send({ data, resultUrl: resultUrls[0], resultUrls });
});

router.post("/modifier", upload.none(), async (req, res) => {
  const prompt = (req.body && req.body.prompt) || "";
  const imageUrl = (req.body && req.body.imageUrl) || "";
  const maskUrl = (req.body && req.body.maskUrl) || "";

  if (!prompt) {
    res.send({ message: "no prompt" });
    return;
  }

  if (!imageUrl || !maskUrl) {
    res.send({ message: "no image" });
    return;
  }

  const raw = JSON.stringify({
    image_url: imageUrl,
    mask_url: maskUrl,
    mask_type: "automatic",
    prompt: prompt,
    negative_prompt: "",
    num_results: 1,
    sync: true,
    seed: 0,
    content_moderation: false,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const resp = await fetch(
    "https://engine.prod.bria-api.com/v1/gen_fill",
    requestOptions
  );

  const data = await resp.json();

  const { urls } = data;

  if (!(Array.isArray(urls) && urls.length)) {
    res.send({ data });
    return;
  }

  const resultUrls = await Bluebird.map(urls, async (url) => {
    return uploadResponseImg(url);
  });

  //   console.log("resultUrls", resultUrls);
  res.send({ data, resultUrl: resultUrls[0], resultUrls });
});

router.post("/backgroundGen", upload.none(), async (req, res) => {
  const prompt = (req.body && req.body.prompt) || "";
  const imageUrl = (req.body && req.body.imageUrl) || "";

  if (!prompt) {
    console.log("no prompt");
    res.send({ message: "no prompt" });
    return;
  }

  if (!imageUrl) {
    console.log("no image");
    res.send({ message: "no image" });
    return;
  }

  const raw = JSON.stringify({
    bg_prompt: prompt,
    num_results: 1,
    sync: true,
    image_url: imageUrl,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const resp = await fetch(
    "https://engine.prod.bria-api.com/v1/background/replace",
    requestOptions
  );

  const data = await resp.json();
  const { result } = data;

  if (!(Array.isArray(result) && result.length)) {
    res.send({ data });
    return;
  }

  const urls = result[0];

  const resultUrls = await Bluebird.map(result, async (item) => {
    const url = item[0];
    return uploadResponseImg(url);
  });

  //   console.log("resultUrls", resultUrls);
  res.send({ data, resultUrl: resultUrls[0], resultUrls });
});

module.exports = router;
