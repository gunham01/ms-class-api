const { UserRepository } = require('../repository/user.repository');
const { User } = require('../model/user.model');
const { HttpResponse, HttpStatus } = require('../model/http-response.model');
const { CryptoUtils } = require('../utils/crypto.utils');
const { JwtManager } = require('../security/jwt-manager');
const moment = require('moment');

class UserController {
  _userRepository = new UserRepository();
  _messages = {
    success: {
      addUser: 'Thêm giảng viên thành công',
      login: 'Đăng nhập thành công',
    },
    error: {
      missingTeacherId: 'teacherId không được để trống',
      login: 'Email hoặc mật khẩu không chính xác',
    },
  };

  /**
   * @param {User} user
   */
  async insert(user) {
    if (user.email.includes('@sv.vnua.edu.vn')) {
      throw HttpResponse.badRequest({
        message: 'Email không phải của giảng viên',
      });
    }
    
    if (await this._userRepository.existedByEmail(user.email)) {
      return HttpResponse.status(HttpStatus.CONFLICT).body(
        `Giảng viên với email ${user.email} đã tồn tại`,
      );
    }

    if (await this._userRepository.existedByTeacherId(user.teacherId)) {
      return HttpResponse.status(HttpStatus.CONFLICT).body(
        `Giảng viên với mã ${user.teacherId} đã tồn tại`,
      );
    }

    user.password = await CryptoUtils.encodePassword(user.password);
    return this.insertUser(user);
  }

  async insertUser(user) {
    try {
      await this._userRepository.insert(user);
      return HttpResponse.ok(this._messages.success.addUser);
    } catch (error) {
      console.log('[LOG] : sqlError:', error);
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
        error.message,
      );
    }
  }

  /**
   * @param {string} email
   * @param {string} inputPassword
   */
  async authenticate(email, inputPassword) {
    const user = await this._userRepository.getByEmail(email);
    if (!user) {
      return HttpResponse.status(HttpStatus.UNAUTHORIZED).body(
        this._messages.error.login,
      );
    }

    // const passwordIsIncorrect = !CryptoUtils.comparePassword(
    //   inputPassword,
    //   user.password
    // );
    // if (passwordIsIncorrect) {
    //   return HttpResponse.status(HttpStatus.UNAUTHORIZED).body(
    //     this._messages.error.login
    //   );
    // }

    const {
      id,
      msAccessToken,
      accessToken,
      createdAt,
      updatedAt,
      ...jwtPayload
    } = user;
    const jwt = JwtManager.generateAccessToken({ ...jwtPayload });
    await this._userRepository.updateAccessToken(email, jwt);

    return HttpResponse.ok({
      user: jwtPayload,
      accessToken: jwt,
      msLoginRequire: await this.isUserRequiredMsLogin(user),
    });
  }

  async isUserRequiredMsLogin(user) {
    const {
      last_login_at: userLastLoginAt,
      ms_access_token: userMSAccessToken,
    } = user;
    if (!userLastLoginAt || !userMSAccessToken) return true;
    const tokenLifeSpanInSecond = moment().diff(
      moment(userLastLoginAt),
      'seconds',
    );
    return tokenLifeSpanInSecond > 3600;
  }

  /**
   * @param {string} jwt
   */
  async getUserByJwt(jwt) {
    return JwtManager.decodeToken(jwt);
  }

  /**
   * @param {string} jwt
   */
  async verifyIfJwtExisted(jwt) {
    return this._userRepository.isJwtExisted(jwt);
  }
}

module.exports = {
  UserController,
};
