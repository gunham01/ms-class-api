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

  async existedByEmail(email) {
    const existedTeachers = await this.getByEmail(email);
    return existedTeachers.length > 0;
  }

  updatePasswordByEmail(email, password) {
    return this.query("UPDATE user SET password = ? WHERE email = ?", password, email);
  }

  markUserWithEmailJustLogedIn(email) {
    return this.query("UPDATE user SET last_login_at = ? WHERE email = ?", new Date(Date.now()), email);
  }

  /**
   *
   * @param email mã giảng viên
   * @param userNewAccessToken access token mới của giảng viên này
   */
  updateMSAccessTokenByEmail(email, userNewAccessToken) {
    return this.query("UPDATE user SET ms_access_token = ? WHERE email = ?", userNewAccessToken, email);
  }

  async getUserLastLoginTimeByUserEmail(email) {
    return (await this.query("SELECT last_login_at AS lastLoginAt FROM user WHERE email = ?", email))[0].lastLoginAt;
  }

  /**
   * @param {string} email
   */

  getByEmail(email) {
    return this.query("SELECT * FROM user WHERE email = ?", email);
  }

  getByTeacherId(teacherId) {
    return this.query("SELECT * FROM user WHERE teacher_id = ?", teacherId);
  }

  getById(id) {
    return this.query("SELECT * FROM user WHERE id = ?", id);
  }

  getAllUsers() {
    return this.query("SELECT * FROM user");
  }
}

module.exports = { UserRepository };
