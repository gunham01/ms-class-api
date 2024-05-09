const { Prisma } = require('.prisma/client');
const prisma = require('../database/prisma.database.js');
const { User } = require('../model/user.model.js');

class UserRepository {
  /**
   * @param {Prisma.UserCreateInput} user
   */
  async insert(user) {
    return prisma.user.create({
      data: user,
    });
  }

  getAll() {
    return prisma.user.findMany();
  }

  async getAllUserIds() {
    const users = await prisma.user.findMany({
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
      (await prisma.user.count({
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
      (await prisma.user.count({
        where: {
          teacherId,
        },
      })) > 0
    );
  }

  updateTeacherId(id, teacherId) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        teacherId,
      },
    });
  }

  /**
   * @public
   * @param {string} email
   */
  getByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * @public
   * @param {string} msToken
   */
  getByMsToken(msToken) {
    return prisma.user.findFirstOrThrow({
      where: { msAccessToken: msToken },
    });
  }

  /**
   * @public
   * @param {string} teacherId
   */
  getByTeacherId(teacherId) {
    return prisma.user.findFirstOrThrow({
      where: { teacherId },
    });
  }

  /**
   * @public
   * @param {string} userUsername
   * @param {string} token
   */
  updateAccessToken(userUsername, token) {
    return prisma.user.update({
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
   *  name: string
   *  accessToken?: string,
   *  refreshToken?: string,
   *  accessTokenExpireOn?: Date,
   * }} param0
   */
  updateMsInfo(
    userEmail,
    { name, accessToken, refreshToken, accessTokenExpireOn },
  ) {
    return prisma.user.update({
      where: {
        email: userEmail,
      },
      data: {
        name,
        msAccessToken: accessToken,
        msRefreshToken: refreshToken,
        msAccessTokenExpireOn: accessTokenExpireOn,
      },
    });
  }

  async isJwtExisted(jwt) {
    const userWithJwtCount = await prisma.user.count({
      where: {
        accessToken: jwt,
      },
    });
    return userWithJwtCount > 0;
  }

  resetAllCounter() {
    return prisma.user.updateMany({
      data: {
        todayEmailSentCount: 0,
      },
    });
  }

  /**
   * @param {string} id
   * @param {number} quantity
   */
  increaseEmailCounter(id, quantity) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        todayEmailSentCount: { increment: quantity },
      },
    });
  }
}

module.exports = { UserRepository };
