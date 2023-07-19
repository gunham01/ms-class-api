const { HttpResponse, HttpStatus } = require('../model/http-response.model');
const { UserRepository } = require('../repository/user.repository');
const { msTeamService } = require('../service/ms-teams/ms-teams.service');
const clientConstant = require('../constant/client.constant');
const { BaseController } = require('./base.controller');
const { createEventQueue } = require('../queue/create-event.queue');
const { DAILY_EMAIL_LIMIT } = require('../constant/ms-team.constant');
const { msTokenService } = require('../service/ms-teams/ms-token.service');
const { Logger } = require('../utils/logger.utils');
const { PromiseUtils } = require('../utils/promise.utils');

/**
 * @typedef {import("../model/student.model").Student} Student
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 */

class MsteamsController extends BaseController {
  _userRepository = new UserRepository();

  /**
   * @param {Request} req
   */
  async getProfile(req) {
    try {
      const { token } = req.body;
      return msTeamService.getProfile(token);
    } catch (error) {
      Logger.logError(error, {
        message: 'Lỗi khi lấy thông tin người dùng:',
      });
    }
  }

  /**
   * @public
   * @param {Request} req
   * @returns {Promise<HttpResponse>}
   */
  async signIn(req) {
    const params = {
      scopes: process.env.OAUTH_SCOPES.split(' '),
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    };

    try {
      const authUrl = await req.app.locals.msalClient.getAuthCodeUrl(params);
      return HttpResponse.status(HttpStatus.OK).body(authUrl);
    } catch (error) {
      Logger.logError(error, { message: 'Lỗi khi đăng nhập MS Teasm:' });
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
        `Error: ${error}`
      );
    }
  }

  /**
   * @public
   * @param {Request} req
   * @param {Response} res
   */
  async callBack(req, res) {
    try {
      const { accessToken, accessTokenExpireOn, refreshToken, account } =
        await msTokenService.aquireTokenByCode({
          code: req.query.code,
          redirectUri: process.env.OAUTH_REDIRECT_URI,
        });
      await this._userRepository.updateMsInfo(account.username, {
        msAccessToken: accessToken,
        msRefreshToken: refreshToken,
        msAccessTokenExpireOn: accessTokenExpireOn,
        accountInfo: account,
      });
      return res.redirect(
        `${clientConstant.getClientUrl()}?code=${accessToken}&email=${
          account.username
        }`
      );
      // res.redirect('https://google.com');
    } catch (error) {
      Logger.logError(error, { message: 'Lỗi trong hàm callback:' });
      return res.redirect(`${clientConstant.getClientUrl()}?error=true`);
      // res.redirect('https://youtube.com');
    }
  }

  /**
   * @public
   * @param {Request} req
   */
  async createClasses(req) {
    try {
      const { data } = req.body;
      const currentUserEmail = req['user'].email;
      const msToken = await this.getMsToken(currentUserEmail);
      const allClasses = await msTeamService.getAllClass(msToken);
      for (const creatingClass of data) {
        if (process.env.ENV === 'dev') {
          creatingClass.hasOnlineMeeting = true;
        }

        const isClassExisted = allClasses.some(
          (item) => item.displayName === creatingClass.displayName
        );

        if (isClassExisted) {
          return HttpResponse.status(HttpStatus.CONFLICT).body(
            `Nhóm lớp đã tồn tại`
          );
        }

        const classId = await msTeamService.createClass({
          token: msToken,
          ...creatingClass,
        });
        await msTeamService.addStudentToClass({
          token: msToken,
          classId,
          students: creatingClass.students.value,
        });

        if (creatingClass.hasOnlineMeeting) {
          await this.addCreatingClassEventsToQueue(creatingClass, {
            msClassId: classId,
            organizerEmail: currentUserEmail,
          });
        }
      }

      return HttpResponse.status(HttpStatus.OK).body();
    } catch (error) {
      Logger.logError(error, { message: 'Lỗi khi tạo các lớp học:' });

      const errorInfo = error.response?.data.error;
      if (
        ['InvalidAuthenticationToken', 'Unauthorized'].includes(errorInfo?.code)
      ) {
        return HttpResponse.status(HttpStatus.FORBIDDEN).body();
      }

      if (error instanceof HttpResponse) {
        return error;
      }

      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
        errorInfo ?? error
      );
    }
  }

  /**
   * @param {string} userEmail
   */
  async getMsToken(userEmail) {
    const user = await this._userRepository.getByEmail(userEmail);
    return user.msAccessToken;
  }

  /**
   *
   * @param {object} creatingClass
   * @param {{ msClassId: string, organizerEmail: string }} param1
   */
  async addCreatingClassEventsToQueue(creatingClass, { msClassId, organizerEmail }) {
    const user = await this._userRepository.getByEmail(organizerEmail);

    await createEventQueue.add({
      classId: msClassId,
      creatingClass,
      userId: user.id,
    });
  }

  /**
   *
   * @param {import('express').Request} req
   */
  async cancelAllClassEvents(req) {
    const { email: userEmail, classId } = req.body;
    const currentUser = await this._userRepository.getByEmail(userEmail);
    const msToken = currentUser.msAccessToken;
    let { todayEmailSentCount } = currentUser;
    let totalEmailSent = 0;
    let currentFetchedEvents = [];
    let [success, fail] = [0, 0];
    let page = 1;

    do {
      try {
        currentFetchedEvents = await msTeamService.getTeamAllEvents({
          msToken,
          page: page++,
          teamId: classId,
        });
      } catch (error) {
        const errorLog = Logger.logError(error, {
          message: 'Lỗi khi lấy tất cả event:',
        });
        return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
          errorLog
        );
      }
      for (const { id, attendees } of currentFetchedEvents) {
        const attendeesSize = attendees.length;
        console.log('attendeesSize:', attendeesSize);
        if (todayEmailSentCount + attendeesSize >= DAILY_EMAIL_LIMIT) {
          continue;
        }

        await PromiseUtils.delay(1500);
        try {
          await msTeamService.cancelTeamEvent({
            msToken: currentUser.msAccessToken,
            teamId: classId,
            eventId: id,
          });
          success++;
          todayEmailSentCount += attendeesSize;
          totalEmailSent += attendeesSize;
        } catch (error) {
          fail++;
        }
      }
    } while (currentFetchedEvents.length > 0);

    await this._userRepository.setEmailCounter(
      currentUser.id,
      todayEmailSentCount
    );
    return HttpResponse.ok({ success, fail, totalEmailSent });
  }
}

module.exports = {
  MsteamsController,
};
