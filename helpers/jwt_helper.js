const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const User = require("../models/User.model");
const SuperOwner = require("../models/SuperOwner.model");

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "12h",
        issuer: "scalez.in",
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(createError.Unauthorized());
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        // return next(createError.Unauthorized(message));
        return res.status(401).json({
          message: "jwt expired",
        });
      }
      req.payload = payload;
      console.log("payload", payload);
      let targetUser = await User.findById(payload.aud);
      // console.log("targetUser", targetUser);
      req.user = targetUser;

      if (
        !targetUser &&
        (await SuperOwner.countDocuments({ _id: payload.aud })) == 0
      ) {
        return res.status(404).json({
          message: "Admin removed the user",
        });
      }

      next();
    });
  },
};
