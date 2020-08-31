const jwt = require("jsonwebtoken");
const moment = require("moment");
require("dotenv").config();

const getToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_LIFE,
  });
};

const getRefreshToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET_REFRESH, {
    expiresIn: process.env.REFRESH_TOKEN_LIFE,
  });
};

const getDecode = (token, secretKey) => {
  let idToken;
  let decoded;

  if (token && token.startsWith("Bearer ")) {
    idToken = token.split("Bearer ")[1];
  } else {
    return "Unauthorized!";
  }
  try {
    decoded = jwt.verify(idToken, secretKey);
  } catch (err) {
    console.error(err);
    return err.code;
  }
  return decoded;
};

module.exports = { getToken, getDecode, getRefreshToken };
