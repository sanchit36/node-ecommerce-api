const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const Cart = require('../models/Cart');
const { verify } = require('jsonwebtoken');
const { setRefreshToken } = require('../utils/setRefreshToken');
const {
  createRefreshToken,
  createAccessToken,
} = require('../utils/authTokens');

const router = new express.Router();

// Sign Up user
router.post('/signup', async (req, res) => {
  try {
    const user = new User(req.body);
    // access token
    const token = createAccessToken(user);
    // refresh token
    setRefreshToken(res, createRefreshToken(user));

    // TODO: Send a email verification email

    await user.save();
    res.status(201).send({ user, token });
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

// Login in a user
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByCredentials(email, password);

    // TODO
    // if (!user.confirmed) {
    //   res
    //     .status(401)
    //     .send({ message: "Please confirm your email address first" });
    // }

    // access token
    const token = createAccessToken(user);
    // refresh token
    setRefreshToken(res, createRefreshToken(user));

    res.send({ token, user, cart: user.cart[0] });
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

// Logout a user
router.post('/signout', verifyToken, async (req, res) => {
  try {
    res.send('Signing out successfully');
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

// Refresh user accessToken
router.post('/refresh_token', async (req, res) => {
  const token = req.cookies.xid;
  if (!token) {
    return res.send({ ok: false, accessToken: '', user: null });
  }

  let payload = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    console.log(err);
    return res.send({ ok: false, accessToken: '', user: null });
  }

  const user = await User.findById(payload._id);
  if (!user) {
    return res.send({ ok: false, accessToken: '', user: null });
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.send({ ok: false, accessToken: '', user: null });
  }

  setRefreshToken(res, createRefreshToken(user));
  return res.send({ ok: true, accessToken: createAccessToken(user), user });
});

module.exports = router;
