const nodeSchedule = require('node-schedule');
const { UserRepository } = require('../repository/user.repository');
const cronjobs = require('./cronjob-list.json');
const { CronjobUtils } = require('../utils/cronjob.utils');
const dayjs = require('dayjs');
const userRepository = new UserRepository();

const job = nodeSchedule.scheduleJob(
  cronjobs.resetDailyLimit.name,
  cronjobs.resetDailyLimit.pattern,
  async (fireDate) => {
    CronjobUtils.informIsRunning(cronjobs.resetDailyLimit.name, fireDate);
    await CronjobUtils.updateLastRunAt(cronjobs.resetDailyLimit.name, fireDate);

    await userRepository.resetAllCounter();
  }
);

const lastRunAt = dayjs(new Date(cronjobs.resetDailyLimit.lastRunAt));
if (lastRunAt && dayjs().startOf('day').isAfter(lastRunAt)) {
  job.invoke();
}
