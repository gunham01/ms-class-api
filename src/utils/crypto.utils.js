const bcrypt = require('bcryptjs');
const { createHash } = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' });

class CryptoUtils {
  /**
   * Hàm băm
   * @param {string} value
   * @param {"sha256" | "sha512"} algorithm
   */
  static createHash(value, algorithm) {
    return createHash(algorithm).update(value).digest('hex');
  }

  /**
   * Băm mật khẩu bằng thuật toán Bcrypt
   * @param {string} password mật khẩu cần băm
   */
  static async encodePassword(password) {
    // const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, 10);
  }

  /**
   * @param {string} inputPassword
   * @param {string} userPassword
   */
  static comparePassword(inputPassword, userPassword) {
    return bcrypt.compareSync(inputPassword, userPassword);
  }
}

class HashAlgorithm {
  static SHA256 = 'sha256';
}

module.exports = {
  CryptoUtils,
  HashAlgorithm,
};
