const express = require("express");
const mongoose = require("mongoose");
const Post = require("./models/post");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

require("dotenv/config");

const app = express();

class apiKeyError extends Error {
  constructor(msg) {
    super();
    this.errorMessage = msg;
  }
}

app.use(cors());
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
    const API_KEY = req.body.API_KEY;
    if (API_KEY != process.env.API_KEY) {
      throw new apiKeyError("You are not authorized!");
    }
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
        gender: req.body.gender,
      };

      let post = new Post(data);
      let savedPost = await post.save();
      // console.log(savedPost);
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    console.log(e);
    if (e instanceof apiKeyError) {
      res.sendStatus(403);
      res.send;
    } else {
      res.sendStatus(400);
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Listening to Port ", PORT);
});
