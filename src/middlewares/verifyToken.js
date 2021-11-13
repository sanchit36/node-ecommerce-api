const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  try {
    const tokenHeader = req.header("Authorization");
    if (!tokenHeader) {
      throw new Error();
    }
    const token = tokenHeader.replace("Bearer ", "");
    const decoded = jwt.decode(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.id = decoded._id;
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = verifyToken;
