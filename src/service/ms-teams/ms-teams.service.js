const { generateMsalClient } = require('../../graph');
const { MsClass } = require('../../model/graph-api/ms-class.model');
const msGraphAPI = require('../../ms_graph_api/index');
const { UserRepository } = require('../../repository/user.repository');
const { JwtManager } = require('../../security/jwt-manager');
const { PromiseUtils } = require('../../utils/promise.utils');
const { MsTokenService } = require('./ms-token.service');

class MsTeamsService {
  /**
   * @private
   * @readonly
   */
  userRepository = new UserRepository();

  /**
   * @param {{
   *  email: string,
   *  name: string,
   *  authToken: string,
   *  tenantId: string
   * }} param0
   */
  async getProfile({ authToken, tenantId, email, name }) {
    const msTokenService = new MsTokenService(generateMsalClient());
    const isUserExisted = await this.userRepository.existedByEmail(email);
    const userDbContext = isUserExisted
      ? await this.userRepository.getByEmail(email)
      : await this.userRepository.insert({
          name,
          email,
        });

    const { accessToken: msAccessToken, account } =
      await msTokenService.aquireTokenOnBehalfOf({
        token: authToken,
        tenantId,
      });
    const msRefreshToken = msTokenService.aquireRefreshToken(
      account.homeAccountId,
    );

    // if (!email.contains('@vnua.edu.vn')) {
    //   throw new Error('Định dạng email không hợp lệ');
    // }
    await this.userRepository.updateMsInfo(email, {
      name,
      accessToken: msAccessToken,
      refreshToken: msRefreshToken,
    });

    const accessToken = JwtManager.generateAccessToken({
      id: userDbContext.id,
      email: userDbContext.email,
      name: userDbContext.name,
      teacherId: userDbContext.teacherId,
    });
    await this.userRepository.updateAccessToken(
      userDbContext.email,
      accessToken,
    );

    return {
      userId: userDbContext.id,
      accessToken,
      teacherId: userDbContext.teacherId,
    };
  }

  /**
   * @param {{
   *  token: string,
   *  displayName: string,
   *  description: string
   * }} param0
   * @returns {Promise<string>} ID của class được tạo
   */
  async createClass({ token, displayName, description }) {
    const payloadClass = new MsClass({
      displayName,
      description,
    });
    const msGraphResponse = await msGraphAPI.createClass(token, payloadClass);
    const asyncOperationResponseUrl = `https://graph.microsoft.com/v1.0${msGraphResponse.headers.location}`;
    return this.pingUntilGetClassId(asyncOperationResponseUrl, token);
  }

  /**
   * @param {string} token
   */
  async getAllClass(token) {
    const msGraphResponse = await msGraphAPI.getClassList(token);
    return msGraphResponse.data.value;
  }

  /**
   *
   * @param {{
   *  token: string,
   *  classId: string,
   *  students: Student[]}
   * } param0
   */
  async addStudentToClass({ token, classId, students }) {
    let studentEmails =
      process.env.ENV === 'dev'
        ? ['637749@sv.vnua.edu.vn']
        : students.map(({ id }) => `${id}@sv.vnua.edu.vn`);

    while (studentEmails.length > 0) {
      try {
        await msGraphAPI.addMember(token, studentEmails, classId);
        return;
      } catch (error) {
        const errorContent = error.response.data;
        console.log(
          `Lỗi khi thêm sinh viên với lớp có ID ${classId}: `,
          errorContent,
        );

        const errorMessage = errorContent.error.message;
        const isThereNonexistedStudentEmail =
          errorMessage.includes('@sv.vnua.edu.vn');
        if (isThereNonexistedStudentEmail) {
          const nonexistedStudentEmails =
            errorMessage.match(/\d+@sv.vnua.edu.vn/g);
          studentEmails = studentEmails.filter(
            (email) => !nonexistedStudentEmails.includes(email),
          );
          continue;
        }

        throw errorContent;
      }
    }
  }

  /**
   * @param {any} msEventJson
   * @param {{ token: string }} param1
   * @returns {Promise<{originalValue: object, msEvent?: object, error?: object}>}
   */
  async createOnlineEvents(msEventJson, { token }) {
    if (process.env.ENV === 'dev') {
      msEventJson.attendees = [
        {
          emailAddress: {
            address: '637749@sv.vnua.edu.vn',
          },
        },
      ];
    }

    try {
      const { data: createOutlookEvent } = await msGraphAPI.createEvent(token, {
        event: msEventJson,
      });
      return {
        originalValue: msEventJson,
        msEvent: createOutlookEvent,
      };
    } catch (error) {
      return {
        originalValue: msEventJson,
        error: error.response.data.error ?? error,
      };
    }
  }

  /**
   * @param {object} event
   * @param {{groupId: string, msToken: string}} param1
   * @returns
   */
  createEvent(event, { msToken }) {
    return msGraphAPI.createEvent(msToken, {
      event,
    });
  }

  /**
   * @param {string} asyncOperationUrl
   * @param {string} accessToken
   */
  async pingUntilGetClassId(asyncOperationUrl, accessToken) {
    const delayInMs = 5000;
    const maxRetryTime = 7;
    for (let retryCount = 0; retryCount < maxRetryTime; retryCount++) {
      const asyncOperationResponse =
        await msGraphAPI.pingCreateClassAsycnOperation(
          asyncOperationUrl,
          accessToken,
        );

      if (asyncOperationResponse.data.status === 'succeeded') {
        return asyncOperationResponse.data.targetResourceId;
      } else {
        await PromiseUtils.delay(delayInMs);
      }
    }
  }

  /**
   * @param {{
   *  classId: string,
   *  displayName: string,
   *  description: string,
   *  token: string
   * }} param0
   */
  async createStudyScheduleNotificationChannel({
    classId,
    displayName,
    description,
    token,
  }) {
    const msGraphResponse = await msGraphAPI.createChannel(token, {
      teamId: classId,
      channel: { displayName, description },
    });
    return msGraphResponse.data;
  }

  async getNotificationChannel({ classId, token }) {
    const msGraphResponse = await msGraphAPI.getChannel(token, {
      teamId: classId,
      channelDisplayName: 'Schedule',
    });
    return msGraphResponse.data.value[0];
  }

  /**
   * @param {string} msToken
   * @param {{
   *  classId: string,
   *  channelId: string,
   *  scheduleName: string,
   *  scheduleInfo: string
   * }} param1
   */
  async informStudySchedule(
    msToken,
    { classId, channelId, scheduleName, scheduleInfo },
  ) {
    const msGraphResponse = await msGraphAPI.chatToChannel(msToken, {
      subject: scheduleName,
      teamId: classId,
      channelId,
      chatContentInHtml: scheduleInfo,
    });
    return msGraphResponse.data;
  }

  async getTeamAllEvents({ msToken, teamId, page }) {
    const msGraphResponse = await msGraphAPI.getAllTeamEvent(msToken, {
      teamId,
      page,
      size: 10,
    });

    return msGraphResponse.data.value;
  }

  async cancelTeamEvent({ msToken, teamId, eventId }) {
    const msGraphResponse = await msGraphAPI.cancelGroupEvent(msToken, {
      teamId,
      eventId,
    });

    return msGraphResponse.data.value;
  }
}

module.exports = { msTeamsService: new MsTeamsService() };
