const Prisma = require('../database/prisma.database');

class MsEventRepository {
  /**
   * @param {string} id
   * @param {string} userId
   */
  create(id, userId) {
    return Prisma.msEvent.create({
      data: {
        id,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}

module.exports = {
  MsEventRepository,
};
