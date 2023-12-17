const {
  createSingleClassMsEvent,
} = require('../cronjob/create-ms-event.cronjob');
const { createEventQueue } = require('../queue/create-event.queue');
const { UserRepository } = require('../repository/user.repository');
const { MsTokenService } = require('../service/ms-teams/ms-token.service');
const { CronjobUtils } = require('../utils/cronjob.utils');
const userRepository = new UserRepository();
const { generateMsalClient } = require('../graph');

jest.setTimeout(9999999);

test('Count attendee', () => {
  const { attendees } = require('./sample/ms-event-attendees.sample');
  console.log('[INFO] Attendee size: ', attendees.length);
});

test('Should refresh access token', async () => {
  const user = await getSampleUser();
  const msalClient = generateMsalClient();
  const msTokenService = new MsTokenService(msalClient);
  const { accessToken, expiresOn, account } =
    await msTokenService.aquireTokenByRefreshToken(user.msRefreshToken);
  await userRepository.updateMsInfo(user.email, {
    name: account.username,
    accessToken: accessToken,
    accessTokenExpireOn: expiresOn,
  });
});

test('Should finish first job in create event queue', async () => {
  const user = await getSampleUser();
  const firstCreateEventJob = (
    await createEventQueue.getUserNonCreatedEvents(user.id)
  )[0];

  const result = await createSingleClassMsEvent(firstCreateEventJob, {
    userId: user.id,
    msToken: user.msAccessToken,
  });

  console.debug('[INFO] : result:', result);
});

test('Should update cronjob last run at', async () => {
  await CronjobUtils.updateLastRunAt('resetDailyLimit', new Date());
});

function getSampleUser() {
  return userRepository.getByEmail('stdse@vnua.edu.vn');
}
