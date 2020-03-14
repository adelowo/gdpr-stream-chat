const fs = require("fs");
const express = require("express");
const StreamChat = require("stream-chat").StreamChat;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const omit = require("lodash.omit");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const nodemailer = require("nodemailer");
const User = require("./models");

dotenv.config();

transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_ENABLE_TLS === "0" ? false : true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

transport.verify(function(error, success) {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log("SMTP connection was successfully made");
});

const port = process.env.PORT || 5200;

mongoose.promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

const db = mongoose.connection;

db.on("error", err => {
  console.error(err);
});

db.on("disconnected", () => {
  console.info("Database disconnected!");
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    process.exit(0);
  });
});

const app = express();
app.use(express.json());
app.use(cors());

const client = new StreamChat(process.env.API_KEY, process.env.API_SECRET);

const channel = client.channel("messaging", "gdpr-chat-export", {
  name: "GDPR Chat export",
  created_by: { id: "admin" }
});

app.post("/users/auth", async (req, res) => {
  const { username, password } = req.body;

  if (username === undefined || username.length == 0) {
    res.status(400).send({
      status: false,
      message: "Please provide your username"
    });
    return;
  }

  if (password === undefined || password.length == 0) {
    res.status(400).send({
      status: false,
      message: "Please provide your password"
    });
    return;
  }

  let user = await User.findOne({ username: username.toLowerCase() });

  if (!user) {
    let user = await User.create({
      username: username,
      password: password
    });

    user = omit(user._doc, ["__v", "createdAt", "updatedAt"]); // and remove data we don't need with the lodash omit

    const token = client.createToken(user._id.toString());

    await client.updateUser({ id: user._id, name: username }, token);

    await channel.create();

    await channel.addMembers([user._id, "admin"]);

    delete user.password;

    user.id = user._id;

    res.json({
      status: true,
      user,
      token
    });
    return;
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    res.status(403);
    res.json({ message: "Password does not match", status: false });
    return;
  }

  const token = client.createToken(user._id.toString());

  user = omit(user._doc, ["__v", "createdAt", "updatedAt"]);

  delete user.password;

  user.id = user._id;

  res.json({
    status: true,
    user,
    token
  });
});

app.post("/users/export", async (req, res) => {
  const userID = req.body.user_id;

  const email = req.body.email;

  if (email === undefined || email === "") {
    res
      .status(400)
      .send({ status: true, message: "Please provide your email address" });
    return;
  }

  if (userID == "" || userID === undefined) {
    res
      .status(400)
      .send({ status: false, message: "Please provide your user ID" });
    return;
  }

  try {
    const data = await client.exportUser(userID);

    res.status(200).send({
      status: true,
      message: `Your exported data has been sent to your email address,${email}`
    });

    transport
      .sendMail({
        from: process.env.SMTP_FROM_ADDRESS,
        to: email,
        subject: "Your exported data",
        text: "Kindly find the exported data as an attachment",
        html: "<p>Kindly find the exported data as an attachment</p>",
        attachments: [
          { filename: "data.json", content: Buffer.from(JSON.stringify(data)) }
        ]
      })
      .catch(err => {
        console.log("an error occurred while sending an error", err);
      });
  } catch (err) {
    console.log(err);
    res.status(400).send({ status: false, message: "user not found" });
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
