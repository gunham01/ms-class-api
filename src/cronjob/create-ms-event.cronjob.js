const nodeSchedule = require('node-schedule');
const { createEventQueue } = require('../queue/create-event.queue');
const { UserRepository } = require('../repository/user.repository');
const { DAILY_EMAIL_LIMIT } = require('../constant/ms-team.constant');
const dayjs = require('dayjs');
const { msTeamService } = require('../service/ms-teams/ms-teams.service');
const { JobStatus } = require('@prisma/client');
const cronjobs = require('./cronjob-list.json');
const { outlookEventService } = require('../service/outlook-event.service');
const { MsTokenService } = require('../service/ms-teams/ms-token.service');
const { PromiseUtils } = require('../utils/promise.utils');
const { MsEventRepository } = require('../repository/ms-event.repository');
const { generateMsalClient } = require('../graph');

const userRepository = new UserRepository();
const msEventRepository = new MsEventRepository();

if (!process.env.JEST_WORKER_ID) {
  nodeSchedule.scheduleJob(
    cronjobs['event-queue:create'].name,
    cronjobs['event-queue:create'].pattern,
    async (fireDate) => {
      console.log(
        `${cronjobs['event-queue:create'].name} at ${dayjs(fireDate).format(
          'HH:mm:ss DD/MM/YYYY'
        )}`
      );

      await createEventQueue.staleAllInProgessJobs();
      const allUsers = await userRepository.getAll();
      for (const user of allUsers) {
        if (user.todayEmailSentCount >= DAILY_EMAIL_LIMIT) {
          continue;
        }

        const createEventJobs = await createEventQueue.getUserNonCreatedEvents(
          user.id
        );

        const msTokenService = new MsTokenService(generateMsalClient());
        const { accessToken, expiresOn, account } =
          await msTokenService.aquireTokenByRefreshToken(user.msRefreshToken);
        await userRepository.updateMsInfo(user.email, {
          name: account.username,
          accessToken: accessToken,
          accessTokenExpireOn: expiresOn,
        });

        try {
          await createMsEvents(createEventJobs, { msToken: accessToken, user });
        } catch (error) {}
      }
    }
  );
}

/**
 * @param {import('@prisma/client').CreateEventQueue[]} createEventJobs
 * @param {{msToken: string, user: import('@prisma/client').User}} param1
 */
async function createMsEvents(createEventJobs, { msToken, user }) {
  let currentEmailCounter = user.todayEmailSentCount;
  for (const createEventJob of createEventJobs) {
    await createEventQueue.updateStatus(createEventJob.id, JobStatus.PENDING);
    try {
      if (
        currentEmailCounter + createEventJob.attendeeSize >=
        DAILY_EMAIL_LIMIT
      ) {
        await createEventQueue.updateStatus(createEventJob.id, JobStatus.STALE);
        break;
      }
      await createOnlineTeachingEvents(createEventJob, {
        userId: user.id,
        msToken,
      });
      currentEmailCounter += createEventJob.attendeeSize;
      await createEventQueue.updateStatus(createEventJob.id, JobStatus.SUCCESS);
    } catch (error) {
      await createEventQueue.updateStatus(createEventJob.id, JobStatus.FAIL);
    }
  }

  await userRepository.setEmailCounter(user.id, currentEmailCounter);
}

/**
 * @param {import('@prisma/client').CreateEventQueue} createEventJob
 * @param {{ userId: string, msToken: string }} param1
 */
async function createOnlineTeachingEvents(
  createEventJob,
  { userId, msToken }
) {
  const classId = createEventJob.classId;
  const notificationChannel = await createNotificationChannel(classId, {
    msToken,
  });

  const outlookEvents =
    outlookEventService.convertSchoolWebEventToOutlookEvents(
      JSON.parse(createEventJob.studySchedule)
    );
  const msStudyEvents = await msTeamService.createOnlineEvents(outlookEvents, {
    token: msToken,
  });

  const successfullyCreatedEvents = msStudyEvents.filter(
    (event) => event.msEvent
  );

  for (const { originalValue, msEvent } of successfullyCreatedEvents) {
    await msEventRepository.create(msEvent.id, userId);
    await msTeamService.informStudySchedule(msToken, {
      classId,
      channelId: notificationChannel.id,
      scheduleName: msEvent.subject,
      scheduleInfo:
        originalValue.body.content.replace(
          /(((\/(\/)?)|\\\\)(t|r|n|\")|\t|\\\\n)/g,
          ''
        ) +
        `<br><br>` +
        `<a href=${msEvent.onlineMeeting.joinUrl}>Bấm vào đây</a> để tham gia học online`,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Intentionally delay
  }

  return successfullyCreatedEvents
    .map(({ msEvent }) => msEvent)
    .filter((item) => !!item);
}

/**
 * @param {string} classId
 * @param {{ msToken: string }} param1
 */
async function createNotificationChannel(classId, { msToken }) {
  let channelName = 'Schedule';
  let postfixNumber = 2;

  // Create until success
  while (true) {
    try {
      return await msTeamService.createStudyScheduleNotificationChannel({
        classId,
        displayName: channelName,
        description: 'Kênh thông báo lịch học',
        token: msToken,
      });
    } catch (error) {
      await PromiseUtils.delay(2000);
      channelName = `Schedule ${postfixNumber++}`;
    }
  }
}

module.exports = {
  createSingleClassMsEvent: createOnlineTeachingEvents,
};
