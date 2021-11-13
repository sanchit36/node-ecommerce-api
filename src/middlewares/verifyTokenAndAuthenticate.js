const verifyToken = require("./verifyToken");

const verifyTokenAndAuthenticate = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.id == req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.status(403).send("You are not allowed to do that");
    }
  });
};

module.exports = verifyTokenAndAuthenticate;
