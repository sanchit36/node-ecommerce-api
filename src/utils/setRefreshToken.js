const setRefreshToken = (res, token) => {
  res.cookie("xid", token, {
    httpOnly: true,
  });
};

module.exports = {
  setRefreshToken,
};
