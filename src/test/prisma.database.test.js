const { HttpMethod, ResponseType } = require('@prisma/client');
const Prisma = require('../database/prisma.database');

test('Should run with no thrown error', async () => {
  await Prisma.msGraphApiLog.create({
    data: {
      user: {
        connect: { id: '176b700e-788c-4718-8465-2542c5253507' },
      },
      method: HttpMethod.GET,
      requestUrl: '/me',
      requestBody: 'null',
      responseStatus: 200,
      responseBody: 'null',
      type: ResponseType.SUCCESS,
    },
  });
  
});
