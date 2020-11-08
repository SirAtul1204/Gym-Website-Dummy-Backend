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
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Working!");
});

app.get("/findByPhone", (req, res) => {
  const API_KEY = req.query.API_KEY;
  if (API_KEY !== process.env.API_KEY) {
    res.send(401);
  } else {
    Post.find({ phoneNumber: req.query.phoneNumber }, (error, data) => {
      if (error) {
        res.sendStatus(404);
      } else {
        res.send(data[0]);
      }
    });
  }
});

app.get("/findByEmail", (req, res) => {
  const API_KEY = req.query.API_KEY;
  if (API_KEY !== process.env.API_KEY) {
    res.sendStatus(401);
  } else {
    Post.find({ email: req.query.email }, (error, data) => {
      if (error) {
        res.sendStatus(404);
      } else {
        res.send(data[0]);
      }
    });
  }
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
        email: req.body.email,
      };

      let post = new Post(data);
      let savedPost = await post.save();
      // console.log(savedPost);
      let findRes = await axios.get(
        "https://gym-website-dummy-backend.herokuapp.com/findByPhone",
        {
          params: {
            API_KEY: process.env.API_KEY,
            phoneNumber: req.body.phoneNumber,
          },
        }
      );

      console.log(findRes);

      let mailerRes = await axios.post(
        "https://mailer-javascript.herokuapp.com/withQRcode",
        {
          id: findRes.data._id,
          email: findRes.data.email,
        }
      );

      if (mailerRes) {
        console.log("Mailing Successful");
      }
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
