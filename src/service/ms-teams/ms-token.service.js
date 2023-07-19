const { msalClient } = require('../../graph');

class MsTokenService {
  /**
   * @private
   * @readonly
   */
  scopes = process.env.OAUTH_SCOPES.split(' ');

  async aquireTokenByCode({ code, redirectUri }) {
    const response = await msalClient.acquireTokenByCode({
      code,
      scopes: this.scopes,
      redirectUri,
    });
    console.log(response);

    const { accessToken, expiresOn, account } = response;
    const refreshToken = this.aquireRefreshToken(account.homeAccountId);
    return {
      accessToken,
      accessTokenExpireOn: expiresOn,
      refreshToken,
      account,
    };
  }

  /**
   * @param {string} homeAccountId
   * @returns {string}
   */
  aquireRefreshToken(homeAccountId) {
    const refreshTokenObject = JSON.parse(
      msalClient.getTokenCache().serialize()
    ).RefreshToken;
    for (const item of Object.values(refreshTokenObject)) {
      console.log('[LOG] : item:', item);
      if (item['home_account_id'] === homeAccountId) {
        return item.secret;
      }
    }

    throw new Error(
      `Refresh token not found for homeAccountId ${homeAccountId}`
    );
  }

  /**
   * @param {string} refreshToken
   */
  async aquireTokenByRefreshToken(refreshToken) {
    const { accessToken, expiresOn, account } =
      await msalClient.acquireTokenByRefreshToken({
        refreshToken,
        scopes: this.scopes,
      });

    return {
      accessToken,
      expiresOn,
      account,
    };
  }
}

module.exports = {
  msTokenService: new MsTokenService(),
};
