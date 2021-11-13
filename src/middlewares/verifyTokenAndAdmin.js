const verifyToken = require("./verifyToken");

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).send("You are not allowed to do that");
    }
  });
};

module.exports = verifyTokenAndAdmin;
