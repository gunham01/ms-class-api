const fs = require('fs/promises');
const cronjobs = require('../cronjob/cronjob-list.json');
const dayjs = require('dayjs');

class CronjobUtils {
  /**
   * @param {string} cronjobName
   * @param {Date} datetime
   */
  static informIsRunning(cronjobName, datetime) {
    console.log(
      `[CRONJOB] ${cronjobName} runs at ${dayjs(datetime).format(
        'HH:mm:ss DD/MM/YYYY'
      )}`
    );
  }

  /**
   * @param {string} cronjobName
   * @param {Date} datetime
   */
  static async updateLastRunAt(cronjobName, datetime) {
    const cronjobsFilePath = `${process.cwd()}/src/cronjob/cronjob-list.json`;
    cronjobs[cronjobName].lastRunAt = datetime.toString();

    return fs.writeFile(cronjobsFilePath, JSON.stringify(cronjobs, null, 2));
  }
}

module.exports = {
  CronjobUtils,
};
