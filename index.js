const express = require("express");
const mongoose = require("mongoose");
const Post = require("./models/post");
const bodyParser = require("body-parser");
const axios = require("axios");

require("dotenv/config");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Working!");
});

mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to DB");
  }
);

app.post("/", async (req, res) => {
  try {
    let url = process.env.GOOGLE_RECAPTCHA_VERIFY;

    url += req.body.captchaResponse;

    const capthcaVerificationResponse = await axios.post(url);
    let captchaStatus = capthcaVerificationResponse.data.success;

    if (captchaStatus) {
      const data = {
        name: req.body.name,
        age: req.body.age,
        height: req.body.height,
        weight: req.body.weight,
        phoneNumber: req.body.phoneNumber,
      };

      let post = new Post(data);
      let savedPost = await post.save();
      if (savedPost) {
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Listening to Port ", PORT);
});
