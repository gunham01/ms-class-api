const nodeSchedule = require('node-schedule');
const { UserRepository } = require('../repository/user.repository');
const { CronjobUtils } = require('../utils/cronjob.utils');
const dayjs = require('dayjs');
const { CronjobRepository } = require('../repository/cronjob.repository');
const userRepository = new UserRepository();

const cronjobRepository = new CronjobRepository();

async function runCronjob() {
  const cronjobName = 'daily-limit:reset';
  const cronjob = await cronjobRepository.getByName(cronjobName);
  const scheduleJob = nodeSchedule.scheduleJob(
    cronjob.name,
    cronjob.pattern,
    async (fireDate) => {
      const currentTime = fireDate ?? new Date();
      CronjobUtils.informIsRunning(cronjob.name, currentTime);
      await cronjobRepository.updateLastRunAt(cronjob.name, currentTime);
      await userRepository.resetAllCounter();
    },
  );

  CronjobUtils.runCronjobIfNotRunYet(cronjob, scheduleJob);
}

runCronjob();
