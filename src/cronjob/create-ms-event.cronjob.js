const nodeSchedule = require('node-schedule');
const { UserRepository } = require('../repository/user.repository');
const { DAILY_EMAIL_LIMIT } = require('../constant/ms-team.constant');
const { msTeamsService } = require('../service/ms-teams/ms-teams.service');
const { MsTokenService } = require('../service/ms-teams/ms-token.service');
const { PromiseUtils } = require('../utils/promise.utils');
const msEventRepository = require('../repository/ms-event.repository');
const { generateMsalClient } = require('../graph');
const prisma = require('../database/prisma.database');
const { CronjobUtils } = require('../utils/cronjob.utils');
const { CronjobRepository } = require('../repository/cronjob.repository');
const { parseExpression } = require('cron-parser');
const dayjs = require('dayjs');

const userRepository = new UserRepository();
const cronjobRepository = new CronjobRepository();

if (!process.env.JEST_WORKER_ID) {
  runCronjob().catch(console.error);
}

async function runCronjob() {
  const cronjob = await cronjobRepository.getByName('event-queue:create');
  const scheduledJob = nodeSchedule.scheduleJob(
    cronjob.name,
    cronjob.pattern,
    async (fireDate) => {
      const currentTime = fireDate ?? new Date();
      CronjobUtils.informIsRunning(cronjob.name, currentTime);
      await cronjobRepository.updateLastRunAt(cronjob.name, currentTime);

      await msEventRepository.stopAllCreatingEvents();
      const allUsers = await userRepository.getAll();
      for (const user of allUsers) {
        if (user.todayEmailSentCount < DAILY_EMAIL_LIMIT) {
          await createMsEventsForUser(user).catch(console.error);
        }
      }
    },
  );

  CronjobUtils.runCronjobIfNotRunYet(cronjob, scheduledJob);
}

/**
 *
 * @param {import('@prisma/client').User} user
 */
async function createMsEventsForUser(user) {
  const notCreatedMsEvents =
    await msEventRepository.getByUserIdOrderByAttendeeSizeAsc(user.id);
  if (
    notCreatedMsEvents.length === 0 ||
    user.todayEmailSentCount + notCreatedMsEvents[0].attendeeSize >=
      DAILY_EMAIL_LIMIT
  ) {
    return;
  }

  const msTokenService = new MsTokenService(generateMsalClient());
  const { msAccessToken } = await msTokenService.refreshMsAccessToken(user);

  const msEventToCreate = filterMsEventToCreate(notCreatedMsEvents, user);
  try {
    await createMsEvents(msEventToCreate, {
      msToken: msAccessToken,
      user,
    });
  } catch (error) {
    console.error('Lỗi khi tạo sự kiện cho user ', user.email);
    console.error(error);
  }
}

/**
 *
 * @param {import('@prisma/client').MsEvent[]} msEvents
 * @param {import('@prisma/client').User} user
 */
function filterMsEventToCreate(msEvents, user) {
  let currentEmailCounter = user.todayEmailSentCount;
  return msEvents.filter((msEvent) => {
    if (currentEmailCounter + msEvent.attendeeSize >= DAILY_EMAIL_LIMIT) {
      return false;
    }
    currentEmailCounter += msEvent.attendeeSize;
    return true;
  });
}

/**
 * @param {import('@prisma/client').MsEvent[]} msEvents
 * @param {{msToken: string, user: import('@prisma/client').User}} param1
 */
async function createMsEvents(msEvents, { msToken, user }) {
  for (const msEvent of msEvents) {
    await msEventRepository.update({
      ...msEvent,
      status: 'CREATING',
    });
    try {
      await createOnlineTeachingEvent(msEvent, {
        msToken,
      });

      await prisma.$transaction(async () => {
        await msEventRepository.update({
          ...msEvent,
          status: 'CREATED',
        });
        await userRepository.increaseEmailCounter(
          user.id,
          msEvent.attendeeSize,
        );
      });
    } catch (error) {
      console.log('[INFO]  error:', error);
      const newStatus =
        msEvent.retryCount >= 3 ? 'CREATE_FAILED' : 'NOT_CREATED';
      await msEventRepository.update({
        ...msEvent,
        status: newStatus,
        retryCount: msEvent.retryCount + 1,
      });
    }

    await PromiseUtils.delay(5000); // Intentionally delay
  }
}

/**
 * @param {import('@prisma/client').MsEvent} msEvent
 * @param {{ msToken: string }} param1
 */
async function createOnlineTeachingEvent(msEvent, { msToken }) {
  const classId = msEvent.classId;
  const notificationChannel = await createNotificationChannel(classId, {
    msToken,
  });

  console.log('[INFO]  notificationChannel:', notificationChannel);
  const msStudyEvent = await msTeamsService.createOnlineEvents(
    JSON.parse(msEvent.json),
    {
      token: msToken,
    },
  );

  if (msStudyEvent.error) {
    console.error(
      'Lỗi khi tạo sự kiện học online:',
      JSON.stringify(msStudyEvent.error, null, 2),
    );
    return;
  }

  await msTeamsService.informStudySchedule(msToken, {
    classId,
    channelId: notificationChannel.id,
    scheduleName: msStudyEvent.msEvent.subject,
    scheduleInfo:
      msStudyEvent.originalValue.body.content.replace(
        /(((\/(\/)?)|\\\\)(t|r|n|\")|\t|\\\\n)/g,
        '',
      ) +
      `<br><br>` +
      `<a href=${msStudyEvent.msEvent.onlineMeeting.joinUrl}>Bấm vào đây</a> để tham gia học online`,
  });

  return msStudyEvent;
}

/**
 * @param {string} classId
 * @param {{ msToken: string }} param1
 */
async function createNotificationChannel(classId, { msToken }) {
  let channelName = 'Schedule';

  // Create until success
  try {
    return await msTeamsService.createStudyScheduleNotificationChannel({
      classId,
      displayName: channelName,
      description: 'Kênh thông báo lịch học',
      token: msToken,
    });
  } catch (error) {
    await PromiseUtils.delay(2000);
    return msTeamsService.getNotificationChannel({
      classId,
      token: msToken,
    });
  }
}

module.exports = {
  createSingleClassMsEvent: createOnlineTeachingEvent,
  createMsEventsForUser,
};
