let graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const msal = require('@azure/msal-node');

module.exports = {
  /**
   * @param {any} msalClient
   * @param {string} userId
   */
  getUserDetails: async function (msalClient, userId) {
    const client = getAuthenticatedClient(msalClient, userId);
    const user = await client
      .api('/me')
      .select('displayName,mail,mailboxSettings,userPrincipalName')
      .get();
    return user;
  },

  msalClient: new msal.ConfidentialClientApplication({
    auth: {
      clientId: process.env.OAUTH_CLIENT_ID,
      authority: process.env.OAUTH_AUTHORITY,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
    },
    system: {
      loggerOptions: {
        loggerCallback(_loglevel, message, _containsPii) {
          console.log(message);
        },
        piiLoggingEnabled: false,
        logLevel: msal.LogLevel.Verbose,
      },
    },
  }),
};

/**
 * @param {any} msalClient
 * @param {string} userId
 */
function getAuthenticatedClient(msalClient, userId) {
  if (!msalClient || !userId) {
    throw new Error(
      `Invalid MSAL state. Client: ${
        msalClient ? 'present' : 'missing'
      }, User ID: ${userId ? 'present' : 'missing'}`
    );
  }

  const client = graph.Client.init({
    authProvider: async (done) => {
      try {
        // Get the user's account
        const account = await msalClient
          .getTokenCache()
          .getAccountByHomeId(userId);

        if (account) {
          const response = await msalClient.acquireTokenSilent({
            scopes: process.env.OAUTH_SCOPES.split(' '),
            redirectUri: process.env.OAUTH_REDIRECT_URI,
            account: account,
          });

          done(null, response.accessToken);
        }
      } catch (err) {
        console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        done(err, null);
      }
    },
  });

  return client;
}
