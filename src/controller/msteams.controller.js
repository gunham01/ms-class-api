const { HttpResponse, HttpStatus } = require('../model/http-response.model');
const { UserRepository } = require('../repository/user.repository');
const { msTeamsService } = require('../service/ms-teams/ms-teams.service');
const { BaseController } = require('./base.controller');
const { createEventQueue } = require('../queue/create-event.queue');
const { DAILY_EMAIL_LIMIT } = require('../constant/ms-team.constant');
const { Logger } = require('../utils/logger.utils');
const { PromiseUtils } = require('../utils/promise.utils');
const { userService } = require('../service/user.service');
const { outlookEventService } = require('../service/outlook-event.service');
const msEventRepository = require('../repository/ms-event.repository');
const { MsClassService } = require('../service/ms-class/ms-class.service');

/**
 * @typedef {import("../model/student.model").Student} Student
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 */

class MsteamsController extends BaseController {
  /**
   * @private
   * @readonly
   */
  userRepository = new UserRepository();

  /**
   * @param {Request} req
   */
  async getProfile(req) {
    try {
      const { authToken, tenantId, email, name } = req.body;
      const response = await msTeamsService.getProfile({
        authToken,
        tenantId,
        email,
        name,
      });

      return HttpResponse.ok(response);
    } catch (error) {
      Logger.logError(error, {
        message: 'Lỗi khi lấy thông tin người dùng:',
      });
      return HttpResponse.badRequest(error.response?.data.error ?? error);
    }
  }

  /**
   * @public
   * @param {Request} req
   */
  async createClasses(req) {
    try {
      const {
        token: authToken,
        tenantId,
        data: [data],
      } = req.body;
      const { msAccessToken: msToken } = await userService.saveMsInfoToDb(
        authToken,
        tenantId,
      );
      const currentUserEmail = req['user'].email;
      const allClasses = await msTeamsService.getAllClass(msToken);
      await PromiseUtils.delay(1000);

      for (const creatingClass of data) {
        const isClassExisted = allClasses.some(
          (item) => item.displayName === creatingClass.displayName,
        );

        if (isClassExisted) {
          return HttpResponse.status(HttpStatus.CONFLICT).body(
            `Nhóm lớp đã tồn tại`,
          );
        }

        const classId = await msTeamsService.createClass({
          token: msToken,
          ...creatingClass,
        });
        await new MsClassService().create({
          name: creatingClass.displayName,
          description: creatingClass.description,
          userId: req['user'].id,
          msClassId: classId,
        });
        await msTeamsService.addStudentToClass({
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
      if (error instanceof HttpResponse) {
        return error;
      }

      const errorInfo = error.response?.data.error;
      const isMsTokenInvalidOrExpired = [
        'InvalidAuthenticationToken',
        'Unauthorized',
      ].includes(errorInfo?.code);
      if (isMsTokenInvalidOrExpired) {
        return HttpResponse.status(HttpStatus.FORBIDDEN).body();
      }

      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
        errorInfo ?? error,
      );
    }
  }

  /**
   * @param {string} userEmail
   */
  async getMsToken(userEmail) {
    const user = await this.userRepository.getByEmail(userEmail);
    return user.msAccessToken;
  }

  /**
   *
   * @param {object} creatingClass
   * @param {{ msClassId: string, organizerEmail: string }} param1
   */
  async addCreatingClassEventsToQueue(
    creatingClass,
    { msClassId, organizerEmail },
  ) {
    const user = await this.userRepository.getByEmail(organizerEmail);
    const userId = user.id;
    const outlookEvents =
      outlookEventService.convertSchoolWebEventToOutlookEvents(creatingClass);
    return msEventRepository.createInBatch(outlookEvents, {
      userId,
      classId: msClassId,
    });
  }

  /**
   * @param {import('express').Request} req
   */
  async cancelAllClassEvents(req) {
    const { email: userEmail, classId } = req.body;
    const currentUser = await this.userRepository.getByEmail(userEmail);
    const msToken = currentUser.msAccessToken;
    const { todayEmailSentCount } = currentUser;
    let sentEmailCount = 0;
    let totalEmailSent = 0;
    let currentFetchedEvents = [];
    let [success, fail] = [0, 0];
    let page = 1;

    do {
      try {
        currentFetchedEvents = await msTeamsService.getTeamAllEvents({
          msToken,
          page: page++,
          teamId: classId,
        });
      } catch (error) {
        const errorLog = Logger.logError(error, {
          message: 'Lỗi khi lấy tất cả event:',
        });
        return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
          errorLog,
        );
      }
      for (const { id, attendees } of currentFetchedEvents) {
        const attendeesSize = attendees.length;
        console.log('attendeesSize:', attendeesSize);
        if (
          todayEmailSentCount + sentEmailCount + attendeesSize >=
          DAILY_EMAIL_LIMIT
        ) {
          continue;
        }

        await PromiseUtils.delay(1500);
        try {
          await msTeamsService.cancelTeamEvent({
            msToken: currentUser.msAccessToken,
            teamId: classId,
            eventId: id,
          });
          success++;
          sentEmailCount += attendeesSize;
          totalEmailSent += attendeesSize;
        } catch (error) {
          fail++;
        }
      }
    } while (currentFetchedEvents.length > 0);

    await this.userRepository.increaseEmailCounter(
      currentUser.id,
      sentEmailCount,
    );
    return HttpResponse.ok({ success, fail, sentEmailCount });
  }
}

module.exports = {
  MsteamsController,
};
