const Prisma = require('../database/prisma.database.js');
const { User } = require('../model/user.model.js');

class UserRepository {
  /**
   * @param {User} user
   */
  async insert(user) {
    return Prisma.user.create({
      data: user,
    });
  }

  getAll() {
    return Prisma.user.findMany();
  }

  async getAllUserIds() {
    const users = await Prisma.user.findMany({
      select: {
        id: true,
      },
    });
    return users.map(({ id }) => id);
  }

  /**
   *
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async existedByEmail(email) {
    return (
      (await Prisma.user.count({
        where: {
          email,
        },
      })) > 0
    );
  }

  /**
   *
   * @param {string} teacherId
   * @returns {Promise<boolean>}
   */
  async existedByTeacherId(teacherId) {
    return (
      (await Prisma.user.count({
        where: {
          teacherId,
        },
      })) > 0
    );
  }

  /**
   * @public
   * @param {string} email
   */
  getByEmail(email) {
    return Prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * @public
   * @param {string} msToken
   */
  getByMsToken(msToken) {
    return Prisma.user.findFirstOrThrow({
      where: { msAccessToken: msToken },
    });
  }

  /**
   * @public
   * @param {string} teacherId
   */
  getByTeacherId(teacherId) {
    return Prisma.user.findFirstOrThrow({
      where: { teacherId },
    });
  }

  /**
   * @public
   * @param {string} userUsername
   * @param {string} token
   */
  updateAccessToken(userUsername, token) {
    return Prisma.user.update({
      where: {
        email: userUsername,
      },
      data: {
        accessToken: token,
      },
    });
  }
  /**
   * @public
   * @param {string} userEmail
   * @param {{
   *  msAccessToken?: string,
   *  msRefreshToken?: string,
   *  msAccessTokenExpireOn?: Date,
   *  accountInfo?: import('@azure/msal-common').AccountInfo
   * }} param0
   */
  updateMsInfo(
    userEmail,
    { msAccessToken, msRefreshToken, msAccessTokenExpireOn, accountInfo }
  ) {
    return Prisma.user.update({
      where: {
        email: userEmail,
      },
      data: {
        name: accountInfo?.name,
        msAccessToken,
        msRefreshToken,
        msAccessTokenExpireOn,
        msAccountInfo: JSON.stringify(accountInfo),
      },
    });
  }

  async isJwtExisted(jwt) {
    const userWithJwtCount = await Prisma.user.count({
      where: {
        accessToken: jwt,
      },
    });
    return userWithJwtCount > 0;
  }

  resetAllCounter() {
    return Prisma.user.updateMany({
      data: {
        todayEmailSentCount: 0,
      },
    });
  }

  /**
   * @param {string} id
   * @param {number} quantity
   */
  setEmailCounter(id, quantity) {
    return Prisma.user.update({
      where: {
        id,
      },
      data: {
        todayEmailSentCount: quantity,
      },
    });
  }
}

module.exports = { UserRepository };
