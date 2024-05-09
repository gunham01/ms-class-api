const Prisma = require('../../database/prisma.database');

class MsClassService {
  /**
   *
   * @param {Omit<import('@prisma/client').Prisma.MsClassCreateInput, 'user'> & {userId: string}} msClass
   */
  create(msClass) {
    return Prisma.msClass.create({
      data: {
        name: msClass.name,
        description: msClass.description,
        user: {
          connect: {
            id: msClass.userId,
          },
        },
      },
    });
  }
}

module.exports = {
  MsClassService,
};
