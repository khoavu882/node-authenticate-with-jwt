const { Router } = require("express");

const router = Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { getToken, getDecode, getRefreshToken } = require("../jwt/auth");
require("dotenv").config();

const bcrypt = require("bcrypt");
const saltRounds = process.env.SALT_ROUNDS;

const tokenList = {};

const {
  validateLoginData,
  validateRegisterData,
} = require("../utils/validators");

router.post("/api/users/register", (req, res) => {
  const admin = {
    name: res.body.name,
    email: res.body.email,
    password: res.body.password,
  };

  const { valid, errors } = validateRegisterData(admin);

  if (!valid) return res.status(400).json(errors);

  User.findOne({ email: admin.email })
    .then((user) => {
      if (!user) {
        bcrypt.hash(admin.password, saltRounds, (err, hash) => {
          admin.password = hash;
          User.create(admin).then((user) => {
            res.json({ status: "Email: " + user.email + " registered!" });
          });
        });
      } else res.json({ message: "Email already exist!" });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.post("/api/users/login", (req, res) => {
  const userLogin = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(userLogin);

  if (!valid) return res.status(400).json(errors);

  User.findOne({ email: userLogin.email })
    .then((user) => {
      if (user) {
        if (bcrypt.compareSync(userLogin.password, user.password)) {
          const payload = {
            _id: user._id,
            name: user.name,
            email: user.email,
          };

          const token = "Bearer " + getToken(payload);
          const refreshToken = "Bearer " + getRefreshToken(payload);

          tokenList[refreshToken] = user;

          res.json({
            token: token,
            refreshToken: refreshToken,
          });
        } else res.json({ message: "Password not match!" });
      } else res.json({ message: "User don't exist!" });
    })
    .catch((error) => res.json({ error: error.message }));
});

router.post("/api/users/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;
  console.log(tokenList);
  if (refreshToken && refreshToken in tokenList) {
    const decoded = getDecode(refreshToken, process.env.JWT_SECRET_REFRESH);
    console.log(decoded);
    if (decoded) {
      const user = tokenList[refreshToken];
      const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };
      const token = "Bearer " + getToken(payload);
      res.status(200).json({ token });
    } else res.json({ message: "Invalidate Token" });
  } else
    res.status(400).json({
      message: "Invalid request",
    });
});

router.get("/api/users/profile", (req, res) => {
  const decoded = getDecode(req.headers.authorization, process.env.JWT_SECRET);
  if (decoded) {
    console.log(decoded);
  } else res.json({ message: "Invalidate Token" });

  User.findOne({ _id: decoded._id })
    .then((user) => {
      if (user) {
        res.json({
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          tokenExp: decoded.exp,
        });
        console.log("Logged in", user.name);
      } else {
        res.send("User does not exist");
      }
    })
    .catch((err) => {
      res.send("error: " + err);
    });
});

module.exports = router;
