const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

class JwtManager {
  /**
   * @public
   * @param {object | string | number} payload
   * @returns
   */
  static generateAccessToken(payload) {
    this.removeExpField(payload);
    console.log(process.env.JWT_ACCESS_TOKEN_SECRET);
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_DURATION,
    });
  }

  /**
   * @param {string} token
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * @private
   * @param {object | string | number} payload
   */
  static removeExpField(payload) {
    if (payload.exp) delete payload.exp;
  }

  /**
   * @public
   * @param {string} token
   * @param {string} key
   */
  static verifyToken(token, key) {
    return jwt.verify(token, key);
  }

  /**
   * @public
   * @param {string} token
   */
  static verifyAccessToken(token) {
    return this.verifyToken(token, process.env.JWT_ACCESS_TOKEN_SECRET);
  }
}

class JwtError {
  static INVALID_SIGNATURE = 'INVALID_SIGNATURE';
  static TOKEN_EXPIRED = 'TOKEN_EXPIRED';

  /**
   * @public
   * @typedef {import("jsonwebtoken").JsonWebTokenError} JsonWebTokenError
   * @typedef {import("jsonwebtoken").TokenExpiredError} TokenExpiredError
   * @param {JsonWebTokenError | TokenExpiredError} error
   * @returns {JwtError}
   */
  static getJwtErrorType(error) {
    switch (true) {
      case error.constructor.name === 'JsonWebTokenError':
        return JwtError.INVALID_SIGNATURE;
      case error.constructor.name === 'TokenExpiredError':
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
