const msal = require('@azure/msal-node');

class MsTokenService {
  /**
   * @private
   * @readonly
   */
  scopes = process.env.OAUTH_SCOPES.split(' ');

  /**
   * @param {msal.ConfidentialClientApplication} msalClient 
   */
  constructor(msalClient) {
    this.msalClient = msalClient;
  }

  async aquireTokenByCode({ code, redirectUri }) {
    const response = await this.msalClient.acquireTokenByCode({
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
   * @param {string} userId
   * @returns {string}
   */
  aquireRefreshToken(userId) {
    const refreshTokenObject = JSON.parse(
      this.msalClient.getTokenCache().serialize()
    ).RefreshToken;
    for (const item of Object.values(refreshTokenObject)) {
      // console.log('[LOG] : item:', item);
      if (item['home_account_id'].includes(userId)) {
        return item.secret;
      }
    }

    throw new Error(`Refresh token not found for homeAccountId ${userId}`);
  }

  /**
   * @param {string} refreshToken
   */
  async aquireTokenByRefreshToken(refreshToken) {
    return this.msalClient.acquireTokenByRefreshToken({
      refreshToken,
      scopes: this.scopes,
    });
  }

  async aquireTokenOnBehalfOf({ token, tenantId }) {
    return this.msalClient.acquireTokenOnBehalfOf({
      authority: `https://login.microsoftonline.com/${tenantId}`,
      oboAssertion: token,
      scopes: this.scopes,
    });
  }
}

module.exports = {
 MsTokenService,
};
