const dayjs = require('dayjs');
const { UserRepository } = require('../repository/user.repository');
const { generateMsalClient } = require('../graph');
const { MsTokenService } = require('./ms-teams/ms-token.service');
const msGraphAPI = require('../ms_graph_api');
const { HttpResponse } = require('../model/http-response.model');

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
      const { accessToken } =
        await generateMsalClient().acquireTokenByRefreshToken({
          refreshToken: user.msRefreshToken,
          scopes: process.env.OAUTH_SCOPES.split(' '),
        });

      return accessToken;
    }
  }

  /**
   * @param {string} authToken
   * @param {string} tenantId
   */
  async saveMsInfoToDb(authToken, tenantId) {
    const msalClient = generateMsalClient();
    const msTokenService = new MsTokenService(msalClient);
    const { accessToken: msAccessToken, expiresOn: msAccessTokenExpireOn } =
      await msTokenService.aquireTokenOnBehalfOf({
        token: authToken,
        tenantId,
      });

    const msGraphResponse = await msGraphAPI.getUserInfo(msAccessToken);
    const { displayName, mail, id } = msGraphResponse.data;

    const refreshToken = msTokenService.aquireRefreshToken(id);

    if (mail.contains('@sv.vnua.edu.vn')) {
      throw HttpResponse.badRequest({
        message: 'Email không phải của giảng viên',
      });
    } else if (!(await this.userRepository.existedByEmail(mail))) {
      throw HttpResponse.badRequest({ message: 'Tài khoản chưa tồn tại' });
    }

    await this.userRepository.updateMsInfo(mail, {
      name: displayName,
      accessToken: msAccessToken,
      accessTokenExpireOn: msAccessTokenExpireOn,
      refreshToken,
    });

    return {
      msAccessToken,
      msAccessTokenExpireOn,
    };
  }
}

module.exports = {
  userService: new UserService(),
};
