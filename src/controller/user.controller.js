const { UserRepository } = require("../repository/user.repository");
const { User } = require("../model/user.model");
const { HttpResponse, HttpStatus } = require("../model/http-response.model");
const { CryptoUtils } = require("../utils/crypto.utils");
const { JwtManager } = require("../security/jwt-manager");
const moment = require("moment");

class UserController {
  _userRepository = new UserRepository();
  _messages = {
    success: {
      addUser: "Thêm giảng viên thành công",
      login: "Đăng nhập thành công",
    },
    error: {
      missingTeacherId: "teacherId không được để trống",
      login: "Email hoặc mật khẩu không chính xác",
    },
  };

  /**
   * @param {User} user
   */
  async insert(user) {
    if (await this._userRepository.existedByEmail(user.email)) {
      return HttpResponse.status(HttpStatus.CONFLICT).body(`Giảng viên với email ${user.email} đã tồn tại`);
    }

    user.password = await CryptoUtils.encodePassword(user.password);
    console.log(user);
    return this.insertUser(user);
  }

  async insertUser(user) {
    try {
      await this._userRepository.insert(user);
      return HttpResponse.ok(this._messages.success.addUser);
    } catch (sqlError) {
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(sqlError.sqlMessage);
    }
  }

  /**
   * @param {string} email
   * @param {string} inputPasswordO
   */
  async authenticate(email, inputPassword) {
    const user = await this.getByEmail(email);
    if (!user) {
      return HttpResponse.status(HttpStatus.UNAUTHORIZED).body(this._messages.error.login);
    }

    const passwordIsIncorrect = !CryptoUtils.comparePassword(inputPassword, user.password);
    if (passwordIsIncorrect) {
      return HttpResponse.status(HttpStatus.UNAUTHORIZED).body(this._messages.error.login);
    }

    // Remove "password" field
    delete user.password;
    
    return HttpResponse.ok({
      user: user,
      accessToken: JwtManager.generateAccessToken({ ...user }),
      msLoginRequire: await this.isUserRequiredMsLogin(user),
    });
  }

  async isUserRequiredMsLogin(user) {
    const userLastLoginTime = user["last_login_at"];
    console.log(userLastLoginTime, user["ms_access_token"]);
    if (!userLastLoginTime || !user["ms_access_token"]) return true;
    const tokenLifeSpanInSecond = moment().diff(moment(userLastLoginTime), "seconds");
    console.log("tokenLifeSpanInSecond: ", tokenLifeSpanInSecond);
    return tokenLifeSpanInSecond > 3600;
  }

  async updateUserMsAccessTokenByEmail(email, masAccessToken) {
    return this.query("UPDATE user SET ms_access_token = ? HWERE email = ?", masAccessToken, email);
  }

  /**
   * @param {string} teacherId
   */
  async getByEmail(teacherId) {
    try {
      const usersWithTeacherId = await this._userRepository.getByEmail(teacherId);
      return usersWithTeacherId ? usersWithTeacherId[0] : null;
    } catch (sqlError) {
      throw sqlError.sqlMessage;
    }
  }
}

module.exports = {
  UserController,
};
