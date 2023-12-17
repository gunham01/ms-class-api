const nodeSchedule = require('node-schedule');
const { UserRepository } = require('../repository/user.repository');
const cronjobs = require('./cronjob-list.json');
const { CronjobUtils } = require('../utils/cronjob.utils');
const dayjs = require('dayjs');
const userRepository = new UserRepository();

const job = nodeSchedule.scheduleJob(
  cronjobs['daily-limit:reset'].name,
  cronjobs['daily-limit:reset'].pattern,
  async (fireDate) => {
    const currentDate = fireDate ?? new Date();
    CronjobUtils.informIsRunning(
      cronjobs['daily-limit:reset'].name,
      currentDate
    );
    await CronjobUtils.updateLastRunAt(
      cronjobs['daily-limit:reset'].name,
      currentDate
    );

    await userRepository.resetAllCounter();
  }
);

const lastRunAt = dayjs(new Date(cronjobs['daily-limit:reset'].lastRunAt));
if (lastRunAt && dayjs().startOf('day').isAfter(lastRunAt)) {
  job.invoke();
}
