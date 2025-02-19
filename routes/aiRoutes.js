const express = require("express");
const multer = require("multer");

const FormData = require("form-data");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/removebg", upload.single("image"), async (req, res) => {
  const imageUrl =
    "https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg";
  const form = new FormData();
  form.append(
    "image_url",
    "https://awsstage-test-ap-south-1.s3.ap-south-1.amazonaws.com/114972/932262e3-7a74-4dd8-9b98-fd83fda98b8c.jpeg"
  );
  //   try {
  const resp = await fetch(
    `https://engine.prod.bria-api.com/v1/background/remove`,
    {
      method: "POST",
      headers: { api_token: "99712e743d394fe792889d2b0bae2a12" },
      body: form,
    }
  );

  console.log("resp  => ", resp);

  // res.set("Content-Type", "image/png");
  res.send(resp.data);
  //   }
});

module.exports = router;
