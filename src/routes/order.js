const verifyToken = require("../middlewares/verifyToken");
const verifyTokenAndAdmin = require("../middlewares/verifyTokenAndAdmin");
const verifyTokenAndAuthenticate = require("../middlewares/verifyTokenAndAuthenticate");
const Order = require("../models/Order");
const router = require("express").Router();

//CREATE
router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//GET USER ORDERS
router.get("/find/:userId", verifyTokenAndAuthenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ORDER
router.get("/:id", verifyTokenAndAuthenticate, async (req, res) => {
  try {
    const orders = await Order.findById(req.params.id).populate("user").exec();

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    let qLimit = req.query.limit ? Number(req.query.limit) : 10;
    let qPage = req.query.page ? Number(req.query.page) : 1;
    let toSkip = (qPage - 1) * qLimit;

    let schema = Order.find();
    let c = schema.toConstructor();

    const count = await schema.count();
    const totalPages = Math.ceil(count / qLimit);
    const orders = await c().limit(qLimit).skip(toSkip);

    res.status(200).json({ orders, totalPages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
