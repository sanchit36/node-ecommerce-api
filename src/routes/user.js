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
    let qLimit = req.query.limit ? Number(req.query.limit) : 10;
    let qPage = req.query.page ? Number(req.query.page) : 1;
    let toSkip = (qPage - 1) * qLimit;

    let schema = User.find().sort({ ...(query && { createdAt: -1 }) });
    let c = schema.toConstructor();

    const count = await schema.count();
    const totalPages = Math.ceil(count / qLimit);
    const hasNext = qPage < totalPages;
    const hasPrev = qPage > 1;

    const users = await c().limit(qLimit).skip(toSkip);

    res.send({ users, totalPages, hasNext, hasPrev });
  } catch (err) {
    console.log(err);
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
  const updates = Object.keys(req.body);
  const allowedUpdate = [
    "firstName",
    "lastName",
    "email",
    "image",
    "username",
    "password",
  ];

  const isValidOperation = updates.every((update) => {
    return allowedUpdate.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ message: "Invalid updates!" });
  }

  try {
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
    res.status(404).send({ message: "Not Found" });
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
