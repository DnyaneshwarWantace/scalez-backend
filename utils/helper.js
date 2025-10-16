const jwt = require("jsonwebtoken");

module.exports = {
  makeid: async (length) => {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  randomOTP: (length) => {
    var possible = "0123456789";
    var randomText = "";
    for (var i = 0; i < length; i++)
      randomText += possible.charAt(
        Math.floor(Math.random() * possible.length)
      );
    return randomText;
  },

  // Create custom response for rest APIs
  createResponse: (res, status, message, payload, pager) => {
    return res.status(status).json({
      message: message,
      payload: payload,
      pager: pager,
    });
  },

  // JWT token functions
  generateToken: (data, setExpiry) => {
    if (!setExpiry) {
      return jwt.sign(data, env.JWT_SECRET, {
        algorithm: env.JWT_ALGORITHM,
      });
    } else {
      return jwt.sign(data, env.JWT_SECRET, {
        expiresIn: env.TOKEN_EXPIRY,
        algorithm: env.JWT_ALGORITHM,
      });
    }
  },

  verifyToken: async (token) => {
    try {
      var decoded = jwt.verify(token, env.JWT_SECRET);
      if (decoded) return decoded;
      else return false;
    } catch (err) {
      return false;
    }
  },

  // Get user basic info
  serializeUser: async (user) => {
    try {
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        trialEnabled: user.trialEnabled,
        trial: user.trial,
        subscription: user.subscription,
      };

      return userData;
    } catch (err) {
      return false;
    }
  },

  serializeAdmin: async (user) => {
    try {
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };

      return userData;
    } catch (err) {
      return false;
    }
  },
};
