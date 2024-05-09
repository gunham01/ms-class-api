const Prisma = require('./database/prisma.database');
const { outlookEventService } = require('./service/outlook-event.service');

const cronjobs = {
  'event-queue:create': {
    name: 'event-queue:create',
    pattern: '0 */1 * * *',
  },
  'daily-limit:reset': {
    name: 'daily-limit:reset',
    pattern: '0 0 * * *',
  },
};

(async () => {
  let createdCronjobs = [];

  for (const [cronjobName, cronjobOtherInfo] of Object.entries(cronjobs)) {
    const isCronjobNotExisted =
      (await Prisma.cronjob.count({
        where: {
          name: cronjobName,
        },
      })) === 0;
    if (isCronjobNotExisted) {
      await Prisma.cronjob.create({
        data: {
          name: cronjobName,
          pattern: cronjobOtherInfo.pattern,
        },
      });
      createdCronjobs.push({ ...cronjobOtherInfo, name: cronjobName });
    }
  }

  if (createdCronjobs.length === 0) {
    console.log('No cronjob created');
  } else {
    console.log(
      `created ${createdCronjobs.length} cronjob: ${createdCronjobs
        .map((cronjob) => cronjob.name)
        .join(', ')}`,
    );
  }

  const msEventsCreationJobs = await Prisma.createEventQueue.findMany({
    where: {
      msEventJson: null,
    },
  });
  for (const msEventsCreationJob of msEventsCreationJobs) {
    const msEventJson =
      outlookEventService.convertSchoolWebEventToOutlookEvents(
        JSON.parse(msEventsCreationJob.studySchedule),
      );
    await Prisma.createEventQueue.update({
      where: {
        id: msEventsCreationJob.id,
      },
      data: {
        msEventJson: JSON.stringify(msEventJson),
        attendeeSize: msEventJson.reduce((a, b) => a + b.attendees.length, 0),
      },
    });
  }
})();
