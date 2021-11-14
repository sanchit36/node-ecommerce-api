const express = require("express");
const User = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");

const router = new express.Router();

router.post("/signup", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ token, user });
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ token, user });
  } catch (err) {
    console.log(err.message);
    return res.status(400).send({ message: err.message });
  }
});

router.post("/signout", verifyToken, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send("Signing out successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.post("/signout-all", verifyToken, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("Signing out all successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

module.exports = router;
