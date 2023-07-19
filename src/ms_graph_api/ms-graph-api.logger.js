const { ResponseType, HttpMethod } = require('@prisma/client');
const Prisma = require('../database/prisma.database');

class MsGraphApiLogger {
  /**
   * @param {{
   *  userId: string,
   *  method: HttpMethod,
   *  request: {url: string, body: string},
   *  response: {status: number, body: string},
   *  type: ResponseType
   * }} param0
   */
  log({ userId, method, request, response, type }) {
  // console.log('[LOG] : arguments:', arguments)
  return Prisma.msGraphApiLog.create({
      data: {
        user: {
          connect: { id: userId },
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
