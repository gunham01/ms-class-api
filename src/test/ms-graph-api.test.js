const dayjs = require('dayjs');
const { generateMsalClient } = require('../graph');
const msEventRepository = require('../repository/ms-event.repository');
const { UserRepository } = require('../repository/user.repository');
const { msTeamsService } = require('../service/ms-teams/ms-teams.service');
const { MsTokenService } = require('../service/ms-teams/ms-token.service');

const userRepository = new UserRepository();

test('Should get notification channel', async () => {
  const user = await userRepository.getByEmail('stdse@vnua.edu.vn');
  const classId = await getClassId(user);
  const msAccessToken = await getUserMsAccessToken(user);
  const channel = await msTeamsService.getNotificationChannel({
    classId,
    token: msAccessToken,
  });
  console.log('[INFO]  channel:');
  console.dir(channel);
});

async function getClassId(user) {
  const firstEvent = await msEventRepository.getByUserIdOrderByAttendeeSizeAsc(
    user.id,
  );
  return firstEvent[0]?.classId;
}

/**
 *
 * @param {import('@prisma/client').User} user
 */
async function getUserMsAccessToken(user) {
  if (dayjs().isAfter(user.msAccessTokenExpireOn)) {
    const msalClient = generateMsalClient();
    const msTokenService = new MsTokenService(msalClient);
    const { accessToken, expiresOn, account } =
      await msTokenService.aquireTokenByRefreshToken(user.msRefreshToken);
    const { msAccessToken } = await userRepository.updateMsInfo(user.email, {
      name: account.username,
      accessToken: accessToken,
      accessTokenExpireOn: expiresOn,
    });

    return msAccessToken;
  }

  return user.msAccessToken;
}
