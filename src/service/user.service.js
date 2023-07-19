const dayjs = require('dayjs');
const { UserRepository } = require('../repository/user.repository');
const { msalClient } = require('../graph');

class UserService {
  /**
   * @private
   */
  userRepository = new UserRepository();

  /**
   * @param {string} userEmail
   */
  async getMsAccessToken(userEmail) {
    const user = await this.userRepository.getByEmail(userEmail);

    const today = dayjs();
    const msAccessTokenExpireOn = dayjs(user.msAccessTokenExpireOn);
    if (today.isAfter(msAccessTokenExpireOn)) {
      const { accessToken } = await msalClient.acquireTokenByRefreshToken({
        refreshToken: user.msRefreshToken,
        scopes: process.env.OAUTH_SCOPES.split(' '),
      });

      return accessToken;
    }
  }
}

module.exports = {
  userService: new UserService(),
};
