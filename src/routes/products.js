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
  try {
    let { q, size, category, color, sortBy, limit, page } = req.query;
    let query = {};
    let sortObject = {};
    let qlimit = 8,
      qpage = 1;
    let qmax = 50;

    if (q != null && q != "") query["title"] = { $regex: q, $options: "i" };
    if (size != null && size != "") query["sizes.name"] = { $in: [size] };
    if (category != null && category != "")
      query["categories.name"] = { $in: [category] };
    if (color != null && color != "") query["colors.name"] = { $in: [color] };
    if (sortBy == "asc" || sortBy == "desc" || sortBy == "newest") {
      if (sortBy == "newest") {
        sortObject["createdAt"] = -1;
      } else {
        sortObject["price"] = sortBy == "asc" ? 1 : -1;
      }
    }

    if (limit != null) qlimit = limit;
    if (page != null) qpage = page;
    if (qlimit > qmax) qlimit = qmax;

    let schema = Product.find(query);
    let c = schema.toConstructor();

    const count = await schema.count();
    const totalPages = Math.ceil(count / qlimit);
    const hasNext = qpage < totalPages;
    const hasPrev = qpage > 1;

    const products = await c()
      .sort(sortObject)
      .limit(qlimit)
      .skip((qpage - 1) * qlimit);

    res.send({ products, totalPages, hasNext, hasPrev });
  } catch (err) {
    console.log(err);
    return res.status(404).send(err);
  }
});

// Get Single Product
router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({ slug });
    if (!product) {
      return res.status(404).send("NO PRODUCT");
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
    console.log(product);
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
