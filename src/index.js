const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const productsRoutes = require("./routes/products");

// connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// app config
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productsRoutes);

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("listening on port " + process.env.PORT || 5000);
});
