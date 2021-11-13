const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const verifyTokenAndAuthenticate = require("../middlewares/verifyTokenAndAuthenticate");
const verifyTokenAndAdmin = require("../middlewares/verifyTokenAndAdmin");
const verifyToken = require("../middlewares/verifyToken");

const router = new express.Router();

// Get
router.get("/me", verifyToken, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(404).send("Not Found");
  }
});

router.get("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch (err) {
    res.status(404).send("Not Found");
  }
});

// Update
router.put("/:id", verifyTokenAndAuthenticate, async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 8);
    }
    if (req.body.isAdmin) {
      if (!req.user.isAdmin) {
        delete req.body.isAdmin;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(404).send("Not Found");
  }
});

// Delete
router.delete("/:id", verifyTokenAndAuthenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send("Deleted successfully");
  } catch (err) {
    console.log(err);
    res.status(404).send("Not Found");
  }
});

module.exports = router;
