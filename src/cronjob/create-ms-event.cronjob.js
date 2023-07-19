const nodeSchedule = require('node-schedule');
const { createEventQueue } = require('../queue/create-event.queue');
const { UserRepository } = require('../repository/user.repository');
const { DAILY_EMAIL_LIMIT } = require('../constant/ms-team.constant');
const dayjs = require('dayjs');
const { msTeamService } = require('../service/ms-teams/ms-teams.service');
const { JobStatus } = require('@prisma/client');
const cronjobs = require('./cronjob-list.json');
const { outlookEventService } = require('../service/outlook-event.service');
const { msTokenService } = require('../service/ms-teams/ms-token.service');
const { PromiseUtils } = require('../utils/promise.utils');

const userRepository = new UserRepository();

if (!process.env.JEST_WORKER_ID) {
  nodeSchedule.scheduleJob(
    cronjobs.createEventQueue.name,
    cronjobs.createEventQueue.pattern,
    async (fireDate) => {
      console.log(
        `${cronjobs.createEventQueue.name} at ${dayjs(fireDate).format(
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
        const { accessToken, expiresOn, account } =
          await msTokenService.aquireTokenByRefreshToken(user.msRefreshToken);
        await userRepository.updateMsInfo(user.email, {
          msAccessToken: accessToken,
          msAccessTokenExpireOn: expiresOn,
          accountInfo: account,
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
      await createUserOnlineTeachingEvents(createEventJob, { msToken });
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
 * @param {{ msToken: string }} param1
 */
async function createUserOnlineTeachingEvents(createEventJob, { msToken }) {
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
  createSingleClassMsEvent: createUserOnlineTeachingEvents,
};
