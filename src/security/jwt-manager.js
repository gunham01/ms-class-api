const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../.env" });

class JwtManager {
  static generateAccessToken(payload) {
    this.removeExpField(payload);
    console.log(process.env.JWT_ACCESS_TOKEN_SECRET);
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: "2w" });
  }

  static removeExpField(payload) {
    if (payload.exp) delete payload.exp;
  }

  static verifyToken(token, key) {
    return jwt.verify(token, key);
  }

  static verifyAccessToken(token) {
    return this.verifyToken(token, process.env.JWT_ACCESS_TOKEN_SECRET);
  }
}

class JwtError {
  static INVALID_SIGNATURE = "INVALID_SIGNATURE";
  static TOKEN_EXPIRED = "TOKEN_EXPIRED";

  static getJwtErrorType(error) {
    switch (true) {
      case error.constructor.name === "JsonWebTokenError":
        return JwtError.INVALID_SIGNATURE;
      case error.constructor.name === "TokenExpiredError":
        return JwtError.TOKEN_EXPIRED;
      default:
        throw new Error(`Unknow type: ${error.constructor.name}`);
    }
  }
}

module.exports = {
  JwtManager,
  JwtError,
};
