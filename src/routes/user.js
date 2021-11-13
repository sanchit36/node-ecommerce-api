const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const verifyTokenAndAuthenticate = require("../middlewares/verifyTokenAndAuthenticate");
const verifyTokenAndAdmin = require("../middlewares/verifyTokenAndAdmin");
const verifyToken = require("../middlewares/verifyToken");

const router = new express.Router();

//GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const query = req.query.new;
    const qLimit = req.query.limit ? Number(req.query.limit) : 10;
    const qPage = req.query.page ? Number(req.query.page) : 1;
    const toSkip = (qPage - 1) * qLimit;

    const users = query
      ? await User.find().sort({ _id: -1 }).limit(qLimit).skip(toSkip)
      : await User.find();

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Your Profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(404).send("Not Found");
  }
});

//GET USER STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get User By Id
router.get("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch (err) {
    res.status(404).send("Not Found");
  }
});

// Update User
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

// Delete User
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
