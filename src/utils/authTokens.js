const { sign } = require("jsonwebtoken");

const createAccessToken = (user) => {
  return sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "15s",
  });
};

const createRefreshToken = (user) => {
  return sign(
    { _id: user._id.toString(), tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = {
  createAccessToken,
  createRefreshToken,
};
