const express = require("express");
const Product = require("../models/Product");
const verifyTokenAndAdmin = require("../middlewares/verifyTokenAndAdmin");

const router = new express.Router();

// Create Product
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const product = await Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (err) {
    return res.status(422).send(err);
  }
});

// Get All Product
router.get("/", async (req, res) => {
  console.log(req.query);
  try {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    const qLimit = req.query.limit ? Number(req.query.limit) : 8;
    const qPage = req.query.page ? Number(req.query.page) : 1;
    const toSkip = (qPage - 1) * qLimit;
    let products;

    if (qNew) {
      products = await Product.find()
        .sort({ createdAt: -1 })
        .limit(qLimit)
        .skip(toSkip);
    } else if (qCategory) {
      console.log("new and cat");

      products = await Product.find({
        "categories.name": {
          $in: [qCategory],
        },
      })
        .limit(qLimit)
        .skip(toSkip);
    } else {
      products = await Product.find().limit(qLimit).skip(toSkip);
    }

    res.send(products);
  } catch (err) {
    return res.status(404).send(err);
  }
});

// Get Single Product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).send("Not Found");
    }
    res.send(product);
  } catch (err) {
    res.status(404).send("Not Found");
  }
});

// Update Product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    res.send(product);
  } catch (err) {
    console.log(err);
    res.status(404).send("Not Found");
  }
});

// Delete Product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.send("Deleted successfully");
  } catch (err) {
    console.log(err);
    res.status(404).send("Not Found");
  }
});

module.exports = router;
