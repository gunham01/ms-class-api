const { ResponseType, HttpMethod } = require('@prisma/client');
const Prisma = require('../database/prisma.database');

class MsGraphApiLogger {
  /**
   * @param {{
   *  userEmail: string,
   *  method: HttpMethod,
   *  request: {url: string, body: string},
   *  response: {status: number, body: string},
   *  type: ResponseType
   * }} param0
   */
  log({ userEmail, method, request, response, type }) {
    return Prisma.msGraphApiLog.create({
      data: {
        user: {
          connect: { email: userEmail },
        },
        method,
        requestUrl: request.url,
        requestBody: request.body,
        responseStatus: response.status,
        responseBody: response.body,
        type,
      },
    });
  }
}

module.exports = {
  msGraphApiLogger: new MsGraphApiLogger(),
};
