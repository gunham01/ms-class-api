const Prisma = require('../database/prisma.database');

class CronjobRepository {
  /**
   * @param {string} name
   */
  getByName(name) {
    return Prisma.cronjob.findUnique({
      where: { name },
    });
  }

  /**
   * @param {string} name
   * @param {Date} lastRunAt
   */
  updateLastRunAt(name, lastRunAt) {
    return Prisma.cronjob.update({
      where: { name },
      data: { lastRunAt },
    });
  }
}

module.exports = {
  CronjobRepository,
};
