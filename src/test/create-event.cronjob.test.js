const {
  createSingleClassMsEvent,
  createMsEventsForUser,
} = require('../cronjob/create-ms-event.cronjob');
const { UserRepository } = require('../repository/user.repository');
const { MsTokenService } = require('../service/ms-teams/ms-token.service');
const { CronjobUtils } = require('../utils/cronjob.utils');
const userRepository = new UserRepository();
const { generateMsalClient } = require('../graph');
const Prisma = require('../database/prisma.database');
const { outlookEventService } = require('../service/outlook-event.service');
const msEventRepository = require('../repository/ms-event.repository');

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

test('Should convert to MS Event', async () => {
  const targetCreateEventQueue = await Prisma.createEventQueue.findFirst({
    where: {
      id: '01d26184-e6d2-4aab-879f-c6c5b8bf6512',
    },
  });
  const studySchedule = JSON.parse(targetCreateEventQueue.studySchedule);
  const result =
    outlookEventService.convertSchoolWebEventToOutlookEvents(studySchedule);
  console.dir(result, { depth: null });
  console.log(
    result.map((event) => event.attendees.length).reduce((a, b) => a + b, 0),
  );
});

test('Should finish first job in create event queue', async () => {
  try {
    let user = await getSampleUser();
    user = await new MsTokenService(generateMsalClient()).refreshMsAccessToken(
      user,
    );
    const notCreatedMsEvents =
      await msEventRepository.getByUserIdOrderByAttendeeSizeAsc(user.id);
    const firstCreateEventJob = notCreatedMsEvents[0];
    console.log('[INFO]  firstCreateEventJob:', firstCreateEventJob);
    const result = await createSingleClassMsEvent(firstCreateEventJob, {
      msToken: user.msAccessToken,
    });
    // console.log('[INFO] : result:', result);
  } catch (error) {
    if (error.isAxiosError) {
      console.error(error.response.data);
    } else {
      console.error(error);
    }
  }
});

test('Should create MS events for user success', async () => {
  const user = await userRepository.getByTeacherId('CNP02');
  try {
    await createMsEventsForUser(user);
    console.log('[INFO] : Done');
  } catch (error) {
    console.error(error);
  }
});

test('Should update cronjob last run at', async () => {
  await CronjobUtils.updateLastRunAt('resetDailyLimit', new Date());
});

function getSampleUser() {
  return userRepository.getByTeacherId('CNP02');
}
