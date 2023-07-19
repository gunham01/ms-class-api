const { createSingleClassMsEvent } = require('../cronjob/create-ms-event.cronjob');
const Prisma = require('../database/prisma.database');
const { createEventQueue } = require('../queue/create-event.queue');
const { UserRepository } = require('../repository/user.repository');
const { msTokenService } = require('../service/ms-teams/ms-token.service');
const { CronjobUtils } = require('../utils/cronjob.utils');
const userRepository = new UserRepository();

jest.setTimeout(9999999);

afterAll(async () => {
  await Prisma.$disconnect();
});

test('Should refresh access token', async () => {
  const user = await getSampleUser();
  const { accessToken, expiresOn, account } =
    await msTokenService.aquireTokenByRefreshToken(user.msRefreshToken);
  await userRepository.updateMsInfo(user.email, {
    msAccessToken: accessToken,
    msAccessTokenExpireOn: expiresOn,
    accountInfo: account,
  });
});

test('Should finish first job in create event queue', async () => {
  const user = await getSampleUser();
  const firstCreateEventJob = (
    await createEventQueue.getUserNonCreatedEvents(user.id)
  )[0];
  
  const result = await createSingleClassMsEvent(firstCreateEventJob, {
    msToken: user.msAccessToken,
  });
  
  console.debug('[INFO] : result:', result)
});

test('Should update cronjob last run at', async () => {
  await CronjobUtils.updateLastRunAt('resetDailyLimit', new Date());
})

function getSampleUser() {
  return userRepository.getByEmail('stdse@vnua.edu.vn');
}
