const { User } = require("../model/user.model.js");
const { BaseRepository } = require("./base.repository.js");

class UserRepository extends BaseRepository {
  constructor() {
    super();
  }

  /**
   * @param {User} user
   */
  async insert(user) {
    return this.query(
      "INSERT INTO user (teacher_id, email, password, ms_access_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      user.teacherId,
      user.email,
      user.password,
      user.msAccessToken,
      new Date(),
      new Date()
    );
  }

  /**
   *
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async existedByEmail(email) {
    const existedTeachers = await this.getByEmail(email);
    return existedTeachers.length > 0;
  }

  /**
   * 
   * @param {string} teacherId 
   * @returns {Promise<boolean>}
   */
  async existedByTeacherId(teacherId) {
    const existedTeachers = await this.getByTeacherId(teacherId);
    return existedTeachers.length > 0;
  }

  /**
   * @public
   * @param {string} email 
   * @param {string} password 
   */
  updatePasswordByEmail(email, password) {
    return this.query("UPDATE user SET password = ? WHERE email = ?", password, email);
  }

  /**
   * @public
   * @param {string} email 
   */ 
  markUserWithEmailJustLogedIn(email) {
    return this.query("UPDATE user SET last_login_at = ? WHERE email = ?", new Date(Date.now()), email);
  }

  /**
   * @public
   * @param {string} email mã giảng viên
   * @param {string} userNewAccessToken access token mới của giảng viên này
   */
  updateMSAccessTokenByEmail(email, userNewAccessToken) {
    return this.query("UPDATE user SET ms_access_token = ? WHERE email = ?", userNewAccessToken, email);
  }

  /**
   * 
   * @param {string} email 
   * @returns {Promise<Date>}
   */
  async getUserLastLoginTimeByUserEmail(email) {
    return (await this.query("SELECT last_login_at AS lastLoginAt FROM user WHERE email = ?", email))[0].lastLoginAt;
  }

  /**
   * @public
   * @param {string} email
   */

  getByEmail(email) {
    return this.query("SELECT * FROM user WHERE email = ?", email);
  }

  /**
   * @public
   * @param {string} teacherId 
   */
  getByTeacherId(teacherId) {
    return this.query("SELECT * FROM user WHERE teacher_id = ?", teacherId);
  }

  /**
   * @public
   * @param {string} id 
   */
  getById(id) {
    return this.query("SELECT * FROM user WHERE id = ?", id);
  }

  /**
   * @public
   */
  getAllUsers() {
    return this.query("SELECT * FROM user");
  }
}

module.exports = { UserRepository };
